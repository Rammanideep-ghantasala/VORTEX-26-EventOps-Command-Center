package com.vortex.server.model.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.math.BigDecimal
import java.time.Instant

enum class RegistrationType { PRE_REGISTERED, WALK_IN }
enum class PaymentMode { CASH, UPI, CARD, WAIVER }

@Entity
@Table(name = "attendees")
class Attendee(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 20)
    var registrationId: String,

    @Column(nullable = false, unique = true)
    var qrCode: String,

    @Column(nullable = false, length = 100)
    var fullName: String,

    @Column(nullable = false, unique = true, length = 150)
    var email: String,

    @Column(nullable = false, length = 20)
    var phone: String,

    @Column(nullable = false, length = 150)
    var college: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var registrationType: RegistrationType = RegistrationType.PRE_REGISTERED,

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    var paymentMode: PaymentMode? = null,

    @Column(length = 100)
    var paymentReference: String? = null,

    @Column(precision = 10, scale = 2)
    var amountPaid: BigDecimal? = null,

    // PostgreSQL native array columns
    @Column(columnDefinition = "text[]")
    var workshops: Array<String> = emptyArray(),

    @Column(columnDefinition = "text[]")
    var competitions: Array<String> = emptyArray(),

    @Column(nullable = false)
    var checkedIn: Boolean = false,

    var checkedInAt: Instant? = null,

    @Column(length = 50)
    var checkedInGate: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_in_by")
    var checkedInBy: User? = null,

    @Column(nullable = false)
    var housingRequired: Boolean = false,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Instant = Instant.now(),

    @UpdateTimestamp
    var updatedAt: Instant = Instant.now()
)

