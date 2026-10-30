package com.vortex.server.model.entity

import jakarta.persistence.*
import org.hibernate.annotations.CreationTimestamp
import java.time.Instant

enum class BlockType { BOYS, GIRLS, VIP }

@Entity
@Table(name = "housing_blocks")
class HousingBlock(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var blockName: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var blockType: BlockType,

    @Column(nullable = false)
    var totalRooms: Int = 0,

    @Column(nullable = false)
    var totalCapacity: Int = 0,

    @Column(nullable = false)
    var occupiedBeds: Int = 0,

    @OneToMany(mappedBy = "block", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val rooms: MutableList<Room> = mutableListOf(),

    @CreationTimestamp
    @Column(updatable = false)
    val createdAt: Instant = Instant.now()
)

@Entity
@Table(name = "rooms", uniqueConstraints = [UniqueConstraint(columnNames = ["block_id", "room_number"])])
class Room(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_id", nullable = false)
    var block: HousingBlock,

    @Column(nullable = false, length = 20)
    var roomNumber: String,

    @Column(nullable = false)
    var capacity: Int = 4,

    @Column(nullable = false)
    var occupied: Int = 0
) {
    val availableBeds: Int get() = capacity - occupied
    val isFull: Boolean get() = occupied >= capacity
}

@Entity
@Table(name = "housing_allocations")
class HousingAllocation(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = false, unique = true)
    var attendee: Attendee,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    var room: Room,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "block_id", nullable = false)
    var block: HousingBlock,

    @Column(nullable = false)
    var checkedIn: Boolean = false,

    var checkedInAt: Instant? = null,

    @Column(nullable = false)
    var checkedOut: Boolean = false,

    var checkedOutAt: Instant? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by")
    var allocatedBy: User? = null,

    @CreationTimestamp
    @Column(updatable = false)
    val allocatedAt: Instant = Instant.now()
)

