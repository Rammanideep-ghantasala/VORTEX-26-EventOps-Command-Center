package com.vortex.server.service

import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.RegistrationType
import com.vortex.server.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DashboardService(
    private val attendeeRepository: AttendeeRepository,
    private val housingBlockRepository: HousingBlockRepository,
    private val housingAllocationRepository: HousingAllocationRepository
) {

    @Transactional(readOnly = true)
    fun getStats(): DashboardStatsResponse {
        val total = attendeeRepository.count()
        val preRegistered = attendeeRepository.countByRegistrationType(RegistrationType.PRE_REGISTERED)
        val walkIns = attendeeRepository.countByRegistrationType(RegistrationType.WALK_IN)
        val checkedIn = attendeeRepository.countByCheckedIn(true)
        val housingRequired = attendeeRepository.countByHousingRequired(true)
        val housingAllocated = housingAllocationRepository.count()
        val checkInPct = if (total > 0) (checkedIn.toDouble() / total * 100) else 0.0

        // Workshop & competition statistics (in-memory aggregation on seed data scale)
        val allAttendees = attendeeRepository.findAll()
        val workshopStats = allAttendees
            .flatMap { it.workshops.toList() }
            .groupingBy { it }
            .eachCount()
            .mapValues { it.value.toLong() }
            .toSortedMap()

        val competitionStats = allAttendees
            .flatMap { it.competitions.toList() }
            .groupingBy { it }
            .eachCount()
            .mapValues { it.value.toLong() }
            .toSortedMap()

        val blockOccupancy = housingBlockRepository.findAll().map { block ->
            BlockOccupancyDto(
                blockName = block.blockName,
                blockType = block.blockType.name,
                totalCapacity = block.totalCapacity,
                occupiedBeds = block.occupiedBeds,
                availableBeds = block.totalCapacity - block.occupiedBeds,
                occupancyPercentage = if (block.totalCapacity > 0)
                    (block.occupiedBeds.toDouble() / block.totalCapacity * 100) else 0.0
            )
        }

        return DashboardStatsResponse(
            totalAttendees = total,
            preRegistered = preRegistered,
            walkIns = walkIns,
            checkedIn = checkedIn,
            pendingEntry = total - checkedIn,
            housingRequired = housingRequired,
            housingAllocated = housingAllocated,
            checkInPercentage = checkInPct,
            workshopStats = workshopStats,
            competitionStats = competitionStats,
            blockOccupancy = blockOccupancy
        )
    }
}

