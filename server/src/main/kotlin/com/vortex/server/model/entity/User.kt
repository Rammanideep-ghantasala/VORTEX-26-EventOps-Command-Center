package com.vortex.server.model.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import org.hibernate.annotations.UpdateTimestamp
import java.time.Instant

enum class UserRole { SUPER_ADMIN, GATE_STAFF, HOUSING_STAFF, REGISTRATION_STAFF }

@Entity
@Table(name = "users")
class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String,

    @Column(nullable = false, unique = true, length = 150)
    var email: String,

    @Column(nullable = false)
    var password: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var role: UserRole = UserRole.GATE_STAFF,

    @Column(nullable = false)
    var active: Boolean = true,

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Instant = Instant.now(),

    @UpdateTimestamp
    var updatedAt: Instant = Instant.now()
)

