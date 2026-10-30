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
@Tag(name = "Housing", description = "Room allocation, occupancy management, check-in and checkout")
class HousingController(private val housingService: HousingService) {

    @GetMapping("/blocks")
    @Operation(summary = "Get all housing blocks with room occupancy details")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getBlocks(): ResponseEntity<List<HousingBlockResponse>> {
        return ResponseEntity.ok(housingService.getAllBlocks())
    }

    @PostMapping("/allocate")
    @Operation(summary = "Allocate an attendee to a specific room")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun allocate(
        @Valid @RequestBody request: AllocateRoomRequest,
        authentication: Authentication
    ): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(housingService.allocateRoom(request, authentication.name))
    }

    @GetMapping("/attendee/{attendeeId}")
    @Operation(summary = "Get housing allocation for a specific attendee")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun getAllocationByAttendee(@PathVariable attendeeId: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.getAllocationByAttendee(attendeeId))
    }

    @PatchMapping("/allocations/{id}/check-in")
    @Operation(summary = "Mark attendee as checked into their assigned room")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun roomCheckIn(@PathVariable id: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.roomCheckIn(id))
    }

    @PatchMapping("/allocations/{id}/check-out")
    @Operation(summary = "Mark attendee as checked out of their room — releases the bed")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HOUSING_STAFF')")
    fun roomCheckOut(@PathVariable id: Long): ResponseEntity<HousingAllocationResponse> {
        return ResponseEntity.ok(housingService.roomCheckOut(id))
    }
}

