import { useLocation } from 'react-router-dom'
import { Bell, Flame } from 'lucide-react'
import { useAuth } from '../../hooks'

const LABELS = {
  '/':                    'Home',
  '/practice':            'Practice',
  '/submissions':         'Submissions',
  '/leaderboard':         'Leaderboard',
  '/profile':             'Profile',
  '/admin':               'Dashboard',
  '/admin/problems':      'Problems',
  '/admin/students':      'Students',
  '/admin/colleges':      'Colleges',
  '/admin/submissions':   'Submissions',
  '/admin/leaderboard':   'Leaderboard',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user, isAdmin } = useAuth()
  const label = LABELS[pathname] ?? pathname.split('/').pop()

  return (
    <header className="h-16 border-b border-surface-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-surface-400 font-medium">{isAdmin ? 'Admin' : 'Student'}</span>
        <span className="text-surface-300">/</span>
        <span className="text-slate-800 font-semibold">{label}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Streak */}
        {(user?.streak ?? 0) > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <Flame size={13} className="text-amber-500" />
            <span className="text-amber-700 text-xs font-bold">{user.streak}d streak</span>
          </div>
        )}

        {/* Solved count */}
        {user?.totalSolved !== undefined && (
          <div className="hidden sm:flex items-center gap-1.5 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full">
            <span className="text-primary-700 text-xs font-bold">{user.totalSolved ?? 0} solved</span>
          </div>
        )}

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
