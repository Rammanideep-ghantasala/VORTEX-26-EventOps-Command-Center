package com.vortex.server.service

import com.vortex.server.exception.BadRequestException
import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.ResourceNotFoundException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.*
import com.vortex.server.repository.*
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
    private val gateLogRepository: GateLogRepository
) {

    @Transactional
    fun registerWalkIn(request: WalkInRequest, operatorEmail: String): AttendeeResponse {
        if (attendeeRepository.existsByEmail(request.email)) {
            throw ConflictException("Attendee with email '${request.email}' is already registered")
        }
        val operator = userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        // Generate unique Registration ID and QR code
        val regId = generateRegistrationId()
        val qrCode = "QR-${regId}-${UUID.randomUUID().toString().take(6).uppercase()}"

        val attendee = Attendee(
            registrationId = regId,
            qrCode = qrCode,
            fullName = request.fullName,
            email = request.email,
            phone = request.phone,
            college = request.college,
            registrationType = RegistrationType.WALK_IN,
            paymentMode = request.paymentMode,
            paymentReference = request.paymentReference,
            amountPaid = request.amountPaid,
            workshops = request.workshops.toTypedArray(),
            competitions = request.competitions.toTypedArray(),
            housingRequired = request.housingRequired
        )
        return AttendeeResponse.from(attendeeRepository.save(attendee))
    }

    @Transactional
    fun checkIn(request: CheckInRequest, operatorEmail: String): CheckInResponse {
        val operator = userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        val attendee = attendeeRepository.findByRegistrationIdOrQrCode(request.query)
            .orElseThrow { ResourceNotFoundException("Attendee", request.query) }

        if (attendee.checkedIn) {
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
        // Search by email, registrationId, or qrCode
        val attendee = attendeeRepository.findByEmail(query)
            .or { attendeeRepository.findByRegistrationIdOrQrCode(query) }
            .orElseThrow { ResourceNotFoundException("Attendee", query) }
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
        val regType = type?.let { runCatching { RegistrationType.valueOf(it.uppercase()) }.getOrNull() }
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        val result = attendeeRepository.searchAttendees(search, regType, checkedIn, pageable)
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

    private fun generateRegistrationId(): String {
        val count = attendeeRepository.count() + 1
        return "VTX-2026-${count.toString().padStart(4, '0')}"
    }
}

