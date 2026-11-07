package com.vortex.server.repository

import com.vortex.server.model.entity.Attendee
import com.vortex.server.model.entity.RegistrationType
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
interface AttendeeRepository : JpaRepository<Attendee, Long> {

    fun findByRegistrationId(registrationId: String): Optional<Attendee>
    fun findByQrCode(qrCode: String): Optional<Attendee>
    fun findByEmail(email: String): Optional<Attendee>
    fun existsByPhone(phone: String): Boolean
    fun existsByEmail(email: String): Boolean

    @Query("SELECT COUNT(a) FROM Attendee a WHERE a.checkedIn = :checkedIn")
    fun countByCheckedIn(@Param("checkedIn") checkedIn: Boolean): Long
    fun countByRegistrationType(type: RegistrationType): Long
    fun countByHousingRequired(housingRequired: Boolean): Long

    @Query("""
        SELECT a FROM Attendee a
        WHERE (:search IS NULL OR
               LOWER(a.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.college) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(a.registrationId) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:type IS NULL OR a.registrationType = :type)
        AND (:checkedIn IS NULL OR a.checkedIn = :checkedIn)
    """)
    fun searchAttendees(
        @Param("search") search: String?,
        @Param("type") type: RegistrationType?,
        @Param("checkedIn") checkedIn: Boolean?,
        pageable: Pageable
    ): Page<Attendee>

    // Find by registrationId OR qrCode in a single query
    @Query("SELECT a FROM Attendee a WHERE a.registrationId = :query OR a.qrCode = :query")
    fun findByRegistrationIdOrQrCode(@Param("query") query: String): Optional<Attendee>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT a FROM Attendee a
        WHERE a.registrationId = :query OR a.qrCode = :query OR LOWER(a.email) = LOWER(:query)
    """)
    fun findForCheckIn(@Param("query") query: String): Optional<Attendee>

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Attendee a WHERE a.id = :id")
    fun findByIdForUpdate(@Param("id") id: Long): Optional<Attendee>
}

