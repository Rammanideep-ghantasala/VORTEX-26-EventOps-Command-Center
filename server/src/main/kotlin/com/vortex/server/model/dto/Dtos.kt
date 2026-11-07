package com.vortex.server.model.dto

import com.vortex.server.model.entity.*
import jakarta.validation.constraints.*
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate

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
    @field:Size(min = 8, message = "Password must be at least 8 characters")
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
    @field:Size(max = 150)
    val college: String,

    val gender: Gender? = Gender.MALE,
    @field:Size(max = 100)
    val department: String? = "Computer Science & Engineering",
    @field:Size(max = 20)
    val yearOfStudy: String? = "3rd Year",

    @field:Size(max = 10, message = "A walk-in can register for at most 10 workshops")
    val workshops: List<String> = emptyList(),
    @field:Size(max = 10, message = "A walk-in can register for at most 10 competitions")
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
    val gender: Gender?,
    val department: String?,
    val yearOfStudy: String?,
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
            gender = a.gender,
            department = a.department,
            yearOfStudy = a.yearOfStudy,
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

// ── Complete Attendee Profile DTOs ────────────────────────────────────────────

data class WorkshopRegistrationDto(
    val id: Long,
    val workshopId: Long,
    val workshopName: String,
    val workshopCode: String,
    val status: WorkshopRegStatus,
    val registeredAt: Instant,
    val attendanceStatus: String = "REGISTERED"
)

data class EventRegistrationDto(
    val id: Long,
    val eventName: String,
    val status: String,
    val registeredAt: Instant,
    val attendanceStatus: String = "REGISTERED"
)

data class GateLogDto(
    val id: Long,
    val action: String,
    val gateLocation: String?,
    val operatorName: String,
    val note: String?,
    val loggedAt: Instant
)

data class AttendeeProfileResponse(
    val personalInfo: AttendeeResponse,
    val currentAccommodation: HousingAllocationResponse?,
    val accommodationHistory: List<HousingAllocationResponse>,
    val workshopRegistrations: List<WorkshopRegistrationDto>,
    val totalWorkshops: Int,
    val eventRegistrations: List<EventRegistrationDto>,
    val totalEvents: Int,
    val gateLogs: List<GateLogDto>
)

data class CheckInRequest(
    @field:NotBlank(message = "Registration ID or QR code is required")
    @field:Size(max = 255)
    val query: String,     // registrationId OR qrCode

    @field:NotBlank
    @field:Size(max = 50)
    val gateLocation: String = "Main Gate",

    @field:Size(max = 500)
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
    val blockId: Long = 0,
    val blockName: String,
    val blockType: String,
    val totalCapacity: Int,
    val occupiedBeds: Int,
    val availableBeds: Int,
    val occupancyPercentage: Double
)

data class RoomOccupancyDto(
    val roomId: Long,
    val roomNumber: String,
    val blockName: String,
    val blockType: String,
    val capacity: Int,
    val occupied: Int,
    val availableBeds: Int,
    val isFull: Boolean
)

// ─── Accommodation / Housing DTOs ─────────────────────────────────────────────

data class AllocateRoomRequest(
    @field:NotNull(message = "Attendee ID is required")
    val attendeeId: Long,

    @field:NotNull(message = "Room ID is required")
    val roomId: Long,

    @field:NotNull(message = "From Date is required")
    val fromDate: LocalDate,

    @field:NotNull(message = "To Date is required")
    val toDate: LocalDate,

    val manualGenderOverride: Boolean = false
)

data class UpdateRoomCapacityRequest(
    @field:Min(value = 1, message = "Capacity must be at least 1 bed")
    @field:Max(value = 20, message = "Capacity cannot exceed 20 beds per room")
    val capacity: Int
)

