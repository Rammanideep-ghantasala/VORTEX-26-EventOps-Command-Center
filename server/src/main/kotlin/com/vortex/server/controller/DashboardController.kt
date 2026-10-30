package com.vortex.server.controller

import com.vortex.server.model.dto.DashboardStatsResponse
import com.vortex.server.service.DashboardService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Live event statistics and analytics")
class DashboardController(private val dashboardService: DashboardService) {

    @GetMapping("/stats")
    @Operation(summary = "Get live event statistics — check-in rates, workshop slots, housing occupancy")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'GATE_STAFF', 'HOUSING_STAFF', 'REGISTRATION_STAFF')")
    fun getStats(): ResponseEntity<DashboardStatsResponse> {
        return ResponseEntity.ok(dashboardService.getStats())
    }
}

