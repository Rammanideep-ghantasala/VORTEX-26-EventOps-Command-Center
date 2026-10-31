package com.vortex.server.controller

import com.vortex.server.model.dto.*
import com.vortex.server.service.HousingService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/housing")
@Tag(name = "Accommodation", description = "Accommodation management, gender-based hostel allocation, date ranges, and vacancy control")
class HousingController(private val housingService: HousingService) {

    @GetMapping("/blocks")
    @Operation(summary = "Get all hostel blocks with room occupancy details")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getBlocks(@RequestParam(required = false) gender: String?): ResponseEntity<List<HousingBlockResponse>> {
        return ResponseEntity.ok(housingService.getAllBlocks(gender))
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Super Admin Accommodation Dashboard: room occupancy, total bed capacity, upcoming check-ins/checkouts")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getDashboard(): ResponseEntity<AccommodationDashboardResponse> {
        return ResponseEntity.ok(housingService.getAccommodationDashboard())
    }

    @GetMapping("/allocations")
    @Operation(summary = "Get all accommodation allocations with optional status filter")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getAllocations(@RequestParam(required = false) status: String?): ResponseEntity<List<HousingAllocationResponse>> {
        return ResponseEntity.ok(housingService.getAllocations(status))
    }

    @PostMapping("/allocate")
    @Operation(summary = "Allocate accommodation: validates gender compatibility, mandatory dates, and prevents overbooking")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun allocate(
        @Valid @RequestBody request: AllocateRoomRequest,
        authentication: Authentication
    ): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(housingService.allocateRoom(request, authentication.name))
    }

    @GetMapping("/attendee/{attendeeId}")
    @Operation(summary = "Get active accommodation allocation for a specific attendee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getAllocationByAttendee(@PathVariable attendeeId: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.getAllocationByAttendee(attendeeId))
    }

    @GetMapping("/history/{attendeeId}")
    @Operation(summary = "Get complete accommodation history for an attendee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getAccommodationHistory(@PathVariable attendeeId: Long): ResponseEntity<List<HousingAllocationResponse>> {
        return ResponseEntity.ok(housingService.getAttendeeAccommodationHistory(attendeeId))
    }

    @PatchMapping("/allocations/{id}/check-in")
    @Operation(summary = "Mark attendee as checked into their assigned room")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun roomCheckIn(@PathVariable id: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.roomCheckIn(id))
    }

    @PatchMapping("/allocations/{id}/check-out")
    @Operation(summary = "Mark attendee as vacated / checked out — records checkout date and frees bed space")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun roomCheckOut(@PathVariable id: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.roomCheckOut(id))
    }

    @PatchMapping("/rooms/{id}/capacity")
    @Operation(summary = "Update room capacity where authorized (cannot reduce below active allocations)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun updateRoomCapacity(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateRoomCapacityRequest
    ): ResponseEntity<RoomResponse> {
        return ResponseEntity.ok(housingService.updateRoomCapacity(id, request.capacity))
    }
}
