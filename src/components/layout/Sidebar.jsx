import { NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  ChevronLeft, ChevronRight,
  LayoutDashboard, BookOpen, Send, Trophy, User,
  Settings, Users, Building2, FileText, Activity, LogOut, Code2, Flame 
} from 'lucide-react'
import { toggleSidebar } from '../../features/ui/uiSlice'
import { useAuth } from '../../hooks'

const STUDENT_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/practice', icon: BookOpen, label: 'Practice' },
  { to: '/submissions', icon: Send, label: 'Submissions' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/contests', icon: Trophy, label: 'Contests' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/daily', icon: Flame, label: 'Daily Challenge' },
]

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/problems', icon: FileText, label: 'Problems' },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/colleges', icon: Building2, label: 'Colleges' },
  { to: '/admin/submissions', icon: Activity, label: 'Submissions' },
  { to: '/admin/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/admin/contests', icon: Trophy, label: 'Contests' },
  { to: '/admin/daily', icon: Flame, label: 'Daily Schedule' },
]

export default function Sidebar({ isAdmin = false }) {
  const dispatch = useDispatch()
  const open = useSelector(s => s.ui.sidebarOpen)
  const { user, logout } = useAuth()
  const nav = isAdmin ? ADMIN_NAV : STUDENT_NAV

  return (
    <aside
      className="fixed left-0 top-0 h-full z-30 flex flex-col bg-white border-r border-surface-200 shadow-sm transition-all duration-300"
      style={{ width: open ? 240 : 64 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
          <Code2 size={16} className="text-white" />
        </div>
        {open && (
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-sm truncate">CodeArena</div>
            {isAdmin && <div className="text-xs text-primary-600 font-semibold">Admin Panel</div>}
          </div>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-surface-100 rounded transition-colors flex-shrink-0"
        >
          {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
        {!open && <div className="section-title text-center">·</div>}
        {open && <div className="section-title">{isAdmin ? 'Management' : 'Menu'}</div>}

        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/admin'}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${!open ? 'justify-center px-0' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {open && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-surface-100 p-2 flex-shrink-0">
        {open ? (
          <div className="px-1 mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{user?.name ?? 'User'}</div>
                <div className="text-xs text-slate-400 truncate">{user?.email}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-1.5">
            <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`nav-link w-full text-red-500 hover:text-red-700 hover:bg-red-50 ${!open ? 'justify-center px-0' : ''}`}
        >
          <LogOut size={16} />
          {open && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}