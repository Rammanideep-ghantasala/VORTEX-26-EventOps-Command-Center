package com.vortex.server.repository

import com.vortex.server.model.entity.HousingAllocation
import com.vortex.server.model.entity.HousingBlock
import com.vortex.server.model.entity.Room
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface HousingBlockRepository : JpaRepository<HousingBlock, Long> {
    fun findAllByOrderByBlockTypeAscBlockNameAsc(): List<HousingBlock>
}

@Repository
interface RoomRepository : JpaRepository<Room, Long> {
    fun findByBlockId(blockId: Long): List<Room>

    @Query("SELECT r FROM Room r WHERE r.block.id = :blockId AND r.occupied < r.capacity ORDER BY r.roomNumber ASC")
    fun findAvailableRoomsByBlock(blockId: Long): List<Room>
}

@Repository
interface HousingAllocationRepository : JpaRepository<HousingAllocation, Long> {
    fun findByAttendeeId(attendeeId: Long): Optional<HousingAllocation>
    fun existsByAttendeeId(attendeeId: Long): Boolean
    fun countByCheckedIn(checkedIn: Boolean): Long
    fun countByCheckedOut(checkedOut: Boolean): Long
}

