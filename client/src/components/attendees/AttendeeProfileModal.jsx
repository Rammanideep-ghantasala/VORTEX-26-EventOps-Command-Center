import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendeeApi } from '../../api/apiClient'
import {
  User, Bed, BookOpen, Award, History, Clock, CheckCircle2,
  XCircle, AlertCircle, Building, MapPin, Mail, Phone,
  GraduationCap, Calendar, X, Shield, ArrowRight, Tag
} from 'lucide-react'
import { Badge, Spinner } from '../common/ui'

export default function AttendeeProfileModal({ attendeeId, onClose }) {
  const [activeTab, setActiveTab] = useState('personal')

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['attendee-profile', attendeeId],
    queryFn: () => attendeeApi.getProfile(attendeeId).then(r => r.data),
    enabled: !!attendeeId,
  })

  if (!attendeeId) return null

  const p = profile?.personal
  const accom = profile?.accommodation
  const currentAlloc = accom?.current
  const pastAllocs = accom?.history || []
  const workshops = profile?.workshops || []
  const events = profile?.events || []
  const regHistory = profile?.registrationHistory || []

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="glass-card border border-gray-700/80 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden bg-gray-900/95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-start justify-between bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {p?.fullName ? p.fullName.charAt(0).toUpperCase() : <User size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{p?.fullName || 'Attendee Profile'}</h2>
                {p?.gender && (
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    p.gender === 'MALE'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : p.gender === 'FEMALE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {p.gender}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span className="font-mono text-gray-300 font-semibold">{p?.registrationId}</span>
                <span>•</span>
                <span>{p?.college}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {p?.checkedIn ? (
              <Badge variant="green">✓ Checked In</Badge>
            ) : (
              <Badge variant="amber">⏳ Gate Pending</Badge>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 bg-gray-950/60 px-4 overflow-x-auto">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            {
              id: 'accommodation',
              label: 'Accommodation',
              icon: Bed,
              badge: currentAlloc ? 'Active' : null,
              badgeColor: 'bg-emerald-500/20 text-emerald-400',
            },
            {
              id: 'workshops',
              label: 'Workshops',
              icon: BookOpen,
              count: workshops.length,
            },
            {
              id: 'events',
              label: 'Events & Competitions',
              icon: Award,
              count: events.length,
            },
            {
              id: 'history',
              label: 'Registration History',
              icon: History,
            },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Spinner size={8} />
              <p className="text-gray-400 text-xs">Loading complete attendee profile records...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <span>Failed to load profile details: {error.message || 'Server error'}</span>
            </div>
          ) : (
            <>
              {/* TAB 1: PERSONAL INFORMATION */}
              {activeTab === 'personal' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard title="Identity & Registration">
                      <ProfileField label="Full Name" value={p?.fullName} />
                      <ProfileField label="Registration ID" value={p?.registrationId} mono highlight />
                      <ProfileField label="QR Code Pass" value={p?.qrCode} mono />
                      <ProfileField
                        label="Registration Type"
                        value={
                          <Badge variant={p?.registrationType === 'PRE_REGISTERED' ? 'blue' : 'violet'}>
                            {p?.registrationType === 'PRE_REGISTERED' ? 'Pre-Registered' : 'Walk-In'}
                          </Badge>
                        }
                      />
                      <ProfileField
                        label="Registered At"
                        value={p?.createdAt ? new Date(p.createdAt).toLocaleString() : '—'}
                      />
                    </InfoCard>

                    <InfoCard title="Academic & Institutional">
                      <ProfileField label="College / Institution" value={p?.college} />
                      <ProfileField label="Department" value={p?.department || '—'} />
                      <ProfileField label="Year of Study" value={p?.yearOfStudy || '—'} />
                      <ProfileField
                        label="Gender"
                        value={
                          <span className="font-semibold text-gray-200">
                            {p?.gender === 'MALE'
                              ? 'Male (Boys Hostel Eligible)'
                              : p?.gender === 'FEMALE'
                              ? 'Female (Girls Hostel Eligible)'
                              : p?.gender || 'Unspecified'}
                          </span>
                        }
                      />
                    </InfoCard>

                    <InfoCard title="Contact Information">
                      <ProfileField label="Email Address" value={p?.email} />
                      <ProfileField label="Phone Number" value={p?.phone} />
                    </InfoCard>

                    <InfoCard title="Gate & Boarding Status">
                      <ProfileField
                        label="Gate Entry Status"
                        value={
                          p?.checkedIn ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 size={14} /> Checked in at {p.checkedInGate || 'Gate'}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                              <Clock size={14} /> Pending Admission
                            </span>
                          )
                        }
                      />
                      {p?.checkedInAt && (
                        <ProfileField
                          label="Check-in Timestamp"
                          value={new Date(p.checkedInAt).toLocaleString()}
                        />
                      )}
                      <ProfileField
                        label="Accommodation Request"
                        value={
                          p?.housingRequired ? (
                            <span className="text-cyan-400 font-semibold">Campus Housing Requested</span>
                          ) : (
                            <span className="text-gray-400">Day Scholar / Not Required</span>
                          )
                        }
                      />
                    </InfoCard>
                  </div>
                </div>
              )}

              {/* TAB 2: ACCOMMODATION INFORMATION */}
              {activeTab === 'accommodation' && (
                <div className="space-y-6 animate-fade-in">
                  {currentAlloc ? (
                    <div className="glass-card p-5 border border-emerald-500/30 bg-emerald-500/5 rounded-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bed size={20} className="text-emerald-400" />
                          <h3 className="font-bold text-white text-base">Current Active Allocation</h3>
                        </div>
                        <Badge variant={currentAlloc.status === 'CHECKED_IN' ? 'green' : 'blue'}>
                          {currentAlloc.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900/60 rounded-lg border border-gray-800 text-xs">
                        <div>
                          <span className="text-gray-500 block mb-0.5">Hostel & Block</span>
                          <span className="text-white font-bold text-sm">
                            {currentAlloc.hostelName} {currentAlloc.block ? `(${currentAlloc.block})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">Room Number</span>
                          <span className="text-emerald-400 font-bold text-sm font-mono">
                            Room {currentAlloc.roomNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">From Date</span>
                          <span className="text-white font-semibold">
                            {currentAlloc.fromDate || '2026-10-30'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">To Date</span>
                          <span className="text-white font-semibold">
                            {currentAlloc.toDate || '2026-11-01'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
                        <div>
                          <span className="text-gray-500">Allocated By: </span>
                          <span className="text-gray-200">{currentAlloc.allocatedBy || 'Staff Admin'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Allocation Date: </span>
                          <span className="text-gray-200">
                            {currentAlloc.allocatedAt ? new Date(currentAlloc.allocatedAt).toLocaleDateString() : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Hostel Check-in: </span>
                          <span className="text-gray-200">
                            {currentAlloc.checkInDate ? new Date(currentAlloc.checkInDate).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center rounded-xl border border-gray-800 bg-gray-900/40 space-y-2">
                      <Bed size={32} className="mx-auto text-gray-600 mb-2" />
                      <h4 className="text-base font-bold text-gray-300">No Accommodation Allocated</h4>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto">
                        {p?.housingRequired
                          ? 'This attendee requested on-campus housing, but no room is currently assigned. You can assign a room from the Accommodation module.'
                          : 'Attendee has not registered for on-campus housing.'}
                      </p>
                    </div>
                  )}

                  {/* Previous accommodation history */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <History size={14} /> Historical Accommodation Records ({pastAllocs.length})
                    </h3>
                    {pastAllocs.length === 0 ? (
                      <p className="text-xs text-gray-500 italic p-4 bg-gray-900/30 rounded-lg border border-gray-800/60">
                        No previous accommodation history records for this attendee.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-800">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-gray-900/70 border-b border-gray-800 text-gray-400">
                              <th className="text-left px-3 py-2 font-medium">Hostel / Block</th>
                              <th className="text-left px-3 py-2 font-medium">Room</th>
                              <th className="text-left px-3 py-2 font-medium">Date Range</th>
                              <th className="text-left px-3 py-2 font-medium">Actual Checkout</th>
                              <th className="text-left px-3 py-2 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/50">
                            {pastAllocs.map((hist) => (
                              <tr key={hist.id} className="hover:bg-gray-800/20">
                                <td className="px-3 py-2 text-white font-medium">{hist.hostelName} {hist.block ? `(${hist.block})` : ''}</td>
                                <td className="px-3 py-2 font-mono text-gray-300">{hist.roomNumber}</td>
                                <td className="px-3 py-2 text-gray-400">{hist.fromDate || '—'} → {hist.toDate || '—'}</td>
                                <td className="px-3 py-2 text-gray-400">
                                  {hist.actualCheckOutDate ? new Date(hist.actualCheckOutDate).toLocaleString() : '—'}
                                </td>
                                <td className="px-3 py-2">
                                  <Badge variant={hist.status === 'VACATED' ? 'gray' : 'amber'}>
                                    {hist.status}
                                  </Badge>
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

              {/* TAB 3: WORKSHOP REGISTRATION INFORMATION */}
              {activeTab === 'workshops' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <BookOpen size={16} className="text-blue-400" /> Registered Workshops
                      </h3>
                      <p className="text-xs text-gray-400">
                        Total {workshops.length} workshop{workshops.length !== 1 ? 's' : ''} enrolled from database records
                      </p>
                    </div>
                    <Badge variant="blue">{workshops.length} Active</Badge>
                  </div>

                  {workshops.length === 0 ? (
                    <div className="glass-card p-8 text-center rounded-xl border border-gray-800">
                      <BookOpen size={28} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">No Workshops Registered</p>
                      <p className="text-xs text-gray-500">This attendee has not enrolled in any technical workshops.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-900/70 border-b border-gray-800 text-gray-400">
                            <th className="text-left px-4 py-2.5 font-medium">Workshop Name</th>
                            <th className="text-left px-4 py-2.5 font-medium">Code / ID</th>
                            <th className="text-left px-4 py-2.5 font-medium">Enrollment Date</th>
                            <th className="text-left px-4 py-2.5 font-medium">Status</th>
                            <th className="text-left px-4 py-2.5 font-medium">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {workshops.map((ws) => (
                            <tr key={ws.id} className="hover:bg-gray-800/20">
                              <td className="px-4 py-3 font-semibold text-white">{ws.workshopName}</td>
                              <td className="px-4 py-3 font-mono text-gray-300">{ws.workshopCode || `WS-${ws.id}`}</td>
                              <td className="px-4 py-3 text-gray-400">
                                {ws.registeredAt ? new Date(ws.registeredAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={ws.status === 'CONFIRMED' ? 'green' : 'amber'}>
                                  {ws.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={ws.attendanceStatus === 'PRESENT' ? 'green' : 'gray'}>
                                  {ws.attendanceStatus || 'REGISTERED'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: EVENT REGISTRATION INFORMATION */}
              {activeTab === 'events' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award size={16} className="text-violet-400" /> Registered Events & Competitions
                      </h3>
                      <p className="text-xs text-gray-400">
                        Total {events.length} symposium competition{events.length !== 1 ? 's' : ''} enrolled
                      </p>
                    </div>
                    <Badge variant="violet">{events.length} Enrolled</Badge>
                  </div>

                  {events.length === 0 ? (
                    <div className="glass-card p-8 text-center rounded-xl border border-gray-800">
                      <Award size={28} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-300">No Events Registered</p>
                      <p className="text-xs text-gray-500">Attendee has not joined any competitive events.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-800">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-900/70 border-b border-gray-800 text-gray-400">
                            <th className="text-left px-4 py-2.5 font-medium">Competition / Event</th>
                            <th className="text-left px-4 py-2.5 font-medium">Registration Date</th>
                            <th className="text-left px-4 py-2.5 font-medium">Status</th>
                            <th className="text-left px-4 py-2.5 font-medium">Participation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {events.map((evt) => (
                            <tr key={evt.id} className="hover:bg-gray-800/20">
                              <td className="px-4 py-3 font-semibold text-white">{evt.eventName}</td>
                              <td className="px-4 py-3 text-gray-400">
                                {evt.registeredAt ? new Date(evt.registeredAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant="violet">{evt.status}</Badge>
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={evt.attendanceStatus === 'PRESENT' ? 'green' : 'gray'}>
                                  {evt.attendanceStatus || 'REGISTERED'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REGISTRATION HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <History size={16} className="text-amber-400" /> Complete Registration & Access Logs
                      </h3>
                      <p className="text-xs text-gray-400">Audit trail of admissions, check-ins, and ticket scans</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Creation Record */}
                    <div className="glass-card p-4 rounded-xl border border-gray-800 bg-gray-900/40 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                        <Tag size={16} />
                      </div>
                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">Attendee Registration Created</span>
                          <span className="text-gray-500">
                            {p?.createdAt ? new Date(p.createdAt).toLocaleString() : 'Initial Setup'}
                          </span>
                        </div>
                        <p className="text-gray-400">
                          Registered via <span className="text-blue-300 font-semibold">{p?.registrationType}</span> admission flow. Pass QR ID: <span className="font-mono text-gray-300">{p?.qrCode}</span>
                        </p>
                      </div>
                    </div>

                    {/* Gate Logs */}
                    {regHistory.length === 0 ? (
                      <div className="glass-card p-4 rounded-xl border border-gray-800/60 bg-gray-900/20 text-xs text-gray-500 italic">
                        No physical gate scans logged yet. Attendee will appear here upon QR scan.
                      </div>
                    ) : (
                      regHistory.map((log) => (
                        <div key={log.id} className="glass-card p-4 rounded-xl border border-gray-800 bg-gray-900/40 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="flex-1 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">Gate Admission Scan ({log.gateLocation})</span>
                              <span className="text-gray-500">{new Date(log.loggedAt).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-400">
                              Verified by operator: <span className="text-gray-200 font-medium">{log.operatorName}</span>. {log.note}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoCard({ title, children }) {
  return (
    <div className="glass-card p-4 rounded-xl border border-gray-800/80 bg-gray-900/50 space-y-3">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-1.5">
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ProfileField({ label, value, mono, highlight }) {
  return (
    <div className="flex items-start justify-between text-xs gap-3">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className={`text-right ${
        highlight
          ? 'text-blue-400 font-bold'
          : mono
          ? 'font-mono text-gray-300'
          : 'text-gray-200'
      }`}>
        {value || '—'}
      </span>
    </div>
  )
}