data class HousingAllocationResponse(
    val id: Long,
    val attendee: AttendeeResponse,
    val blockName: String,
    val blockType: String,
    val roomNumber: String,
    val fromDate: LocalDate,
    val toDate: LocalDate,
    val status: AllocationStatus,
    val checkedIn: Boolean,
    val checkedInAt: Instant?,
    val checkedOut: Boolean,
    val checkedOutAt: Instant?,
    val allocatedAt: Instant
) {
    companion object {
        fun from(h: HousingAllocation) = HousingAllocationResponse(
            id = h.id,
            attendee = AttendeeResponse.from(h.attendee),
            blockName = h.block.blockName,
            blockType = h.block.blockType.name,
            roomNumber = h.room.roomNumber,
            fromDate = h.fromDate,
            toDate = h.toDate,
            status = h.status,
            checkedIn = h.checkedIn,
            checkedInAt = h.checkedInAt,
            checkedOut = h.checkedOut,
            checkedOutAt = h.checkedOutAt,
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
        fun from(r: Room, activeOccupancy: Int? = null) = RoomResponse(
            id = r.id,
            roomNumber = r.roomNumber,
            capacity = r.capacity,
            occupied = activeOccupancy ?: r.occupied,
            availableBeds = maxOf(0, r.capacity - (activeOccupancy ?: r.occupied)),
            isFull = (activeOccupancy ?: r.occupied) >= r.capacity
        )
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

data class AccommodationDashboardResponse(
    val totalHostels: Int,
    val totalRooms: Int,
    val totalBedCapacity: Int,
    val occupiedBeds: Int,
    val availableBeds: Int,
    val hostelOccupancy: List<BlockOccupancyDto>,
    val roomOccupancy: List<RoomOccupancyDto>,
    val upcomingCheckIns: List<HousingAllocationResponse>,
    val upcomingCheckOuts: List<HousingAllocationResponse>
)

// ─── Workshop Management DTOs ─────────────────────────────────────────────────

data class CreateWorkshopRequest(
    @field:NotBlank(message = "Workshop name is required")
    val name: String,

    @field:NotBlank(message = "Workshop code is required")
    val code: String,

    val description: String? = null,

    @field:Min(value = 1, message = "Capacity must be at least 1")
    @field:Max(value = 100, message = "Capacity cannot exceed 100")
    val capacity: Int = 100,

    val instructor: String? = "Industry Expert",
    val venue: String? = "Auditorium Hall"
)

data class UpdateWorkshopCapacityRequest(
    @field:Min(value = 1, message = "Capacity must be at least 1")
    @field:Max(value = 100, message = "Capacity cannot exceed 100")
    val capacity: Int
)

data class WorkshopResponse(
    val id: Long,
    val name: String,
    val code: String,
    val description: String?,
    val capacity: Int,
    val registeredParticipants: Int,
    val availableSeats: Int,
    val occupancyPercentage: Double,
    val status: WorkshopStatus,
    val instructor: String?,
    val venue: String?
) {
    companion object {
        fun from(w: Workshop, confirmedCount: Int) = WorkshopResponse(
            id = w.id,
            name = w.name,
            code = w.code,
            description = w.description,
            capacity = w.capacity,
            registeredParticipants = confirmedCount,
            availableSeats = maxOf(0, w.capacity - confirmedCount),
            occupancyPercentage = if (w.capacity > 0)
                (confirmedCount.toDouble() / w.capacity * 100.0) else 0.0,
            status = when {
                confirmedCount >= w.capacity -> WorkshopStatus.FULLY_BOOKED
                confirmedCount >= (w.capacity * 0.8).toInt() -> WorkshopStatus.ALMOST_FULL
                else -> WorkshopStatus.AVAILABLE
            },
            instructor = w.instructor,
            venue = w.venue
        )
    }
}

data class WorkshopParticipantDto(
    val attendeeId: Long,
    val serialNumber: Int,
    val registrationId: String,
    val fullName: String,
    val email: String,
    val phone: String,
    val college: String,
    val registeredAt: Instant,
    val status: WorkshopRegStatus
)

data class RegisterWorkshopRequest(
    @field:NotNull(message = "Attendee ID is required")
    val attendeeId: Long
)
