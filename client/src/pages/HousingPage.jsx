import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { housingApi, attendeeApi } from '../api/apiClient'
import {
  Home, Bed, Users, PlusCircle, Loader2
} from 'lucide-react'
import { Spinner, EmptyState } from '../components/common/ui'
import toast from 'react-hot-toast'

export default function HousingPage() {
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState('ALL')
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Allocation form state
  const [allocAttendeeId, setAllocAttendeeId] = useState('')
  const [allocBlockId, setAllocBlockId] = useState('')
  const [allocRoomId, setAllocRoomId] = useState('')

  // Queries
  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['housing-blocks'],
    queryFn: () => housingApi.getBlocks().then(r => r.data),
  })

  const { data: allocations, isLoading: allocsLoading } = useQuery({
    queryKey: ['housing-allocations'],
    queryFn: () => housingApi.getAllocations().then(r => r.data),
  })

  const { data: attendeesData } = useQuery({
    queryKey: ['attendees-unallocated'],
    queryFn: () => attendeeApi.getAll({ size: 100 }).then(r => r.data),
  })

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: (data) => housingApi.allocate(data),
    onSuccess: () => {
      toast.success('Attendee allocated to room successfully!')
      queryClient.invalidateQueries({ queryKey: ['housing-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['housing-allocations'] })
      setShowAllocateModal(false)
      setAllocAttendeeId('')
      setAllocBlockId('')
      setAllocRoomId('')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to allocate bed')
    }
  })

  const checkInMutation = useMutation({
    mutationFn: (id) => housingApi.roomCheckIn(id),
    onSuccess: () => {
      toast.success('Room check-in confirmed')
      queryClient.invalidateQueries({ queryKey: ['housing-allocations'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Check-in failed')
  })

  const checkOutMutation = useMutation({
    mutationFn: (id) => housingApi.roomCheckOut(id),
    onSuccess: () => {
      toast.success('Room checkout completed. Bed released.')
      queryClient.invalidateQueries({ queryKey: ['housing-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['housing-allocations'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Checkout failed')
  })

  const blockTypeStyles = {
    BOYS: {
      border: 'border-blue-500/40 bg-gradient-to-br from-blue-950/40 to-gray-900/60',
      badge: 'badge-blue',
      tag: 'BOYS HOSTEL'
    },
    GIRLS: {
      border: 'border-violet-500/40 bg-gradient-to-br from-violet-950/40 to-gray-900/60',
      badge: 'badge-violet',
      tag: 'GIRLS HOSTEL'
    },
    VIP: {
      border: 'border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-gray-900/60',
      badge: 'badge-amber',
      tag: 'VIP SUITES'
    },
  }

  const filteredBlocks = (blocks || []).filter(b => {
    if (filterType === 'ALL') return true
    return b.blockType === filterType
  })

  // Candidates for allocation: attendees requiring housing
  const unallocatedAttendees = (attendeesData?.data || []).filter(a => a.housingRequired)

  // Available rooms for selected block in allocation modal
  const selectedBlockObj = (blocks || []).find(b => b.id === Number(allocBlockId))
  const availableRoomsForBlock = (selectedBlockObj?.rooms || []).filter(r => !r.isFull)

  const handleAllocateSubmit = (e) => {
    e.preventDefault()
    if (!allocAttendeeId || !allocRoomId) {
      toast.error('Please select both an attendee and a room')
      return
    }
    allocateMutation.mutate({
      attendeeId: Number(allocAttendeeId),
      roomId: Number(allocRoomId),
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Title and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home size={22} className="text-emerald-400" /> Housing & Hostel Operations
          </h2>
          <p className="text-gray-400 text-sm">
            Real-time room occupancy and gender-segregated bed allocation
          </p>
        </div>

        <button
          onClick={() => setShowAllocateModal(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm font-semibold shadow-lg shadow-blue-500/20"
        >
          <PlusCircle size={16} /> Allocate Bed to Attendee
        </button>
      </div>

      {/* Featured Hostels Quick Pill Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="glass-card p-3 border-l-4 border-l-blue-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 font-bold text-sm">
            GA
          </div>
          <div>
            <p className="text-white text-sm font-bold flex items-center gap-2">
              Hostel: Garnet A
              <span className="badge-blue text-xs">Boys Wing</span>
            </p>
            <p className="text-gray-400 text-xs">Primary boarding block for male delegates & participants</p>
          </div>
        </div>

        <div className="glass-card p-3 border-l-4 border-l-violet-500 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 font-bold text-sm">
            OC
          </div>
          <div>
            <p className="text-white text-sm font-bold flex items-center gap-2">
              Hostel: Opal C
              <span className="badge-violet text-xs">Girls Wing</span>
            </p>
            <p className="text-gray-400 text-xs">Secured residential complex for female delegates & participants</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Hostels' },
          { id: 'BOYS', label: 'Garnet A (Boys)' },
          { id: 'GIRLS', label: 'Opal C (Girls)' },
          { id: 'VIP', label: 'VIP Guest House' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Hostel Blocks Grid */}
      {blocksLoading ? (
        <div className="flex justify-center py-16"><Spinner size={8} /></div>
      ) : filteredBlocks.length === 0 ? (
        <EmptyState icon={Home} title="No blocks match this filter" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredBlocks.map(block => {
            const style = blockTypeStyles[block.blockType] || blockTypeStyles.BOYS
            const occupancyPct = block.totalCapacity > 0
              ? (block.occupiedBeds / block.totalCapacity) * 100
              : 0

            return (
              <div key={block.id} className={`glass-card p-5 border ${style.border}`}>
                {/* Block header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">{block.blockName}</h3>
                      <span className={`${style.badge} text-xs`}>{style.tag}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {block.rooms?.length || 0} Rooms configured · {block.availableBeds} beds available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono font-bold text-lg">
                      {block.occupiedBeds}
                      <span className="text-gray-500 font-normal text-sm">/{block.totalCapacity}</span>
                    </p>
                    <span className={`text-xs font-semibold ${occupancyPct > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {occupancyPct.toFixed(0)}% Occupied
                    </span>
                  </div>
                </div>

                {/* Occupancy bar */}
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      occupancyPct > 90 ? 'bg-rose-500' :
                      occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>

                {/* Rooms Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Room Grid Matrix</span>
                    <span className="text-gray-500">Click room to inspect</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {block.rooms?.map(room => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoom({ ...room, blockName: block.blockName })}
                        className={`rounded-lg p-2 text-center text-xs font-mono transition-all transform hover:scale-105 ${
                          room.isFull
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                            : room.occupied > 0
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        }`}
                      >
                        <div className="font-bold">{room.roomNumber}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{room.occupied}/{room.capacity}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800/80 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Partial
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Full
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Active Room Allocations Ledger */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users size={18} className="text-blue-400" /> Active Hostel Allocations Ledger
            </h3>
            <p className="text-gray-400 text-xs">Assigned beds in Garnet A and Opal C</p>
          </div>
          <span className="text-xs text-gray-500">
            {allocations?.length || 0} total occupied allocations
          </span>
        </div>

        {allocsLoading ? (
          <div className="flex justify-center py-6"><Spinner size={6} /></div>
        ) : allocations?.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No active allocations yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase">
                  <th className="text-left px-3 py-2.5">Participant</th>
                  <th className="text-left px-3 py-2.5">Reg ID</th>
                  <th className="text-left px-3 py-2.5">Hostel & Room</th>
                  <th className="text-left px-3 py-2.5">Room Status</th>
                  <th className="text-right px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations?.map(alloc => (
                  <tr key={alloc.id} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                    <td className="px-3 py-2.5 font-medium text-white">{alloc.attendeeName}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{alloc.registrationId}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-gray-200">{alloc.blockName}</span>
                      <span className="text-blue-400 font-mono text-xs ml-1.5 font-bold">[{alloc.roomNumber}]</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {alloc.checkedOut ? (
                        <span className="badge-red text-xs">Checked Out</span>
                      ) : alloc.checkedIn ? (
                        <span className="badge-green text-xs">Checked In</span>
                      ) : (
                        <span className="badge-amber text-xs">Assigned (Not in room)</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right space-x-2">
                      {!alloc.checkedIn && !alloc.checkedOut && (
                        <button
                          onClick={() => checkInMutation.mutate(alloc.id)}
                          className="btn-secondary text-xs py-1 px-2.5 text-emerald-400 hover:text-emerald-300"
                        >
                          Check In
                        </button>
                      )}
                      {alloc.checkedIn && !alloc.checkedOut && (
                        <button
                          onClick={() => checkOutMutation.mutate(alloc.id)}
                          className="btn-danger text-xs py-1 px-2.5"
                        >
                          Check Out & Free Bed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {showAllocateModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAllocateModal(false)}
        >
          <div
            className="glass-card p-6 max-w-lg w-full space-y-4 animate-fade-in border border-blue-500/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Bed size={18} className="text-blue-400" /> Allocate Bed to Participant
              </h3>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="text-gray-500 hover:text-gray-300 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="space-y-4">
              {/* Attendee select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Select Participant (Housing Requested)</label>
                <select
                  required
                  value={allocAttendeeId}
                  onChange={e => setAllocAttendeeId(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Choose Participant --</option>
                  {unallocatedAttendees.map(att => (
                    <option key={att.id} value={att.id}>
                      {att.fullName} ({att.registrationId} - {att.college})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hostel Block Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Target Hostel</label>
                <select
                  required
                  value={allocBlockId}
                  onChange={e => {
                    setAllocBlockId(e.target.value)
                    setAllocRoomId('')
                  }}
                  className="input-field"
                >
                  <option value="">-- Choose Hostel --</option>
                  {(blocks || []).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.blockName} ({b.availableBeds} beds available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Target Room</label>
                <select
                  required
                  disabled={!allocBlockId}
                  value={allocRoomId}
                  onChange={e => setAllocRoomId(e.target.value)}
                  className="input-field disabled:opacity-50"
                >
                  <option value="">-- Choose Available Room --</option>
                  {availableRoomsForBlock.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} ({r.availableBeds} of {r.capacity} beds free)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocateMutation.isPending || !allocAttendeeId || !allocRoomId}
                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2"
                >
                  {allocateMutation.isPending ? (
                    <><Loader2 size={15} className="animate-spin" /> Allocating...</>
                  ) : (
                    'Confirm Allocation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRoom(null)}
        >
          <div
            className="glass-card p-5 max-w-sm w-full space-y-3 animate-fade-in border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Room {selectedRoom.roomNumber}</h3>
              <button onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-white text-lg">×</button>
            </div>
            <p className="text-gray-400 text-xs">{selectedRoom.blockName}</p>

            <div className="p-3 bg-gray-800/80 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Bed Capacity:</span>
                <span className="text-white font-mono">{selectedRoom.capacity} Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Occupied:</span>
                <span className="text-rose-400 font-mono font-bold">{selectedRoom.occupied} Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedRoom.capacity - selectedRoom.occupied} Beds</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedRoom(null)
                setShowAllocateModal(true)
              }}
              className="btn-primary w-full py-2 text-xs"
            >
              Allocate Attendee Here
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
