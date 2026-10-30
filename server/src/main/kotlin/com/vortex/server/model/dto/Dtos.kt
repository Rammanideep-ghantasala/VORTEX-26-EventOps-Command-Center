package com.vortex.server.model.dto

import com.vortex.server.model.entity.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.Instant

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

data class LoginRequest(
    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, message = "Password must be at least 6 characters")
    val password: String
)

data class RegisterUserRequest(
    @field:NotBlank(message = "Name is required")
    @field:Size(max = 100)
    val name: String,

    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, message = "Password must be at least 6 characters")
    val password: String,

    val role: UserRole = UserRole.GATE_STAFF
)

data class AuthResponse(
    val token: String,
    val user: UserProfileDto
)

data class UserProfileDto(
    val id: Long,
    val name: String,
    val email: String,
    val role: UserRole
) {
    companion object {
        fun from(user: User) = UserProfileDto(user.id, user.name, user.email, user.role)
    }
}

// ─── Attendee DTOs ────────────────────────────────────────────────────────────

data class WalkInRequest(
    @field:NotBlank(message = "Full name is required")
    @field:Size(max = 100)
    val fullName: String,

    @field:Email(message = "Invalid email format")
    @field:NotBlank(message = "Email is required")
    val email: String,

    @field:NotBlank(message = "Phone is required")
    @field:Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian phone number")
    val phone: String,

    @field:NotBlank(message = "College is required")
    val college: String,

    val workshops: List<String> = emptyList(),
    val competitions: List<String> = emptyList(),
    val housingRequired: Boolean = false,
    val paymentMode: PaymentMode = PaymentMode.CASH,
    val paymentReference: String? = null,

    @field:DecimalMin(value = "0.0", message = "Amount must be positive")
    val amountPaid: BigDecimal? = null
)

data class AttendeeResponse(
    val id: Long,
    val registrationId: String,
    val qrCode: String,
    val fullName: String,
    val email: String,
    val phone: String,
    val college: String,
    val registrationType: RegistrationType,
    val workshops: List<String>,
    val competitions: List<String>,
    val checkedIn: Boolean,
    val checkedInAt: Instant?,
    val checkedInGate: String?,
    val housingRequired: Boolean,
    val paymentMode: PaymentMode?,
    val amountPaid: BigDecimal?,
    val createdAt: Instant
) {
    companion object {
        fun from(a: Attendee) = AttendeeResponse(
            id = a.id,
            registrationId = a.registrationId,
            qrCode = a.qrCode,
            fullName = a.fullName,
            email = a.email,
            phone = a.phone,
            college = a.college,
            registrationType = a.registrationType,
            workshops = a.workshops.toList(),
            competitions = a.competitions.toList(),
            checkedIn = a.checkedIn,
            checkedInAt = a.checkedInAt,
            checkedInGate = a.checkedInGate,
            housingRequired = a.housingRequired,
            paymentMode = a.paymentMode,
            amountPaid = a.amountPaid,
            createdAt = a.createdAt
        )
    }
}

data class CheckInRequest(
    @field:NotBlank(message = "Registration ID or QR code is required")
    val query: String,     // registrationId OR qrCode

    @field:NotBlank
    val gateLocation: String = "Main Gate",

    val note: String? = null
)

data class CheckInResponse(
    val success: Boolean,
    val message: String,
    val attendee: AttendeeResponse?,
    val alreadyCheckedIn: Boolean = false
)

data class PagedResponse<T>(
    val data: List<T>,
    val page: Int,
    val size: Int,
    val totalElements: Long,
    val totalPages: Int
)

// ─── Dashboard DTOs ───────────────────────────────────────────────────────────

data class DashboardStatsResponse(
    val totalAttendees: Long,
    val preRegistered: Long,
    val walkIns: Long,
    val checkedIn: Long,
    val pendingEntry: Long,
    val housingRequired: Long,
    val housingAllocated: Long,
    val checkInPercentage: Double,
    val workshopStats: Map<String, Long>,
    val competitionStats: Map<String, Long>,
    val blockOccupancy: List<BlockOccupancyDto>
)

data class BlockOccupancyDto(
    val blockName: String,
    val blockType: String,
    val totalCapacity: Int,
    val occupiedBeds: Int,
    val availableBeds: Int,
    val occupancyPercentage: Double
)

// ─── Housing DTOs ─────────────────────────────────────────────────────────────

data class AllocateRoomRequest(
    @field:NotNull(message = "Attendee ID is required")
    val attendeeId: Long,

    @field:NotNull(message = "Room ID is required")
    val roomId: Long
)

data class HousingAllocationResponse(
    val id: Long,
    val attendee: AttendeeResponse,
    val blockName: String,
    val blockType: String,
    val roomNumber: String,
    val checkedIn: Boolean,
    val checkedInAt: Instant?,
    val checkedOut: Boolean,
    val allocatedAt: Instant
) {
    companion object {
        fun from(h: HousingAllocation) = HousingAllocationResponse(
            id = h.id,
            attendee = AttendeeResponse.from(h.attendee),
            blockName = h.block.blockName,
            blockType = h.block.blockType.name,
            roomNumber = h.room.roomNumber,
            checkedIn = h.checkedIn,
            checkedInAt = h.checkedInAt,
            checkedOut = h.checkedOut,
            allocatedAt = h.allocatedAt
        )
    }
}

data class RoomResponse(
    val id: Long,
    val roomNumber: String,
    val capacity: Int,
    val occupied: Int,
    val availableBeds: Int,
    val isFull: Boolean
) {
    companion object {
        fun from(r: Room) = RoomResponse(r.id, r.roomNumber, r.capacity, r.occupied, r.availableBeds, r.isFull)
    }
}

data class HousingBlockResponse(
    val id: Long,
    val blockName: String,
    val blockType: String,
    val totalCapacity: Int,
    val occupiedBeds: Int,
    val availableBeds: Int,
    val rooms: List<RoomResponse>
)

