package com.vortex.server.model.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

enum class WorkshopRegStatus { CONFIRMED, CANCELLED, ATTENDED }
enum class WorkshopStatus { AVAILABLE, ALMOST_FULL, FULLY_BOOKED }

@Entity
@Table(name = "workshops")
class Workshop(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 150)
    var name: String,

    @Column(nullable = false, unique = true, length = 50)
    var code: String,

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(nullable = false)
    var capacity: Int = 100,

    @Column(length = 100)
    var instructor: String? = "Industry Expert",

    @Column(length = 100)
    var venue: String? = "Auditorium Hall",

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Instant = Instant.now(),

    @UpdateTimestamp
    var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "workshop_registrations")
class WorkshopRegistration(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workshop_id", nullable = false)
    var workshop: Workshop,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = false)
    var attendee: Attendee,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: WorkshopRegStatus = WorkshopRegStatus.CONFIRMED,

    @CreationTimestamp
    @Column(updatable = false)
    val registeredAt: Instant = Instant.now(),

    var cancelledAt: Instant? = null
)

@Entity
@Table(name = "event_registrations")
class EventRegistration(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 150)
    var eventName: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = false)
    var attendee: Attendee,

    @Column(nullable = false, length = 30)
    var status: String = "CONFIRMED",

    @CreationTimestamp
    @Column(updatable = false)
    val registeredAt: Instant = Instant.now()
)

