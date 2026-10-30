package com.vortex.server.controller

import com.vortex.server.model.dto.*
import com.vortex.server.service.AttendeeService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/attendees")
@Tag(name = "Attendees", description = "Attendee management, walk-in registration, search, and gate check-in")
class AttendeeController(private val attendeeService: AttendeeService) {

    @GetMapping
    @Operation(summary = "Paginated attendee list with search and filters")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GATE_STAFF', 'REGISTRATION_STAFF', 'HOUSING_STAFF')")
    fun getAttendees(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Search by name, email, college, or registration ID")
        @RequestParam(required = false) search: String?,
        @Parameter(description = "PRE_REGISTERED or WALK_IN")
        @RequestParam(required = false) type: String?,
        @RequestParam(required = false) checkedIn: Boolean?
    ): ResponseEntity<PagedResponse<AttendeeResponse>> {
        return ResponseEntity.ok(attendeeService.getAttendees(page, size, search, type, checkedIn))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get attendee by ID")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GATE_STAFF', 'REGISTRATION_STAFF', 'HOUSING_STAFF')")
    fun getById(@PathVariable id: Long): ResponseEntity<AttendeeResponse> {
        return ResponseEntity.ok(attendeeService.getAttendeeById(id))
    }

    @GetMapping("/search")
    @Operation(summary = "Search single attendee by email, registration ID, or QR code")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GATE_STAFF', 'REGISTRATION_STAFF')")
    fun search(
        @Parameter(description = "Email, Registration ID, or QR code") @RequestParam q: String
    ): ResponseEntity<AttendeeResponse> {
        return ResponseEntity.ok(attendeeService.searchAttendee(q))
    }

    @PostMapping("/walk-in")
    @Operation(summary = "Register a new walk-in attendee on-site")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGISTRATION_STAFF')")
    fun registerWalkIn(
        @Valid @RequestBody request: WalkInRequest,
        authentication: Authentication
    ): ResponseEntity<AttendeeResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(attendeeService.registerWalkIn(request, authentication.name))
    }

    @PostMapping("/check-in")
    @Operation(summary = "Gate check-in by Registration ID or QR code — prevents double entry")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GATE_STAFF')")
    fun checkIn(
        @Valid @RequestBody request: CheckInRequest,
        authentication: Authentication
    ): ResponseEntity<CheckInResponse> {
        return ResponseEntity.ok(attendeeService.checkIn(request, authentication.name))
    }
}

