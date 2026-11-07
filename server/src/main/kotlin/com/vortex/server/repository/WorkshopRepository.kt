package com.vortex.server.repository

import com.vortex.server.model.entity.*
import jakarta.persistence.LockModeType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Lock
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface WorkshopRepository : JpaRepository<Workshop, Long> {
    fun findByName(name: String): Optional<Workshop>
    fun findByCode(code: String): Optional<Workshop>
    fun existsByName(name: String): Boolean
    fun existsByCode(code: String): Boolean

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Workshop w WHERE w.id = :id")
    fun findByIdForUpdate(@Param("id") id: Long): Optional<Workshop>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Workshop w WHERE w.name = :name")
    fun findByNameForUpdate(@Param("name") name: String): Optional<Workshop>
}

@Repository
interface WorkshopRegistrationRepository : JpaRepository<WorkshopRegistration, Long> {
    fun countByWorkshopIdAndStatus(workshopId: Long, status: WorkshopRegStatus): Int

    fun existsByWorkshopIdAndAttendeeIdAndStatus(workshopId: Long, attendeeId: Long, status: WorkshopRegStatus): Boolean

    fun findByWorkshopIdAndAttendeeIdAndStatus(workshopId: Long, attendeeId: Long, status: WorkshopRegStatus): Optional<WorkshopRegistration>

    @Query("""
        SELECT wr FROM WorkshopRegistration wr
        WHERE wr.workshop.id = :workshopId
        AND wr.status = :status
        AND (:search IS NULL OR
             LOWER(wr.attendee.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(wr.attendee.registrationId) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(wr.attendee.email) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY wr.registeredAt ASC
    """)
    fun searchParticipants(
        @Param("workshopId") workshopId: Long,
        @Param("status") status: WorkshopRegStatus,
        @Param("search") search: String?,
        pageable: Pageable
    ): Page<WorkshopRegistration>

    @Query("""
        SELECT wr FROM WorkshopRegistration wr
        WHERE wr.workshop.id = :workshopId
        AND wr.status = :status
        ORDER BY wr.registeredAt ASC
    """)
    fun findAllParticipants(
        @Param("workshopId") workshopId: Long,
        @Param("status") status: WorkshopRegStatus
    ): List<WorkshopRegistration>

    fun findAllByAttendeeIdOrderByRegisteredAtDesc(attendeeId: Long): List<WorkshopRegistration>
}

@Repository
interface EventRegistrationRepository : JpaRepository<EventRegistration, Long> {
    fun findAllByAttendeeIdOrderByRegisteredAtDesc(attendeeId: Long): List<EventRegistration>
}

