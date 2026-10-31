import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workshopsApi, attendeeApi } from '../api/apiClient'
import {
  BookOpen, Users, PlusCircle, Edit3, Download, Search, AlertCircle,
  CheckCircle2, XCircle, Loader2, Sparkles, UserPlus, Filter
} from 'lucide-react'
import { Badge, Spinner, EmptyState } from '../components/common/ui'
import toast from 'react-hot-toast'

export default function WorkshopsPage() {
  const queryClient = useQueryClient()
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditCapModal, setShowEditCapModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [participantSearch, setParticipantSearch] = useState('')
  const [participantStatus, setParticipantStatus] = useState('CONFIRMED')

  // Form states
  const [newCapVal, setNewCapVal] = useState(100)
  const [regAttendeeId, setRegAttendeeId] = useState('')
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    capacity: 100,
    instructor: '',
    venue: '',
  })

  // Queries
  const { data: workshops, isLoading: wsLoading } = useQuery({
    queryKey: ['workshops-list'],
    queryFn: () => workshopsApi.getAll().then(r => r.data),
  })

  // Selected workshop
  const activeWorkshop = (workshops || []).find(w => w.id === selectedWorkshopId) || workshops?.[0]

  const { data: participantsData, isLoading: partLoading } = useQuery({
    queryKey: ['workshop-participants', activeWorkshop?.id, participantSearch, participantStatus],
    queryFn: () => workshopsApi.getParticipants(activeWorkshop?.id, {
      search: participantSearch || undefined,
      status: participantStatus || undefined,
    }).then(r => r.data),
    enabled: !!activeWorkshop?.id,
  })

  const { data: allAttendees } = useQuery({
    queryKey: ['all-attendees-for-ws'],
    queryFn: () => attendeeApi.getAll({ size: 100 }).then(r => r.data),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => workshopsApi.create(data),
    onSuccess: (data) => {
      toast.success(`Workshop '${data.data.name}' created successfully!`)
      queryClient.invalidateQueries({ queryKey: ['workshops-list'] })
      setShowCreateModal(false)
      setCreateForm({ name: '', code: '', description: '', capacity: 100, instructor: '', venue: '' })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create workshop'),
  })

  const editCapMutation = useMutation({
    mutationFn: ({ id, capacity }) => workshopsApi.updateCapacity(id, capacity),
    onSuccess: () => {
      toast.success('Workshop seat capacity updated!')
      queryClient.invalidateQueries({ queryKey: ['workshops-list'] })
      setShowEditCapModal(false)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update capacity'),
  })

  const registerMutation = useMutation({
    mutationFn: ({ workshopId, attendeeId }) => workshopsApi.registerParticipant(workshopId, attendeeId),
    onSuccess: (res) => {
      toast.success(`Registered ${res.data.fullName} for workshop!`)
      queryClient.invalidateQueries({ queryKey: ['workshops-list'] })
      queryClient.invalidateQueries({ queryKey: ['workshop-participants'] })
      setShowRegisterModal(false)
      setRegAttendeeId('')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Registration failed'),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ workshopId, attendeeId }) => workshopsApi.cancelRegistration(workshopId, attendeeId),
    onSuccess: () => {
      toast.success('Registration cancelled. Seat is now available!')
      queryClient.invalidateQueries({ queryKey: ['workshops-list'] })
      queryClient.invalidateQueries({ queryKey: ['workshop-participants'] })
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancellation failed'),
  })

  const handleExportCsv = async () => {
    if (!activeWorkshop) return
    try {
      const res = await workshopsApi.exportCsv(activeWorkshop.id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${activeWorkshop.code}-participants.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Participant list exported to CSV')
    } catch {
      toast.error('Failed to export CSV')
    }
  }

  const getStatusBadge = (status, pct) => {
    if (status === 'FULLY_BOOKED' || pct >= 100) {
      return <span className="badge-red text-xs">Fully Booked (100%)</span>
    }
    if (status === 'ALMOST_FULL' || pct >= 80) {
      return <span className="badge-amber text-xs">Almost Full ({pct.toFixed(0)}%)</span>
    }
    return <span className="badge-green text-xs">Available ({pct.toFixed(0)}%)</span>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={22} className="text-violet-400" /> Workshop Seat Capacity Management
          </h2>
          <p className="text-gray-400 text-sm">
            Independent seat quotas, live occupancy tracking, overbooking prevention, and attendee lists
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 py-2.5 px-4 text-sm font-semibold shadow-lg shadow-violet-500/20"
        >
          <PlusCircle size={16} /> Create Workshop
        </button>
      </div>

      {/* Workshop Cards Grid */}
      {wsLoading ? (
        <div className="flex justify-center py-12"><Spinner size={8} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workshops?.map(ws => {
            const isSelected = activeWorkshop?.id === ws.id
            const pct = ws.occupancyPercentage || 0

            return (
              <div
                key={ws.id}
                onClick={() => setSelectedWorkshopId(ws.id)}
                className={`glass-card p-5 cursor-pointer transition-all border text-left space-y-3 ${
                  isSelected
                    ? 'border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-500/10'
                    : 'hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs text-violet-400 font-semibold">{ws.code}</span>
                    <h3 className="font-bold text-white text-base leading-snug">{ws.name}</h3>
                  </div>
                  {getStatusBadge(ws.status, pct)}
                </div>

                <p className="text-gray-400 text-xs line-clamp-2">{ws.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300 font-semibold">
                      {ws.registeredParticipants} / {ws.capacity} Registered
                    </span>
                    <span className="text-emerald-400 font-bold">{ws.availableSeats} seats left</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-rose-500' :
                        pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-xs">
                  <span className="text-gray-500">{ws.venue || 'Auditorium'}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedWorkshopId(ws.id)
                      setNewCapVal(ws.capacity)
                      setShowEditCapModal(true)
                    }}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Edit3 size={12} /> Edit Capacity
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected Workshop Deep-Dive & Participant Ledger */}
      {activeWorkshop && (
        <div className="glass-card p-6 space-y-5 border border-violet-500/30">
          {/* Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge-violet text-xs font-mono">{activeWorkshop.code}</span>
                <h3 className="text-lg font-bold text-white">{activeWorkshop.name}</h3>
              </div>
              <p className="text-gray-400 text-xs mt-1">
                Instructor: <span className="text-gray-200">{activeWorkshop.instructor}</span> · Venue: <span className="text-gray-200">{activeWorkshop.venue}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewCapVal(activeWorkshop.capacity)
                  setShowEditCapModal(true)
                }}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Edit3 size={13} /> Edit Capacity
              </button>

              <button
                onClick={() => setShowRegisterModal(true)}
                disabled={activeWorkshop.availableSeats <= 0}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus size={13} /> Register Participant
              </button>

              <button
                onClick={handleExportCsv}
                className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>

          {/* KPI Gauges for Selected Workshop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="stat-card">
              <p className="text-gray-400 text-xs uppercase font-medium">Maximum Capacity</p>
              <p className="text-2xl font-bold text-white mt-1">{activeWorkshop.capacity} Seats</p>
            </div>
            <div className="stat-card">
              <p className="text-gray-400 text-xs uppercase font-medium">Registered Participants</p>
              <p className="text-2xl font-bold text-violet-400 mt-1">{activeWorkshop.registeredParticipants}</p>
            </div>
            <div className="stat-card">
              <p className="text-gray-400 text-xs uppercase font-medium">Available Seats</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeWorkshop.availableSeats}</p>
            </div>
            <div className="stat-card">
              <p className="text-gray-400 text-xs uppercase font-medium">Occupancy Rate</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {(activeWorkshop.occupancyPercentage || 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Participant Filter Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search participant by name, registration ID, or email..."
                value={participantSearch}
                onChange={e => setParticipantSearch(e.target.value)}
                className="input-field pl-9 py-2 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={participantStatus}
                onChange={e => setParticipantStatus(e.target.value)}
                className="input-field py-2 text-xs w-36"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="ATTENDED">Attended</option>
              </select>
            </div>
          </div>

          {/* Participant List Table */}
          <div className="glass-card overflow-hidden">
            {partLoading ? (
              <div className="flex justify-center py-10"><Spinner size={6} /></div>
            ) : (participantsData?.data || []).length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-8">No participants found matching this filter</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 uppercase bg-gray-900/60">
                      <th className="text-left px-3 py-2.5">S.No</th>
                      <th className="text-left px-3 py-2.5">Reg ID</th>
                      <th className="text-left px-3 py-2.5">Participant Name</th>
                      <th className="text-left px-3 py-2.5">Email</th>
                      <th className="text-left px-3 py-2.5">Phone</th>
                      <th className="text-left px-3 py-2.5">College</th>
                      <th className="text-left px-3 py-2.5">Reg Date</th>
                      <th className="text-left px-3 py-2.5">Status</th>
                      <th className="text-right px-3 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsData?.data?.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                        <td className="px-3 py-2.5 text-gray-500 font-mono">{p.serialNumber}</td>
                        <td className="px-3 py-2.5 text-violet-400 font-mono font-semibold">{p.registrationId}</td>
                        <td className="px-3 py-2.5 font-medium text-white">{p.fullName}</td>
                        <td className="px-3 py-2.5 text-gray-400">{p.email}</td>
                        <td className="px-3 py-2.5 text-gray-400 font-mono">{p.phone}</td>
                        <td className="px-3 py-2.5 text-gray-400 max-w-[150px] truncate">{p.college}</td>
                        <td className="px-3 py-2.5 text-gray-500 font-mono">
                          {p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.status === 'CONFIRMED' ? (
                            <span className="badge-green text-[10px]">Confirmed</span>
                          ) : p.status === 'CANCELLED' ? (
                            <span className="badge-red text-[10px]">Cancelled</span>
                          ) : (
                            <span className="badge-blue text-[10px]">{p.status}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {p.status === 'CONFIRMED' && (
                            <button
                              onClick={() => cancelMutation.mutate({
                                workshopId: activeWorkshop.id,
                                attendeeId: p.attendeeId || 1,
                              })}
                              disabled={cancelMutation.isPending}
                              className="text-rose-400 hover:text-rose-300 text-[11px] underline"
                            >
                              Cancel Reg
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
        </div>
      )}

      {/* MODAL 1: CREATE WORKSHOP MODAL */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="glass-card p-6 max-w-md w-full space-y-4 animate-fade-in border border-violet-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-white text-base">Create New Workshop</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate(createForm)
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Workshop Name *</label>
                <input
                  required
                  placeholder="e.g. Next.js & GraphQL Masterclass"
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Code *</label>
                  <input
                    required
                    placeholder="e.g. WS-NEXT"
                    value={createForm.code}
                    onChange={e => setCreateForm(f => ({ ...f, code: e.target.value }))}
                    className="input-field py-2 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Capacity (1 - 100) *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={createForm.capacity}
                    onChange={e => setCreateForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                    className="input-field py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Description</label>
                <textarea
                  rows={2}
                  placeholder="Workshop curriculum and outcomes..."
                  value={createForm.description}
                  onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Instructor</label>
                  <input
                    placeholder="Expert Name"
                    value={createForm.instructor}
                    onChange={e => setCreateForm(f => ({ ...f, instructor: e.target.value }))}
                    className="input-field py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Venue</label>
                  <input
                    placeholder="Hall / Lab"
                    value={createForm.venue}
                    onChange={e => setCreateForm(f => ({ ...f, venue: e.target.value }))}
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  {createMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Create Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CAPACITY MODAL (Super Admin) */}
      {showEditCapModal && activeWorkshop && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditCapModal(false)}
        >
          <div
            className="glass-card p-6 max-w-sm w-full space-y-4 animate-fade-in border border-amber-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-base">Configure Seat Capacity</h3>
              <button onClick={() => setShowEditCapModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>

            <p className="text-xs text-gray-400">
              Workshop: <span className="text-white font-bold">{activeWorkshop.name}</span>
            </p>
            <p className="text-xs text-amber-300">
              Current confirmed registrations: <span className="font-bold font-mono">{activeWorkshop.registeredParticipants}</span>. Capacity cannot be reduced below this number.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                editCapMutation.mutate({ id: activeWorkshop.id, capacity: Number(newCapVal) })
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">
                  New Seat Capacity (Min {Math.max(1, activeWorkshop.registeredParticipants)}, Max 100)
                </label>
                <input
                  type="number"
                  min={Math.max(1, activeWorkshop.registeredParticipants)}
                  max={100}
                  required
                  value={newCapVal}
                  onChange={e => setNewCapVal(e.target.value)}
                  className="input-field py-2 text-sm font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCapModal(false)}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editCapMutation.isPending}
                  className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  {editCapMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Save Capacity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER ATTENDEE MODAL (Overbooking Protected) */}
      {showRegisterModal && activeWorkshop && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            className="glass-card p-6 max-w-md w-full space-y-4 animate-fade-in border border-blue-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="font-bold text-white text-base">Register Participant for Workshop</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-white">×</button>
            </div>

            <div className="p-3 bg-gray-800/60 rounded-lg text-xs space-y-1">
              <p className="text-gray-300 font-semibold">{activeWorkshop.name}</p>
              <p className="text-emerald-400 font-bold">
                Available Seats: {activeWorkshop.availableSeats} of {activeWorkshop.capacity}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                registerMutation.mutate({ workshopId: activeWorkshop.id, attendeeId: Number(regAttendeeId) })
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-400">Select Attendee</label>
                <select
                  required
                  value={regAttendeeId}
                  onChange={e => setRegAttendeeId(e.target.value)}
                  className="input-field py-2 text-xs"
                >
                  <option value="">-- Choose Participant --</option>
                  {(allAttendees?.data || []).map(att => (
                    <option key={att.id} value={att.id}>
                      {att.fullName} ({att.registrationId} - {att.college})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending || !regAttendeeId}
                  className="btn-primary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  {registerMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

