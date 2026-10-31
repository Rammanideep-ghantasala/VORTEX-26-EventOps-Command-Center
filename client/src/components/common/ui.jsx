import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend }) {
  const colorMap = {
    blue: 'text-rose-300 bg-rose-950/40 border-rose-800/40',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    violet: 'text-purple-300 bg-purple-950/40 border-purple-800/40',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-pink-300 bg-rose-900/30 border-rose-700/30',
  }
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between">
        <div className={cn('p-2.5 rounded-lg border', colorMap[color])}>
          <Icon size={18} />
        </div>
        {trend !== undefined && (
          <span className={cn('text-xs font-medium', trend >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value?.toLocaleString() ?? '—'}</p>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function Badge({ children, variant = 'blue' }) {
  const variants = {
    green: 'badge-green', red: 'badge-red', blue: 'badge-blue',
    amber: 'badge-amber', violet: 'badge-violet',
  }
  return <span className={variants[variant] || 'badge-blue'}>{children}</span>
}

export function Spinner({ size = 5 }) {
  return (
    <div className={`w-${size} h-${size} border-2 border-gray-700 border-t-rose-600 rounded-full animate-spin`} />
  )
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="p-4 rounded-full bg-gray-800 text-gray-500">
        <Icon size={28} />
      </div>
      <p className="text-gray-300 font-semibold">{title}</p>
      {description && <p className="text-gray-500 text-sm max-w-xs">{description}</p>}
    </div>
  )
}

