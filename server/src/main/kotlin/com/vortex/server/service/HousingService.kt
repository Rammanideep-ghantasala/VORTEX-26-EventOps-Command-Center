package com.vortex.server.service

import com.vortex.server.exception.BadRequestException
import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.ResourceNotFoundException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.*
import com.vortex.server.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.LocalDate

@Service
class HousingService(
    private val housingBlockRepository: HousingBlockRepository,
    private val roomRepository: RoomRepository,
    private val housingAllocationRepository: HousingAllocationRepository,
    private val attendeeRepository: AttendeeRepository,
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getAllBlocks(genderFilter: String? = null): List<HousingBlockResponse> {
        val blocks = housingBlockRepository.findAllByOrderByBlockTypeAscBlockNameAsc()
        val normalizedGender = genderFilter?.trim()?.uppercase()
        return blocks
            .filter { block ->
                when (normalizedGender) {
                    "MALE" -> block.blockType == BlockType.BOYS || block.blockType == BlockType.VIP
                    "FEMALE" -> block.blockType == BlockType.GIRLS || block.blockType == BlockType.VIP
                    else -> true
                }
            }
            .map { block ->
            val rooms = roomRepository.findAllByBlockIdOrderByRoomNumber(block.id).map { room ->
                val activeCount = housingAllocationRepository.countActiveAllocationsByRoomId(room.id)
                RoomResponse.from(room, activeCount)
            }
            val totalCap = rooms.sumOf { it.capacity }
            val occupied = rooms.sumOf { it.occupied }
            val available = maxOf(0, totalCap - occupied)

            HousingBlockResponse(
                id = block.id,
                blockName = block.blockName,
                blockType = block.blockType.name,
                totalCapacity = totalCap,
                occupiedBeds = occupied,
                availableBeds = available,
                rooms = rooms
            )
        }
    }

    @Transactional
    fun allocateRoom(request: AllocateRoomRequest, operatorEmail: String): HousingAllocationResponse {
        // 1. Mandatory date validation
        if (request.toDate.isBefore(request.fromDate)) {
            throw BadRequestException("Invalid date range: To Date (${request.toDate}) cannot be earlier than From Date (${request.fromDate})")
        }

        // 2. Attendee retrieval
        val attendee = attendeeRepository.findByIdForUpdate(request.attendeeId)
            .orElseThrow { ResourceNotFoundException("Attendee", request.attendeeId.toString()) }

        if (!attendee.housingRequired) {
            throw BadRequestException("Attendee ${attendee.fullName} has not opted for accommodation")
        }

        // 3. Room & Block retrieval
        val room = roomRepository.findByIdForUpdate(request.roomId)
            .orElseThrow { ResourceNotFoundException("Room", request.roomId.toString()) }
        val block = room.block

        // 4. Gender-based hostel allocation check
        val gender = attendee.gender
        if (gender == null) {
            if (!request.manualGenderOverride) {
                throw BadRequestException("Attendee gender is not specified in profile. Manual review is required before allocation.")
            }
        } else {
            when (gender) {
                Gender.MALE -> {
                    if (block.blockType != BlockType.BOYS && block.blockType != BlockType.VIP) {
                        throw BadRequestException("Gender mismatch: Male attendees can only be allocated to Boys Hostels (e.g. Garnet A). Selected: ${block.blockName}")
                    }
                }
                Gender.FEMALE -> {
                    if (block.blockType != BlockType.GIRLS && block.blockType != BlockType.VIP) {
                        throw BadRequestException("Gender mismatch: Female attendees can only be allocated to Girls Hostels (e.g. Opal C). Selected: ${block.blockName}")
                    }
                }
                Gender.OTHER -> {
                    // Manual review required unless explicitly permitted
                    if (!request.manualGenderOverride && block.blockType != BlockType.VIP) {
                        throw BadRequestException("Attendee has gender '${gender}'. Manual review is required before allocation to ${block.blockName}.")
                    }
                }
            }
        }

        // 5. Existing active allocation overlap for this attendee
        val activeAllocations = housingAllocationRepository.findAllByAttendeeIdOrderByAllocatedAtDesc(attendee.id)
            .filter { it.status == AllocationStatus.ALLOCATED || it.status == AllocationStatus.CHECKED_IN }

        val hasOverlap = activeAllocations.any { existing ->
            !existing.toDate.isBefore(request.fromDate) && !existing.fromDate.isAfter(request.toDate)
        }
        if (hasOverlap) {
            throw ConflictException("Attendee already has an active accommodation allocation overlapping with the requested date range (${request.fromDate} to ${request.toDate}).")
        }

        // 6. Room capacity & date overlap check (concurrency protected)
        val overlappingCount = housingAllocationRepository.countOverlappingAllocations(room.id, request.fromDate, request.toDate)
        if (overlappingCount >= room.capacity) {
            throw BadRequestException("Room ${room.roomNumber} in ${block.blockName} is at full capacity (${overlappingCount}/${room.capacity} beds occupied) for the requested period (${request.fromDate} to ${request.toDate}).")
        }

        val operator = userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        // 7. Persist allocation with status ALLOCATED
        val allocation = HousingAllocation(
            attendee = attendee,
            room = room,
            block = block,
            fromDate = request.fromDate,
            toDate = request.toDate,
            status = AllocationStatus.ALLOCATED,
            checkedIn = false,
            checkedOut = false,
            allocatedBy = operator
        )

        // Increment counter caches for backward compatibility
        room.occupied = (overlappingCount + 1).toInt()
        roomRepository.save(room)

        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional
    fun roomCheckIn(allocationId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findById(allocationId)
            .orElseThrow { ResourceNotFoundException("Allocation", allocationId.toString()) }

        if (allocation.status == AllocationStatus.CHECKED_OUT || allocation.checkedOut) {
            throw BadRequestException("Cannot check in: Attendee has already checked out of this allocation")
        }
        if (allocation.status == AllocationStatus.CHECKED_IN || allocation.checkedIn) {
            throw ConflictException("Attendee is already checked into room ${allocation.room.roomNumber}")
        }

        allocation.status = AllocationStatus.CHECKED_IN
        allocation.checkedIn = true
        allocation.checkedInAt = Instant.now()
        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional
    fun roomCheckOut(allocationId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findById(allocationId)
            .orElseThrow { ResourceNotFoundException("Allocation", allocationId.toString()) }

        if (allocation.status == AllocationStatus.CHECKED_OUT || allocation.checkedOut) {
            throw ConflictException("Attendee is already checked out of room ${allocation.room.roomNumber}")
        }

        // Mark as checked out / vacated
        allocation.status = AllocationStatus.CHECKED_OUT
        allocation.checkedOut = true
        allocation.checkedOutAt = Instant.now()

        // Update room counter cache
        val room = allocation.room
        val activeCount = housingAllocationRepository.countActiveAllocationsByRoomId(room.id)
        room.occupied = maxOf(0, activeCount - 1)
        roomRepository.save(room)

        // NEVER delete the record — historical record is preserved!
        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional
    fun updateRoomCapacity(roomId: Long, newCapacity: Int): RoomResponse {
        if (newCapacity < 1 || newCapacity > 20) {
            throw BadRequestException("Room capacity must be between 1 and 20 beds")
        }
        val room = roomRepository.findById(roomId)
            .orElseThrow { ResourceNotFoundException("Room", roomId.toString()) }

        val activeCount = housingAllocationRepository.countActiveAllocationsByRoomId(room.id)
        if (newCapacity < activeCount) {
            throw BadRequestException("Cannot reduce room capacity to $newCapacity: room currently has $activeCount active allocations.")
        }

        room.capacity = newCapacity
        val saved = roomRepository.save(room)
        return RoomResponse.from(saved, activeCount)
    }

    @Transactional(readOnly = true)
    fun getAllocations(status: String? = null): List<HousingAllocationResponse> {
        val all = housingAllocationRepository.findAll()
        val filtered = if (status != null) {
            val s = runCatching { AllocationStatus.valueOf(status.uppercase()) }.getOrNull()
            if (s != null) all.filter { it.status == s } else all
        } else {
            all
        }
        return filtered.sortedByDescending { it.allocatedAt }.map { HousingAllocationResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun getAllocationByAttendee(attendeeId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findAllByAttendeeIdOrderByAllocatedAtDesc(attendeeId)
            .firstOrNull { it.status == AllocationStatus.ALLOCATED || it.status == AllocationStatus.CHECKED_IN }
            ?: throw ResourceNotFoundException("Active accommodation allocation for attendee", attendeeId.toString())
        return HousingAllocationResponse.from(allocation)
    }

    @Transactional(readOnly = true)
    fun getAttendeeAccommodationHistory(attendeeId: Long): List<HousingAllocationResponse> {
        return housingAllocationRepository.findAllByAttendeeIdOrderByAllocatedAtDesc(attendeeId)
            .map { HousingAllocationResponse.from(it) }
    }

    @Transactional(readOnly = true)
    fun getAccommodationDashboard(): AccommodationDashboardResponse {
        val blocks = housingBlockRepository.findAllByOrderByBlockTypeAscBlockNameAsc()
        val allRooms = roomRepository.findAll()

        var totalBedCap = 0
        var totalOccupied = 0

        val hostelOccupancy = blocks.map { block ->
            val roomsInBlock = allRooms.filter { it.block.id == block.id }
            val blockCap = roomsInBlock.sumOf { it.capacity }
            val blockOccupied = roomsInBlock.sumOf { housingAllocationRepository.countActiveAllocationsByRoomId(it.id) }
            val blockAvail = maxOf(0, blockCap - blockOccupied)

            totalBedCap += blockCap
            totalOccupied += blockOccupied

            BlockOccupancyDto(
                blockId = block.id,
                blockName = block.blockName,
                blockType = block.blockType.name,
                totalCapacity = blockCap,
                occupiedBeds = blockOccupied,
                availableBeds = blockAvail,
                occupancyPercentage = if (blockCap > 0) (blockOccupied.toDouble() / blockCap * 100.0) else 0.0
            )
        }

        val roomOccupancy = allRooms.map { room ->
            val activeOccupied = housingAllocationRepository.countActiveAllocationsByRoomId(room.id)
            RoomOccupancyDto(
                roomId = room.id,
                roomNumber = room.roomNumber,
                blockName = room.block.blockName,
                blockType = room.block.blockType.name,
                capacity = room.capacity,
                occupied = activeOccupied,
                availableBeds = maxOf(0, room.capacity - activeOccupied),
                isFull = activeOccupied >= room.capacity
            )
        }

        val today = LocalDate.now()
        val upcomingCheckIns = housingAllocationRepository.findUpcomingCheckIns(today.plusDays(7))
            .map { HousingAllocationResponse.from(it) }
        val upcomingCheckOuts = housingAllocationRepository.findUpcomingCheckOuts(today.plusDays(7))
            .map { HousingAllocationResponse.from(it) }

        return AccommodationDashboardResponse(
            totalHostels = blocks.size,
            totalRooms = allRooms.size,
            totalBedCapacity = totalBedCap,
            occupiedBeds = totalOccupied,
            availableBeds = maxOf(0, totalBedCap - totalOccupied),
            hostelOccupancy = hostelOccupancy,
            roomOccupancy = roomOccupancy,
            upcomingCheckIns = upcomingCheckIns,
            upcomingCheckOuts = upcomingCheckOuts
        )
    }
}
