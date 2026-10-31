package com.vortex.server.repository

import com.vortex.server.model.entity.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface HousingBlockRepository : JpaRepository<HousingBlock, Long> {
    fun findAllByOrderByBlockTypeAscBlockNameAsc(): List<HousingBlock>
    fun findByBlockType(blockType: BlockType): List<HousingBlock>
}

@Repository
interface RoomRepository : JpaRepository<Room, Long> {
    fun findByBlockId(blockId: Long): List<Room>

    @Query("SELECT r FROM Room r WHERE r.block.id = :blockId ORDER BY r.roomNumber ASC")
    fun findAllByBlockIdOrderByRoomNumber(blockId: Long): List<Room>
}

@Repository
interface HousingAllocationRepository : JpaRepository<HousingAllocation, Long> {
    fun findByAttendeeIdAndStatusIn(attendeeId: Long, statuses: List<AllocationStatus>): Optional<HousingAllocation>
    fun findAllByAttendeeIdOrderByAllocatedAtDesc(attendeeId: Long): List<HousingAllocation>

    fun existsByAttendeeIdAndStatusIn(attendeeId: Long, statuses: List<AllocationStatus>): Boolean

    fun countByStatus(status: AllocationStatus): Long

    @Query("""
        SELECT COUNT(ha) FROM HousingAllocation ha
        WHERE ha.room.id = :roomId
        AND ha.status IN ('ALLOCATED', 'CHECKED_IN')
        AND ha.fromDate <= :toDate
        AND ha.toDate >= :fromDate
    """)
    fun countOverlappingAllocations(
        @Param("roomId") roomId: Long,
        @Param("fromDate") fromDate: LocalDate,
        @Param("toDate") toDate: LocalDate
    ): Long

    @Query("""
        SELECT COUNT(ha) FROM HousingAllocation ha
        WHERE ha.room.id = :roomId
        AND ha.status IN ('ALLOCATED', 'CHECKED_IN')
    """)
    fun countActiveAllocationsByRoomId(@Param("roomId") roomId: Long): Int

    @Query("""
        SELECT ha FROM HousingAllocation ha
        WHERE ha.status = 'ALLOCATED'
        AND ha.fromDate <= :targetDate
        ORDER BY ha.fromDate ASC
    """)
    fun findUpcomingCheckIns(@Param("targetDate") targetDate: LocalDate): List<HousingAllocation>

    @Query("""
        SELECT ha FROM HousingAllocation ha
        WHERE ha.status = 'CHECKED_IN'
        AND ha.toDate <= :targetDate
        ORDER BY ha.toDate ASC
    """)
    fun findUpcomingCheckOuts(@Param("targetDate") targetDate: LocalDate): List<HousingAllocation>
}
