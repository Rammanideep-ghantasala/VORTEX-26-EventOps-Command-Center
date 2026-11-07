package com.vortex.server.service

import com.vortex.server.exception.BadRequestException
import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.ResourceNotFoundException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.*
import com.vortex.server.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class WorkshopService(
    private val workshopRepository: WorkshopRepository,
    private val workshopRegistrationRepository: WorkshopRegistrationRepository,
    private val attendeeRepository: AttendeeRepository
) {

    @Transactional(readOnly = true)
    fun getAllWorkshops(): List<WorkshopResponse> {
        return workshopRepository.findAll().map { w ->
            val confirmedCount = workshopRegistrationRepository.countByWorkshopIdAndStatus(w.id, WorkshopRegStatus.CONFIRMED)
            WorkshopResponse.from(w, confirmedCount)
        }
    }

    @Transactional(readOnly = true)
    fun getWorkshopById(id: Long): WorkshopResponse {
        val w = workshopRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Workshop", id.toString()) }
        val confirmedCount = workshopRegistrationRepository.countByWorkshopIdAndStatus(w.id, WorkshopRegStatus.CONFIRMED)
        return WorkshopResponse.from(w, confirmedCount)
    }

    @Transactional
    fun createWorkshop(request: CreateWorkshopRequest): WorkshopResponse {
        if (request.capacity < 1 || request.capacity > 100) {
            throw BadRequestException("Workshop capacity must be between 1 and 100 participants")
        }
        if (workshopRepository.existsByName(request.name)) {
            throw ConflictException("Workshop with name '${request.name}' already exists")
        }
        if (workshopRepository.existsByCode(request.code)) {
            throw ConflictException("Workshop with code '${request.code}' already exists")
        }

        val workshop = Workshop(
            name = request.name,
            code = request.code,
            description = request.description,
            capacity = request.capacity,
            instructor = request.instructor ?: "Industry Expert",
            venue = request.venue ?: "Auditorium Hall"
        )
        val saved = workshopRepository.save(workshop)
        return WorkshopResponse.from(saved, 0)
    }

    @Transactional
    fun updateCapacity(id: Long, newCapacity: Int): WorkshopResponse {
        if (newCapacity < 1 || newCapacity > 100) {
            throw BadRequestException("Workshop capacity must be between 1 and 100 participants")
        }
        val workshop = workshopRepository.findByIdForUpdate(id)
            .orElseThrow { ResourceNotFoundException("Workshop", id.toString()) }

        val confirmedCount = workshopRegistrationRepository.countByWorkshopIdAndStatus(workshop.id, WorkshopRegStatus.CONFIRMED)
        if (newCapacity < confirmedCount) {
            throw BadRequestException("Cannot reduce workshop capacity to $newCapacity: There are already $confirmedCount confirmed participants registered.")
        }

        workshop.capacity = newCapacity
        val saved = workshopRepository.save(workshop)
        return WorkshopResponse.from(saved, confirmedCount)
    }

    @Transactional(readOnly = true)
    fun getParticipants(
        workshopId: Long,
        status: WorkshopRegStatus = WorkshopRegStatus.CONFIRMED,
        search: String?,
        pageable: Pageable
    ): PagedResponse<WorkshopParticipantDto> {
        val result = workshopRegistrationRepository.searchParticipants(workshopId, status, search, pageable)
        val startSerial = result.number * result.size + 1
        val dtos = result.content.mapIndexed { idx, reg ->
            WorkshopParticipantDto(
                attendeeId = reg.attendee.id,
                serialNumber = startSerial + idx,
                registrationId = reg.attendee.registrationId,
                fullName = reg.attendee.fullName,
                email = reg.attendee.email,
                phone = reg.attendee.phone,
                college = reg.attendee.college,
                registeredAt = reg.registeredAt,
                status = reg.status
            )
        }
        return PagedResponse(
            data = dtos,
            page = result.number,
            size = result.size,
            totalElements = result.totalElements,
            totalPages = result.totalPages
        )
    }

    @Transactional(readOnly = true)
    fun exportParticipantsCsv(workshopId: Long): String {
        val workshop = workshopRepository.findById(workshopId)
            .orElseThrow { ResourceNotFoundException("Workshop", workshopId.toString()) }
        val participants = workshopRegistrationRepository.findAllParticipants(workshopId, WorkshopRegStatus.CONFIRMED)

        val sb = StringBuilder()
        sb.append("Serial Number,Registration ID,Full Name,Email,Phone,College,Registration Date,Status\n")
        participants.forEachIndexed { idx, reg ->
            sb.append("${idx + 1},")
            sb.append("\"${reg.attendee.registrationId}\",")
            sb.append("\"${reg.attendee.fullName.replace("\"", "\"\"")}\",")
            sb.append("\"${reg.attendee.email}\",")
            sb.append("\"${reg.attendee.phone}\",")
            sb.append("\"${reg.attendee.college.replace("\"", "\"\"")}\",")
            sb.append("\"${reg.registeredAt}\",")
            sb.append("\"${reg.status}\"\n")
        }
        return sb.toString()
    }

    @Transactional
    fun registerParticipant(workshopId: Long, attendeeId: Long): WorkshopParticipantDto {
        val workshop = workshopRepository.findByIdForUpdate(workshopId)
            .orElseThrow { ResourceNotFoundException("Workshop", workshopId.toString()) }

        val attendee = attendeeRepository.findById(attendeeId)
            .orElseThrow { ResourceNotFoundException("Attendee", attendeeId.toString()) }

        // 1. Prevent duplicate registration
        if (workshopRegistrationRepository.existsByWorkshopIdAndAttendeeIdAndStatus(workshopId, attendeeId, WorkshopRegStatus.CONFIRMED)) {
            throw ConflictException("Attendee ${attendee.fullName} is already registered for ${workshop.name}")
        }

        // 2. Prevent overbooking (concurrency-protected capacity check)
        val confirmedCount = workshopRegistrationRepository.countByWorkshopIdAndStatus(workshopId, WorkshopRegStatus.CONFIRMED)
        if (confirmedCount >= workshop.capacity) {
            throw BadRequestException("Sorry, this workshop is fully booked. No seats are currently available.")
        }

        val registration = WorkshopRegistration(
            workshop = workshop,
            attendee = attendee,
            status = WorkshopRegStatus.CONFIRMED
        )
        val saved = workshopRegistrationRepository.save(registration)

        return WorkshopParticipantDto(
            attendeeId = attendee.id,
            serialNumber = confirmedCount + 1,
            registrationId = attendee.registrationId,
            fullName = attendee.fullName,
            email = attendee.email,
            phone = attendee.phone,
            college = attendee.college,
            registeredAt = saved.registeredAt,
            status = saved.status
        )
    }

    @Transactional
    fun cancelRegistration(workshopId: Long, attendeeId: Long): WorkshopParticipantDto {
        val registration = workshopRegistrationRepository.findByWorkshopIdAndAttendeeIdAndStatus(
            workshopId, attendeeId, WorkshopRegStatus.CONFIRMED
        ).orElseThrow {
            ResourceNotFoundException("Confirmed workshop registration", "Workshop: $workshopId, Attendee: $attendeeId")
        }

        registration.status = WorkshopRegStatus.CANCELLED
        registration.cancelledAt = Instant.now()
        val saved = workshopRegistrationRepository.save(registration)

        return WorkshopParticipantDto(
            attendeeId = registration.attendee.id,
            serialNumber = 0,
            registrationId = registration.attendee.registrationId,
            fullName = registration.attendee.fullName,
            email = registration.attendee.email,
            phone = registration.attendee.phone,
            college = registration.attendee.college,
            registeredAt = saved.registeredAt,
            status = saved.status
        )
    }
}
