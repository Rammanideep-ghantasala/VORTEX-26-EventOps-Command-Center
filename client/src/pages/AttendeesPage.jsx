import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { attendeeApi } from '../api/apiClient'
import { Users, Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Badge, Spinner, EmptyState } from '../components/common/ui'
import AttendeeProfileModal from '../components/attendees/AttendeeProfileModal'

export default function AttendeesPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [type, setType] = useState('')
  const [checkedIn, setCheckedIn] = useState('')
  const [selected, setSelected] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['attendees', page, search, type, checkedIn],
    queryFn: () => attendeeApi.getAll({
      page, size: 15, search: search || undefined,
      type: type || undefined,
      checkedIn: checkedIn !== '' ? checkedIn === 'true' : undefined,
    }).then(r => r.data),
    keepPreviousData: true,
  })

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(0) }
  const attendeeList = data?.data || data?.content || []

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={22} className="text-blue-400" /> Attendees Directory
          </h2>
          <p className="text-gray-400 text-sm">
            {data?.totalElements?.toLocaleString() ?? attendeeList.length} total records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search name, email, college, reg ID..."
              className="input-field pl-8 py-2 text-sm" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>
        <div className="flex gap-2">
          <select value={type} onChange={e => { setType(e.target.value); setPage(0) }}
            className="input-field py-2 text-sm w-36">
            <option value="">All Types</option>
            <option value="PRE_REGISTERED">Pre-registered</option>
            <option value="WALK_IN">Walk-in</option>
          </select>
          <select value={checkedIn} onChange={e => { setCheckedIn(e.target.value); setPage(0) }}
            className="input-field py-2 text-sm w-36">
            <option value="">All Status</option>
            <option value="true">Checked In</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size={8} /></div>
        ) : attendeeList.length === 0 ? (
          <EmptyState icon={Users} title="No attendees found" description="Try adjusting your search filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50">
                  {['Reg. ID','Name','College','Type','Status','Accommodation','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendeeList.map(a => (
                  <tr key={a.id} className="table-row">
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">{a.registrationId}</td>
                    <td className="px-4 py-3">
                      <div className="text-gray-200 font-medium">{a.fullName}</div>
                      <div className="text-gray-500 text-xs">{a.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-36 truncate">{a.college}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.registrationType === 'PRE_REGISTERED' ? 'blue' : 'violet'}>
                        {a.registrationType === 'PRE_REGISTERED' ? 'Pre-reg' : 'Walk-in'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.checkedIn ? 'green' : 'amber'}>
                        {a.checkedIn ? '✓ Checked In' : '⏳ Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {a.housingRequired
                        ? <Badge variant="amber">Required</Badge>
                        : <span className="text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(a)}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-gray-400 text-xs">
              Page {data.page + 1} of {data.totalPages} · {data.totalElements} records
            </span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Complete 5-Tab Attendee Profile Modal */}
      {selected && (
        <AttendeeProfileModal
          attendeeId={selected.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

