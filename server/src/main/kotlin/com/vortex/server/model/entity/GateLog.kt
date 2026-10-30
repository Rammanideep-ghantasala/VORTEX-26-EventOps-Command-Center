package com.vortex.server.model.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant

@Entity
@Table(name = "gate_logs")
class GateLog(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = false)
    var attendee: Attendee,

    @Column(nullable = false, length = 30)
    var action: String,

    @Column(length = 50)
    var gateLocation: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    var operator: User,

    @Column(columnDefinition = "TEXT")
    var note: String? = null,

    @CreationTimestamp
    @Column(updatable = false)
    val loggedAt: Instant = Instant.now()
)

