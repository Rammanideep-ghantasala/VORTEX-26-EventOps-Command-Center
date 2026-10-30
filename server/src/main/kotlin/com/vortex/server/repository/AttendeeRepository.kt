package com.vortex.server.repository

import com.vortex.server.model.entity.Attendee
import com.vortex.server.model.entity.RegistrationType
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface AttendeeRepository : JpaRepository<Attendee, Long> {

    fun findByRegistrationId(registrationId: String): Optional<Attendee>
    fun findByQrCode(qrCode: String): Optional<Attendee>
    fun findByEmail(email: String): Optional<Attendee>
    fun existsByEmail(email: String): Boolean

    fun countByCheckedIn(checkedIn: Boolean): Long
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
}

