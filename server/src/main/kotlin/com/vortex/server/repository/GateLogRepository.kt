package com.vortex.server.repository

import com.vortex.server.model.entity.GateLog
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface GateLogRepository : JpaRepository<GateLog, Long> {
    fun findByAttendeeIdOrderByLoggedAtDesc(attendeeId: Long): List<GateLog>
    fun findAllByOrderByLoggedAtDesc(pageable: Pageable): Page<GateLog>
}

