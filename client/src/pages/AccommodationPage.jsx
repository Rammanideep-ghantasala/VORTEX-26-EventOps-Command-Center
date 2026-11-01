import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accommodationApi, attendeeApi } from '../api/apiClient'
import {
  Home, Bed, Users, Calendar, AlertTriangle, PlusCircle, CheckCircle2,
  LogOut, ShieldAlert, Edit2, Loader2, Sparkles, Clock, ArrowRight
} from 'lucide-react'
import { Badge, Spinner, EmptyState } from '../components/common/ui'
import toast from 'react-hot-toast'

export default function AccommodationPage() {
  const queryClient = useQueryClient()
  const [filterType, setFilterType] = useState('ALL')
  const [showAllocateModal, setShowAllocateModal] = useState(false)
  const [showCapacityModal, setShowCapacityModal] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [activeTab, setActiveTab] = useState('HOSTELS') // 'HOSTELS' | 'DASHBOARD' | 'HISTORY'

  // Allocation Form State
  const [allocAttendeeId, setAllocAttendeeId] = useState('')
  const [allocBlockId, setAllocBlockId] = useState('')
  const [allocRoomId, setAllocRoomId] = useState('')
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  })
  const [manualOverride, setManualOverride] = useState(false)

  // Room capacity edit state
  const [editingRoom, setEditingRoom] = useState(null)
  const [newCapacity, setNewCapacity] = useState(4)

  // Queries
  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['accommodation-blocks'],
    queryFn: () => accommodationApi.getBlocks().then(r => r.data),
  })

  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['accommodation-dashboard'],
    queryFn: () => accommodationApi.getDashboard().then(r => r.data),
  })

  const { data: allocations, isLoading: allocsLoading } = useQuery({
    queryKey: ['accommodation-allocations'],
    queryFn: () => accommodationApi.getAllocations().then(r => r.data),
  })

  const { data: attendeesData } = useQuery({
    queryKey: ['attendees-housing-req'],
    queryFn: () => attendeeApi.getAll({ size: 100 }).then(r => r.data),
  })

  // Mutations
  const allocateMutation = useMutation({
    mutationFn: (data) => accommodationApi.allocate(data),
    onSuccess: () => {
      toast.success('Accommodation allocated successfully!')
      queryClient.invalidateQueries({ queryKey: ['accommodation-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-allocations'] })
      setShowAllocateModal(false)
      setAllocAttendeeId('')
      setAllocBlockId('')
      setAllocRoomId('')
      setManualOverride(false)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to allocate accommodation')
    }
  })

  const checkInMutation = useMutation({
    mutationFn: (id) => accommodationApi.roomCheckIn(id),
    onSuccess: () => {
      toast.success('Attendee checked into room!')
      queryClient.invalidateQueries({ queryKey: ['accommodation-allocations'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-dashboard'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Check-in failed')
  })

  const checkOutMutation = useMutation({
    mutationFn: (id) => accommodationApi.roomCheckOut(id),
    onSuccess: () => {
      toast.success('Attendee vacated. Bed capacity released!')
      queryClient.invalidateQueries({ queryKey: ['accommodation-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-allocations'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Checkout failed')
  })

  const capacityMutation = useMutation({
    mutationFn: ({ id, capacity }) => accommodationApi.updateRoomCapacity(id, capacity),
    onSuccess: () => {
      toast.success('Room capacity updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['accommodation-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['accommodation-dashboard'] })
      setShowCapacityModal(false)
      setEditingRoom(null)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update capacity')
  })

  // Gender-based auto-filtering logic
  const attendeeList = attendeesData?.data || attendeesData?.content || []
  const selectedAttendee = attendeeList.find(a => a.id === Number(allocAttendeeId))
  const attendeeGender = selectedAttendee?.gender // 'MALE', 'FEMALE', or null

  // Compatible blocks based on gender:
  const compatibleBlocks = (blocks || []).filter(block => {
    if (!selectedAttendee || !attendeeGender || manualOverride) return true
    if (attendeeGender === 'MALE') return block.blockType === 'BOYS' || block.blockType === 'VIP'
    if (attendeeGender === 'FEMALE') return block.blockType === 'GIRLS' || block.blockType === 'VIP'
    return true
  })

  const selectedBlockObj = (blocks || []).find(b => b.id === Number(allocBlockId))
  const availableRoomsForBlock = (selectedBlockObj?.rooms || []).filter(r => !r.isFull)

  const handleAllocateSubmit = (e) => {
    e.preventDefault()
    if (!allocAttendeeId || !allocRoomId) {
      toast.error('Please select both an attendee and a room')
      return
    }
    if (toDate < fromDate) {
      toast.error('To Date cannot be earlier than From Date')
      return
    }
    if (!attendeeGender && !manualOverride) {
      toast.error('Attendee gender is missing. Manual review override is required.')
      return
    }

    allocateMutation.mutate({
      attendeeId: Number(allocAttendeeId),
      roomId: Number(allocRoomId),
      fromDate,
      toDate,
      manualGenderOverride: manualOverride,
    })
  }

  const handleCapacitySubmit = (e) => {
    e.preventDefault()
    if (!editingRoom) return
    capacityMutation.mutate({ id: editingRoom.id, capacity: Number(newCapacity) })
  }

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

  const unallocatedAttendees = (attendeesData?.data || attendeesData?.content || []).filter(a => a.housingRequired)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home size={22} className="text-emerald-400" /> Accommodation Management
          </h2>
          <p className="text-gray-400 text-sm">
            Gender-based hostel allocation, date management, and real-time room vacancy control
          </p>
        </div>

        <button
          onClick={() => {
            setShowAllocateModal(true)
            setAllocAttendeeId('')
            setAllocBlockId('')
            setAllocRoomId('')
            setManualOverride(false)
          }}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm font-semibold shadow-lg shadow-blue-500/20"
        >
          <PlusCircle size={16} /> Allocate Accommodation
        </button>
      </div>

      {/* Featured Hostels Notice Bar */}
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
            <p className="text-gray-400 text-xs">Designated residence for male delegates & attendees</p>
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
            <p className="text-gray-400 text-xs">Designated residence for female delegates & attendees</p>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {[
          { id: 'HOSTELS', label: 'Hostel Blocks & Rooms' },
          { id: 'DASHBOARD', label: 'Super Admin Dashboard' },
          { id: 'HISTORY', label: 'Allocations & Vacated History' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: HOSTELS & ROOMS */}
      {activeTab === 'HOSTELS' && (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-filter tabs */}
          <div className="flex gap-2 pb-1 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Hostels' },
              { id: 'BOYS', label: 'Hostel Garnet A (Boys)' },
              { id: 'GIRLS', label: 'Hostel Opal C (Girls)' },
              { id: 'VIP', label: 'VIP Guest House' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filterType === tab.id
                    ? 'bg-gray-700 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-200 bg-gray-900/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {blocksLoading ? (
            <div className="flex justify-center py-16"><Spinner size={8} /></div>
          ) : filteredBlocks.length === 0 ? (
            <EmptyState icon={Home} title="No hostels match this filter" />
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

                    {/* Rooms Matrix */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Room Grid Matrix</span>
                        <span className="text-gray-500">Click to inspect or edit capacity</span>
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
        </div>
      )}

      {/* TAB 2: SUPER ADMIN DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6 animate-fade-in">
          {dashLoading ? (
            <div className="flex justify-center py-16"><Spinner size={8} /></div>
          ) : (
            <>
              {/* Summary KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="stat-card">
                  <p className="text-gray-400 text-xs uppercase font-medium">Total Hostels</p>
                  <p className="text-2xl font-bold text-white mt-1">{dashboardData?.totalHostels || 0}</p>
                </div>
                <div className="stat-card">
                  <p className="text-gray-400 text-xs uppercase font-medium">Total Rooms</p>
                  <p className="text-2xl font-bold text-white mt-1">{dashboardData?.totalRooms || 0}</p>
                </div>
                <div className="stat-card">
                  <p className="text-gray-400 text-xs uppercase font-medium">Bed Capacity</p>
                  <p className="text-2xl font-bold text-white mt-1">{dashboardData?.totalBedCapacity || 0}</p>
                </div>
                <div className="stat-card">
                  <p className="text-gray-400 text-xs uppercase font-medium">Occupied Beds</p>
                  <p className="text-2xl font-bold text-rose-400 mt-1">{dashboardData?.occupiedBeds || 0}</p>
                </div>
                <div className="stat-card">
                  <p className="text-gray-400 text-xs uppercase font-medium">Available Beds</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{dashboardData?.availableBeds || 0}</p>
                </div>
              </div>

              {/* Hostel-wise Occupancy Breakdown */}
              <div className="glass-card p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Home size={16} className="text-blue-400" /> Hostel-wise Bed Utilization
                </h3>
                <div className="space-y-3">
                  {(dashboardData?.hostelOccupancy || []).map((h, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-200 font-semibold">{h.blockName} ({h.blockType})</span>
                        <span className="text-gray-400">
                          {h.occupiedBeds} / {h.totalCapacity} beds ({h.occupancyPercentage.toFixed(1)}%) ·{' '}
                          <span className="text-emerald-400">{h.availableBeds} free</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            h.occupancyPercentage > 85 ? 'bg-rose-500' :
                            h.occupancyPercentage > 65 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, h.occupancyPercentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Check-ins and Check-outs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Upcoming Check-ins */}
                <div className="glass-card p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" /> Upcoming Check-Ins (Next 7 Days)
                  </h4>
                  {(dashboardData?.upcomingCheckIns || []).length === 0 ? (
                    <p className="text-gray-500 text-xs py-4 text-center">No upcoming check-ins scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dashboardData.upcomingCheckIns.slice(0, 5).map(alloc => (
                        <div key={alloc.id} className="p-2.5 bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <p className="text-white font-semibold">{alloc.attendee?.fullName || alloc.attendeeName}</p>
                            <p className="text-gray-400 font-mono text-[11px]">{alloc.blockName} [{alloc.roomNumber}]</p>
                          </div>
                          <div className="text-right">
                            <span className="badge-blue text-[11px]">From: {alloc.fromDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Check-outs */}
                <div className="glass-card p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-300 uppercase flex items-center gap-2">
                    <LogOut size={14} className="text-amber-400" /> Upcoming Check-Outs (Next 7 Days)
                  </h4>
                  {(dashboardData?.upcomingCheckOuts || []).length === 0 ? (
                    <p className="text-gray-500 text-xs py-4 text-center">No upcoming check-outs scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dashboardData.upcomingCheckOuts.slice(0, 5).map(alloc => (
                        <div key={alloc.id} className="p-2.5 bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <p className="text-white font-semibold">{alloc.attendee?.fullName || alloc.attendeeName}</p>
                            <p className="text-gray-400 font-mono text-[11px]">{alloc.blockName} [{alloc.roomNumber}]</p>
                          </div>
                          <div className="text-right">
                            <span className="badge-amber text-[11px]">Due: {alloc.toDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: ALLOCATIONS & VACATED HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="glass-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users size={18} className="text-blue-400" /> Complete Accommodation & Vacated History
              </h3>
              <p className="text-gray-400 text-xs">Historical records are permanently preserved upon checkout</p>
            </div>
            <span className="text-xs text-gray-500">
              {allocations?.length || 0} total lifetime allocations
            </span>
          </div>

          {allocsLoading ? (
            <div className="flex justify-center py-6"><Spinner size={6} /></div>
          ) : allocations?.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No allocations found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-400 uppercase">
                    <th className="text-left px-3 py-2.5">Participant</th>
                    <th className="text-left px-3 py-2.5">Reg ID</th>
                    <th className="text-left px-3 py-2.5">Hostel & Room</th>
                    <th className="text-left px-3 py-2.5">Allocation Period</th>
                    <th className="text-left px-3 py-2.5">Status</th>
                    <th className="text-right px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations?.map(alloc => (
                    <tr key={alloc.id} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                      <td className="px-3 py-2.5 font-medium text-white">{alloc.attendee?.fullName || alloc.attendeeName}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{alloc.attendee?.registrationId || alloc.registrationId}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-gray-200">{alloc.blockName}</span>
                        <span className="text-blue-400 font-mono text-xs ml-1.5 font-bold">[{alloc.roomNumber}]</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-300 font-mono">
                        {alloc.fromDate} <span className="text-gray-500">→</span> {alloc.toDate}
                      </td>
                      <td className="px-3 py-2.5">
                        {alloc.status === 'CHECKED_OUT' || alloc.checkedOut ? (
                          <span className="badge-red text-xs">Vacated (Checked Out)</span>
                        ) : alloc.status === 'CHECKED_IN' || alloc.checkedIn ? (
                          <span className="badge-green text-xs">Checked In</span>
                        ) : (
                          <span className="badge-amber text-xs">Allocated</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right space-x-2">
                        {alloc.status !== 'CHECKED_IN' && alloc.status !== 'CHECKED_OUT' && !alloc.checkedOut && (
                          <button
                            onClick={() => checkInMutation.mutate(alloc.id)}
                            disabled={checkInMutation.isPending}
                            className="btn-secondary text-xs py-1 px-2.5 text-emerald-400 hover:text-emerald-300"
                          >
                            Check In
                          </button>
                        )}
                        {(alloc.status === 'CHECKED_IN' || alloc.checkedIn) && !alloc.checkedOut && (
                          <button
                            onClick={() => checkOutMutation.mutate(alloc.id)}
                            disabled={checkOutMutation.isPending}
                            className="btn-danger text-xs py-1 px-2.5"
                          >
                            Mark Vacated & Free Bed
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
      )}

      {/* MODAL 1: ALLOCATION MODAL (Gender-Aware & Date-Driven) */}
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
                <Bed size={18} className="text-blue-400" /> Allocate Accommodation
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
                <label className="text-xs font-medium text-gray-400">1. Select Participant</label>
                <select
                  required
                  value={allocAttendeeId}
                  onChange={e => {
                    setAllocAttendeeId(e.target.value)
                    setAllocBlockId('')
                    setAllocRoomId('')
                    setManualOverride(false)
                  }}
                  className="input-field"
                >
                  <option value="">-- Choose Participant (Housing Requested) --</option>
                  {unallocatedAttendees.map(att => (
                    <option key={att.id} value={att.id}>
                      {att.fullName} ({att.gender || 'GENDER MISSING'}) - {att.college}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender auto-detection display & manual review alert */}
              {selectedAttendee && (
                <div className="p-3 bg-gray-800/80 rounded-lg text-xs space-y-1.5 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Participant Gender:</span>
                    {attendeeGender === 'MALE' ? (
                      <span className="badge-blue font-semibold">Male 👦 → Auto-Target: Garnet A (Boys)</span>
                    ) : attendeeGender === 'FEMALE' ? (
                      <span className="badge-violet font-semibold">Female 👧 → Auto-Target: Opal C (Girls)</span>
                    ) : (
                      <span className="badge-red font-semibold">⚠️ Gender Missing / Unspecified</span>
                    )}
                  </div>

                  {!attendeeGender && (
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 mt-2 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Manual Review Required
                      </p>
                      <p className="text-[11px]">
                        Gender is missing in attendee profile. Automatic hostel assignment is blocked.
                      </p>
                      <label className="flex items-center gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={manualOverride}
                          onChange={e => setManualOverride(e.target.checked)}
                          className="accent-blue-500"
                        />
                        <span className="text-white font-medium text-xs">Authorized Manual Review Override</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Mandatory Date Management */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> From Date (Mandatory)
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    className="input-field py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> To Date (Mandatory)
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    className="input-field py-2 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Compatible Hostel Block Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">2. Target Compatible Hostel</label>
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
                  {compatibleBlocks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.blockName} ({b.availableBeds} beds available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Room Select */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">3. Target Room (Available Beds)</label>
                <select
                  required
                  disabled={!allocBlockId}
                  value={allocRoomId}
                  onChange={e => setAllocRoomId(e.target.value)}
                  className="input-field disabled:opacity-50"
                >
                  <option value="">-- Choose Room with Available Bed --</option>
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
                  disabled={allocateMutation.isPending || !allocAttendeeId || !allocRoomId || (!attendeeGender && !manualOverride)}
                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {allocateMutation.isPending ? (
                    <><Loader2 size={15} className="animate-spin" /> Validating...</>
                  ) : (
                    'Confirm Allocation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ROOM DETAIL & CAPACITY INSPECTOR */}
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
                <span className="text-white font-mono font-bold">{selectedRoom.capacity} Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Occupied:</span>
                <span className="text-rose-400 font-mono font-bold">{selectedRoom.occupied} Beds</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-emerald-400 font-mono font-bold">{selectedRoom.availableBeds} Beds</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setEditingRoom(selectedRoom)
                  setNewCapacity(selectedRoom.capacity)
                  setShowCapacityModal(true)
                  setSelectedRoom(null)
                }}
                className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Edit2 size={12} /> Edit Room Capacity (Super Admin)
              </button>

              <button
                onClick={() => {
                  setSelectedRoom(null)
                  setShowAllocateModal(true)
                }}
                className="btn-primary w-full py-2 text-xs"
              >
                Allocate Participant to Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SUPER ADMIN ROOM CAPACITY UPDATE */}
      {showCapacityModal && editingRoom && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCapacityModal(false)}
        >
          <div
            className="glass-card p-5 max-w-sm w-full space-y-4 animate-fade-in border border-amber-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Edit Room Capacity</h3>
              <button onClick={() => setShowCapacityModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>
            <p className="text-xs text-gray-400">
              Update capacity for <span className="font-mono text-white font-bold">{editingRoom.roomNumber}</span>. Current occupied beds: <span className="text-rose-400 font-bold">{editingRoom.occupied}</span>.
            </p>

            <form onSubmit={handleCapacitySubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">New Bed Capacity (Min {editingRoom.occupied}, Max 20)</label>
                <input
                  type="number"
                  min={Math.max(1, editingRoom.occupied)}
                  max={20}
                  required
                  value={newCapacity}
                  onChange={e => setNewCapacity(e.target.value)}
                  className="input-field py-2 text-sm font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCapacityModal(false)}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={capacityMutation.isPending}
                  className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1"
                >
                  {capacityMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Save Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

