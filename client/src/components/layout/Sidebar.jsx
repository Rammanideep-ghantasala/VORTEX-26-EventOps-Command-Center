import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, DoorOpen, UserPlus, Home, Users, BookOpen, LogOut, Zap, ShieldCheck
} from 'lucide-react'
import { cn } from '../common/ui'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     roles: null },
  { to: '/gate',          icon: DoorOpen,        label: 'Gate Admissions', roles: ['SUPER_ADMIN','GATE_STAFF'] },
  { to: '/walk-in',       icon: UserPlus,        label: 'Walk-in Reg.',    roles: ['SUPER_ADMIN','REGISTRATION_STAFF'] },
  { to: '/accommodation', icon: Home,            label: 'Accommodation',   roles: ['SUPER_ADMIN','HOUSING_STAFF'] },
  { to: '/workshops',     icon: BookOpen,        label: 'Workshops',       roles: ['SUPER_ADMIN','REGISTRATION_STAFF'] },
  { to: '/attendees',     icon: Users,           label: 'Attendees',       roles: null },
]

const roleColors = {
  SUPER_ADMIN: 'text-amber-400',
  GATE_STAFF: 'text-blue-400',
  HOUSING_STAFF: 'text-emerald-400',
  REGISTRATION_STAFF: 'text-violet-400',
}

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleNav = navItems.filter(item =>
    !item.roles || hasRole(...item.roles)
  )

  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-gray-900/80 border-r border-gray-800 flex flex-col backdrop-blur-md overflow-hidden select-none">
      {/* Logo */}
      <div className="flex-shrink-0 px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-800 via-rose-900 to-red-950 border border-rose-700/50 flex items-center justify-center shadow-md shadow-rose-950/60">
            <Zap size={16} className="text-rose-200" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-none">VORTEX'26</h1>
            <p className="text-rose-400/80 text-xs font-medium">Event Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-hidden">
        {visibleNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-rose-950/70 text-rose-300 border border-rose-700/50 shadow-sm shadow-rose-950/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      {user && (
        <div className="mt-auto flex-shrink-0 px-4 py-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-800 to-red-950 border border-rose-700/50 flex items-center justify-center text-rose-100 text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-sm font-medium truncate">{user.name}</p>
              <div className={cn('flex items-center gap-1 text-xs font-medium', roleColors[user.role] || 'text-gray-400')}>
                <ShieldCheck size={10} />
                {user.role.replace('_', ' ')}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-150"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </aside>
  )
}

