import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProblems } from '../features/problems/problemSlice'
import { fetchLeaderboard } from '../features/leaderboard/leaderboardSlice'
import { useAuth } from '../hooks'
import { StatCard, PageLoader, DiffBadge } from '../components/ui'
import { CheckCircle, Flame, Target, Trophy, ArrowRight, BookOpen, Send } from 'lucide-react'
import { rankLabel, timeAgo } from '../utils/helpers'

export default function HomePage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { list: problems, loading } = useSelector(s => s.problems)
  const { entries: leaders }        = useSelector(s => s.leaderboard)

  useEffect(() => {
    dispatch(fetchProblems({ limit: 6, page: 1 }))
    dispatch(fetchLeaderboard())
  }, [dispatch])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative">
          <p className="text-primary-100 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary-200">{user?.name?.split(' ')[0] ?? 'Coder'}</span>
          </h1>
          <p className="text-primary-100 mb-6 text-sm max-w-md">
            Keep your streak alive. Every problem you solve makes you stronger.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link to="/practice" className="btn bg-white text-primary-700 hover:bg-primary-50 shadow-card">
              <BookOpen size={15} /> Browse Problems
            </Link>
            <Link to="/submissions" className="btn bg-primary-700/50 text-white border border-primary-400 hover:bg-primary-700">
              <Send size={15} /> My Submissions
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} iconCls="text-green-600" bgCls="bg-green-50"
          label="Problems Solved" value={user?.totalSolved ?? 0} />
        <StatCard icon={Flame} iconCls="text-amber-500" bgCls="bg-amber-50"
          label="Day Streak"  value={`${user?.streak ?? 0}d`} />
        <StatCard icon={Target} iconCls="text-blue-500" bgCls="bg-blue-50"
          label="College Rank" value={user?.collegeRank ? `#${user.collegeRank}` : '—'} />
        <StatCard icon={Trophy} iconCls="text-purple-500" bgCls="bg-purple-50"
          label="Total Score" value={user?.score ?? '—'} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent problems */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Recent Problems</h2>
            <Link to="/practice" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? <PageLoader /> : (
            <div className="card overflow-hidden">
              {problems.length === 0 ? (
                <div className="p-8 text-center text-surface-400 text-sm">No problems yet. Check back soon.</div>
              ) : (
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Difficulty</th>
                      <th className="hidden sm:table-cell">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.slice(0, 6).map(p => (
                      <tr key={p._id}>
                        <td>
                          <Link to={`/problem/${p._id}`} className="text-slate-800 hover:text-primary-600 font-medium transition-colors">
                            {p.title}
                          </Link>
                        </td>
                        <td><DiffBadge difficulty={p.difficulty} /></td>
                        <td className="hidden sm:table-cell">
                          <div className="flex gap-1 flex-wrap">
                            {p.tags?.slice(0,2).map(t => <span key={t} className="tag capitalize">{t}</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Leaderboard mini */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Leaderboard</h2>
            <Link to="/leaderboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              Full <ArrowRight size={13} />
            </Link>
          </div>
          <div className="card overflow-hidden">
            {leaders.length === 0 ? (
              <div className="p-8 text-center text-surface-400 text-sm">No data yet.</div>
            ) : (
              <div className="divide-y divide-surface-100">
                {leaders.slice(0, 5).map((e, i) => (
                  <div key={e.userId ?? i} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-6 text-sm font-bold text-surface-400 text-center font-mono">{rankLabel(i + 1)}</span>
                    <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                      {e.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{e.name}</div>
                      <div className="text-xs text-surface-400">{e.totalSolved ?? 0} solved</div>
                    </div>
                    <div className="text-xs font-bold text-primary-600 font-mono">{e.score ?? 0}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
