package com.vortex.server.controller

import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.WorkshopRegStatus
import com.vortex.server.service.WorkshopService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/workshops")
@Tag(name = "Workshops", description = "Workshop seat capacity management, live occupancy, participant registration, and cancellation")
class WorkshopController(private val workshopService: WorkshopService) {

    @GetMapping
    @Operation(summary = "Get all workshops with live registration counts, available seats, and occupancy percentages")
    fun getAll(): ResponseEntity<List<WorkshopResponse>> {
        return ResponseEntity.ok(workshopService.getAllWorkshops())
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single workshop details with live registration statistics")
    fun getById(@PathVariable id: Long): ResponseEntity<WorkshopResponse> {
        return ResponseEntity.ok(workshopService.getWorkshopById(id))
    }

    @PostMapping
    @Operation(summary = "Create a new workshop with configurable capacity (1 to 100 participants)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun createWorkshop(@Valid @RequestBody request: CreateWorkshopRequest): ResponseEntity<WorkshopResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(workshopService.createWorkshop(request))
    }

    @PutMapping("/{id}/capacity")
    @Operation(summary = "Update workshop capacity (1 to 100; cannot reduce below existing confirmed registrations)")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    fun updateCapacity(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateWorkshopCapacityRequest
    ): ResponseEntity<WorkshopResponse> {
        return ResponseEntity.ok(workshopService.updateCapacity(id, request.capacity))
    }

    @GetMapping("/{id}/participants")
    @Operation(summary = "Get paginated participants for a workshop with search and status filtering")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGISTRATION_STAFF')")
    fun getParticipants(
        @PathVariable id: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) search: String?,
        @RequestParam(defaultValue = "CONFIRMED") status: String
    ): ResponseEntity<PagedResponse<WorkshopParticipantDto>> {
        val regStatus = runCatching { WorkshopRegStatus.valueOf(status.uppercase()) }.getOrDefault(WorkshopRegStatus.CONFIRMED)
        val pageable = PageRequest.of(page.coerceAtLeast(0), size.coerceIn(1, 100))
        return ResponseEntity.ok(workshopService.getParticipants(id, regStatus, search?.trim()?.take(100), pageable))
    }

    @GetMapping("/{id}/export")
    @Operation(summary = "Export workshop confirmed participant list as CSV file")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGISTRATION_STAFF')")
    fun exportCsv(@PathVariable id: Long): ResponseEntity<ByteArray> {
        val csvData = workshopService.exportParticipantsCsv(id)
        val bytes = csvData.toByteArray(Charsets.UTF_8)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"workshop-${id}-participants.csv\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(bytes)
    }

    @PostMapping("/{id}/register")
    @Operation(summary = "Register attendee for workshop (validates capacity and prevents duplicate entries)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGISTRATION_STAFF')")
    fun registerParticipant(
        @PathVariable id: Long,
        @Valid @RequestBody request: RegisterWorkshopRequest
    ): ResponseEntity<WorkshopParticipantDto> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(workshopService.registerParticipant(id, request.attendeeId))
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel attendee workshop registration (preserves historical record and frees seat)")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'REGISTRATION_STAFF')")
    fun cancelRegistration(
        @PathVariable id: Long,
        @Valid @RequestBody request: RegisterWorkshopRequest
    ): ResponseEntity<WorkshopParticipantDto> {
        return ResponseEntity.ok(workshopService.cancelRegistration(id, request.attendeeId))
    }
}

