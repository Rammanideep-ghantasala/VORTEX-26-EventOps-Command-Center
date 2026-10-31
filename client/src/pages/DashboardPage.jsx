import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/apiClient'
import { StatCard, Spinner } from '../components/common/ui'
import {
  Users, CheckCircle, Clock, Home, UserPlus, TrendingUp, BarChart2, Bed
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const CHART_COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#f43f5e']

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
    refetchInterval: 15000,
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={8} /></div>
  )

  const s = stats
  const workshopData = Object.entries(s?.workshopStats || {}).map(([name, count]) => ({ name, count }))
  const blockData = (s?.blockOccupancy || []).map(b => ({
    name: b.blockName.split(' ').slice(0, 2).join(' '),
    occupied: b.occupiedBeds,
    available: b.availableBeds,
    pct: Math.round(b.occupancyPercentage),
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">Command Center</h2>
        <p className="text-gray-400 text-sm">Live event metrics — auto-refreshes every 15s</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Attendees"  value={s?.totalAttendees}    color="blue" />
        <StatCard icon={CheckCircle} label="Gate Check-ins"   value={s?.checkedIn}         color="emerald"
          sub={`${s?.checkInPercentage?.toFixed(1)}% of total`} />
        <StatCard icon={Clock}       label="Pending Entry"    value={s?.pendingEntry}      color="amber" />
        <StatCard icon={UserPlus}    label="Walk-ins Today"   value={s?.walkIns}           color="violet" />
        <StatCard icon={Home}        label="Accommodation Required" value={s?.housingRequired}   color="cyan" />
        <StatCard icon={Bed}         label="Rooms Allocated"  value={s?.housingAllocated}  color="emerald" />
        <StatCard icon={TrendingUp}  label="Pre-Registered"  value={s?.preRegistered}     color="blue" />
        <StatCard icon={BarChart2}   label="Check-in Rate"
          value={`${s?.checkInPercentage?.toFixed(1)}%`} color="rose" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Workshop registrations */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Workshop Registrations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workshopData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }} itemStyle={{ color: '#60a5fa' }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {workshopData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accommodation block occupancy */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Hostel / Accommodation Occupancy</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={blockData} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }} />
              <Bar dataKey="occupied" name="Occupied" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="available" name="Available" fill="#374151" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Block occupancy detail */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Hostel Bed Capacity & Allocation</h3>
        <div className="space-y-3">
          {(s?.blockOccupancy || []).map((block, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">{block.blockName}</span>
                <span className="text-gray-400">{block.occupiedBeds}/{block.totalCapacity} beds
                  · <span className={block.occupancyPercentage > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                    {block.occupancyPercentage.toFixed(0)}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${block.occupancyPercentage > 90 ? 'bg-rose-500' : block.occupancyPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${block.occupancyPercentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

