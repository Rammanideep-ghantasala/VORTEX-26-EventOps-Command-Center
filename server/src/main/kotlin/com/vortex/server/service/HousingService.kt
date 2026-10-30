package com.vortex.server.service

import com.vortex.server.exception.BadRequestException
import com.vortex.server.exception.ConflictException
import com.vortex.server.exception.ResourceNotFoundException
import com.vortex.server.model.dto.*
import com.vortex.server.model.entity.HousingAllocation
import com.vortex.server.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
class HousingService(
    private val housingBlockRepository: HousingBlockRepository,
    private val roomRepository: RoomRepository,
    private val housingAllocationRepository: HousingAllocationRepository,
    private val attendeeRepository: AttendeeRepository,
    private val userRepository: UserRepository
) {

    @Transactional(readOnly = true)
    fun getAllBlocks(): List<HousingBlockResponse> {
        return housingBlockRepository.findAllByOrderByBlockTypeAscBlockNameAsc().map { block ->
            val rooms = roomRepository.findByBlockId(block.id).map { RoomResponse.from(it) }
            HousingBlockResponse(
                id = block.id,
                blockName = block.blockName,
                blockType = block.blockType.name,
                totalCapacity = block.totalCapacity,
                occupiedBeds = block.occupiedBeds,
                availableBeds = block.totalCapacity - block.occupiedBeds,
                rooms = rooms
            )
        }
    }

    @Transactional
    fun allocateRoom(request: AllocateRoomRequest, operatorEmail: String): HousingAllocationResponse {
        if (housingAllocationRepository.existsByAttendeeId(request.attendeeId)) {
            throw ConflictException("Attendee is already allocated a room")
        }
        val attendee = attendeeRepository.findById(request.attendeeId)
            .orElseThrow { ResourceNotFoundException("Attendee", request.attendeeId.toString()) }
        if (!attendee.housingRequired) {
            throw BadRequestException("Attendee has not opted for housing")
        }
        val room = roomRepository.findById(request.roomId)
            .orElseThrow { ResourceNotFoundException("Room", request.roomId.toString()) }
        if (room.isFull) {
            throw BadRequestException("Room ${room.roomNumber} is at full capacity")
        }
        val operator = userRepository.findByEmail(operatorEmail)
            .orElseThrow { ResourceNotFoundException("User", operatorEmail) }

        // Atomic occupancy increment
        room.occupied += 1
        room.block.occupiedBeds += 1
        roomRepository.save(room)
        housingBlockRepository.save(room.block)

        val allocation = HousingAllocation(
            attendee = attendee,
            room = room,
            block = room.block,
            allocatedBy = operator
        )
        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional
    fun roomCheckIn(allocationId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findById(allocationId)
            .orElseThrow { ResourceNotFoundException("Allocation", allocationId.toString()) }
        if (allocation.checkedIn) throw ConflictException("Already checked into room")
        allocation.checkedIn = true
        allocation.checkedInAt = Instant.now()
        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional
    fun roomCheckOut(allocationId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findById(allocationId)
            .orElseThrow { ResourceNotFoundException("Allocation", allocationId.toString()) }
        if (!allocation.checkedIn) throw BadRequestException("Cannot check out without checking in first")
        if (allocation.checkedOut) throw ConflictException("Already checked out")
        allocation.checkedOut = true
        allocation.checkedOutAt = Instant.now()

        // Release the bed
        val room = allocation.room
        room.occupied = maxOf(0, room.occupied - 1)
        room.block.occupiedBeds = maxOf(0, room.block.occupiedBeds - 1)
        roomRepository.save(room)
        housingBlockRepository.save(room.block)

        return HousingAllocationResponse.from(housingAllocationRepository.save(allocation))
    }

    @Transactional(readOnly = true)
    fun getAllocationByAttendee(attendeeId: Long): HousingAllocationResponse {
        val allocation = housingAllocationRepository.findByAttendeeId(attendeeId)
            .orElseThrow { ResourceNotFoundException("Housing allocation for attendee", attendeeId.toString()) }
        return HousingAllocationResponse.from(allocation)
    }
}

