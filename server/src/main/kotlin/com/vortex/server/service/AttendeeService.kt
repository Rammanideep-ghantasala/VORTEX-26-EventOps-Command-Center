package com.vortex.server.service

import com.vortex.server.exception.BadRequestException
import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.ResourceNotFoundException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.*
import com.vortex.server.repository.*
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class AttendeeService(
    private val attendeeRepository: AttendeeRepository,
    private val userRepository: UserRepository,
    private val gateLogRepository: GateLogRepository,
    private val housingAllocationRepository: HousingAllocationRepository,
    private val workshopRepository: WorkshopRepository,
    private val workshopRegistrationRepository: WorkshopRegistrationRepository,
    private val eventRegistrationRepository: EventRegistrationRepository,
    private val jdbcTemplate: JdbcTemplate
) {

    @Transactional
    fun registerWalkIn(request: WalkInRequest, operatorEmail: String): AttendeeResponse {
        val email = request.email.trim().lowercase()
        val phone = request.phone.trim()
        if (attendeeRepository.existsByEmail(email)) {
            throw ConflictException("Attendee with email '$email' is already registered")
        }
        if (attendeeRepository.existsByPhone(phone)) {
            throw ConflictException("Attendee with phone '$phone' is already registered")
        }
        userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        val requestedWorkshopNames = request.workshops
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .distinct()
            .sorted()

        val lockedWorkshops = requestedWorkshopNames.map { name ->
            val workshop = workshopRepository.findByNameForUpdate(name)
                .orElseThrow { BadRequestException("Unknown workshop selected: $name") }
            val confirmedCount = workshopRegistrationRepository.countByWorkshopIdAndStatus(
                workshop.id,
                WorkshopRegStatus.CONFIRMED
            )
            if (confirmedCount >= workshop.capacity) {
                throw ConflictException("Workshop '${workshop.name}' is fully booked")
            }
            workshop
        }

        val competitions = request.competitions
            .map { it.trim() }
            .filter { it.isNotBlank() }
            .distinct()

        // Generate unique Registration ID and QR code
        val regId = generateRegistrationId()
        val qrCode = "QR-${regId}-${UUID.randomUUID().toString().take(6).uppercase()}"

        val attendee = Attendee(
            registrationId = regId,
            qrCode = qrCode,
            fullName = request.fullName.trim(),
            email = email,
            phone = phone,
            college = request.college.trim(),
            gender = request.gender,
            department = request.department ?: "Computer Science & Engineering",
            yearOfStudy = request.yearOfStudy ?: "3rd Year",
            registrationType = RegistrationType.WALK_IN,
            paymentMode = request.paymentMode,
            paymentReference = request.paymentReference,
            amountPaid = request.amountPaid,
            workshops = requestedWorkshopNames.toTypedArray(),
            competitions = competitions.toTypedArray(),
            housingRequired = request.housingRequired
        )
        val saved = attendeeRepository.save(attendee)

        lockedWorkshops.forEach { workshop ->
            workshopRegistrationRepository.save(
                WorkshopRegistration(
                    workshop = workshop,
                    attendee = saved,
                    status = WorkshopRegStatus.CONFIRMED
                )
            )
        }

        competitions.forEach { eventName ->
            eventRegistrationRepository.save(
                EventRegistration(
                    eventName = eventName,
                    attendee = saved,
                    status = "CONFIRMED"
                )
            )
        }

        return AttendeeResponse.from(saved)
    }

    @Transactional
    fun checkIn(request: CheckInRequest, operatorEmail: String): CheckInResponse {
        val query = request.query.trim()
        val operator = userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        val attendee = attendeeRepository.findForCheckIn(query)
            .orElseThrow { ResourceNotFoundException("Attendee", query) }

        if (attendee.checkedIn) {
            gateLogRepository.save(
                GateLog(
                    attendee = attendee,
                    action = "DUPLICATE_CHECK_IN",
                    gateLocation = request.gateLocation,
                    operator = operator,
                    note = request.note ?: "Duplicate entry attempt"
                )
            )
            return CheckInResponse(
                success = false,
                message = "⚠️ Already checked in at ${attendee.checkedInAt} via ${attendee.checkedInGate}",
                attendee = AttendeeResponse.from(attendee),
                alreadyCheckedIn = true
            )
        }

        attendee.checkedIn = true
        attendee.checkedInAt = Instant.now()
        attendee.checkedInGate = request.gateLocation
        attendee.checkedInBy = operator
        attendeeRepository.save(attendee)

        // Immutable audit log entry
        gateLogRepository.save(
            GateLog(
                attendee = attendee,
                action = "CHECK_IN",
                gateLocation = request.gateLocation,
                operator = operator,
                note = request.note
            )
        )

        return CheckInResponse(
            success = true,
            message = "✅ Welcome, ${attendee.fullName}! Check-in successful.",
            attendee = AttendeeResponse.from(attendee)
        )
    }

    @Transactional(readOnly = true)
    fun searchAttendee(query: String): AttendeeResponse {
        val normalized = query.trim()
        val attendee = attendeeRepository.findByEmail(normalized.lowercase())
            .or { attendeeRepository.findByRegistrationIdOrQrCode(normalized) }
            .orElseThrow { ResourceNotFoundException("Attendee", normalized) }
        return AttendeeResponse.from(attendee)
    }

    @Transactional(readOnly = true)
    fun getAttendees(
        page: Int,
        size: Int,
        search: String?,
        type: String?,
        checkedIn: Boolean?
    ): PagedResponse<AttendeeResponse> {
        val boundedPage = page.coerceAtLeast(0)
        val boundedSize = size.coerceIn(1, 100)
        val normalizedSearch = search?.trim()?.take(100)?.ifBlank { null }
        val regType = type?.let { runCatching { RegistrationType.valueOf(it.uppercase()) }.getOrNull() }
        val pageable = PageRequest.of(boundedPage, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"))
        val result = attendeeRepository.searchAttendees(normalizedSearch, regType, checkedIn, pageable)
        return PagedResponse(
            data = result.content.map { AttendeeResponse.from(it) },
            page = result.number,
            size = result.size,
            totalElements = result.totalElements,
            totalPages = result.totalPages
        )
    }

    @Transactional(readOnly = true)
    fun getAttendeeById(id: Long): AttendeeResponse {
        val attendee = attendeeRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Attendee", id.toString()) }
        return AttendeeResponse.from(attendee)
    }

    @Transactional(readOnly = true)
    fun getAttendeeProfile(id: Long): AttendeeProfileResponse {
        val attendee = attendeeRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Attendee", id.toString()) }

        // 1. Accommodation
        val allocations = housingAllocationRepository.findAllByAttendeeIdOrderByAllocatedAtDesc(id)
        val currentAlloc = allocations.firstOrNull { it.status == AllocationStatus.ALLOCATED || it.status == AllocationStatus.CHECKED_IN }
            ?.let { HousingAllocationResponse.from(it) }
        val historyAllocs = allocations.map { HousingAllocationResponse.from(it) }

        // 2. Workshops
        var workshopRegs = workshopRegistrationRepository.findAllByAttendeeIdOrderByRegisteredAtDesc(id)
            .map {
                WorkshopRegistrationDto(
                    id = it.id,
                    workshopId = it.workshop.id,
                    workshopName = it.workshop.name,
                    workshopCode = it.workshop.code,
                    status = it.status,
                    registeredAt = it.registeredAt,
                    attendanceStatus = if (attendee.checkedIn) "PRESENT" else "REGISTERED"
                )
            }
        // Fallback to array if no registrations table entries exist for this attendee
        if (workshopRegs.isEmpty() && attendee.workshops.isNotEmpty()) {
            workshopRegs = attendee.workshops.mapIndexed { idx, name ->
                WorkshopRegistrationDto(
                    id = (idx + 1).toLong(),
                    workshopId = (idx + 1).toLong(),
                    workshopName = name,
                    workshopCode = "WS-0${idx + 1}",
                    status = WorkshopRegStatus.CONFIRMED,
                    registeredAt = attendee.createdAt,
                    attendanceStatus = if (attendee.checkedIn) "PRESENT" else "REGISTERED"
                )
            }
        }

        // 3. Events
        var eventRegs = eventRegistrationRepository.findAllByAttendeeIdOrderByRegisteredAtDesc(id)
            .map {
                EventRegistrationDto(
                    id = it.id,
                    eventName = it.eventName,
                    status = it.status,
                    registeredAt = it.registeredAt,
                    attendanceStatus = if (attendee.checkedIn) "PRESENT" else "REGISTERED"
                )
            }
        // Fallback to competitions array
        if (eventRegs.isEmpty() && attendee.competitions.isNotEmpty()) {
            eventRegs = attendee.competitions.mapIndexed { idx, name ->
                EventRegistrationDto(
                    id = (idx + 1).toLong(),
                    eventName = name,
                    status = "CONFIRMED",
                    registeredAt = attendee.createdAt,
                    attendanceStatus = if (attendee.checkedIn) "PRESENT" else "REGISTERED"
                )
            }
        }

        // 4. Gate Logs
        val gateLogs = gateLogRepository.findByAttendeeIdOrderByLoggedAtDesc(id).map {
            GateLogDto(
                id = it.id,
                action = it.action,
                gateLocation = it.gateLocation,
                operatorName = it.operator.name,
                note = it.note,
                loggedAt = it.loggedAt
            )
        }

        return AttendeeProfileResponse(
            personalInfo = AttendeeResponse.from(attendee),
            currentAccommodation = currentAlloc,
            accommodationHistory = historyAllocs,
            workshopRegistrations = workshopRegs,
            totalWorkshops = workshopRegs.size,
            eventRegistrations = eventRegs,
            totalEvents = eventRegs.size,
            gateLogs = gateLogs
        )
    }

    private fun generateRegistrationId(): String {
        val nextValue = jdbcTemplate.queryForObject(
            "select nextval('attendee_registration_seq')",
            Long::class.java
        ) ?: throw IllegalStateException("Could not generate registration sequence")
        return "VTX-2026-${nextValue.toString().padStart(4, '0')}"
    }
}
