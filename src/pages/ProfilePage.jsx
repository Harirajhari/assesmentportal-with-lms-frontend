import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '../features/auth/authSlice'
import { fetchSubmissions } from '../features/submissions/submissionSlice'
import { useAuth } from '../hooks'
import { StatCard, PageLoader } from '../components/ui'
import { CheckCircle, Flame, Target, Trophy, Award, Calendar, Mail, Building2 } from 'lucide-react'
import { fmtDate } from '../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

const DIFF_COLORS = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }

const BADGES = [
  { id: 'first_blood',  icon: '🩸', label: 'First Blood',   desc: 'First accepted submission'  },
  { id: 'century',      icon: '💯', label: 'Century',        desc: '100 problems solved'        },
  { id: 'speed_demon',  icon: '⚡', label: 'Speed Demon',    desc: 'Solved in under 1 min'      },
  { id: 'week_streak',  icon: '🔥', label: 'Week Streak',    desc: '7-day solving streak'       },
  { id: 'month_streak', icon: '🌋', label: 'Month Streak',   desc: '30-day solving streak'      },
  { id: 'hard_core',    icon: '💎', label: 'Hard Core',      desc: '10 hard problems solved'    },
  { id: 'polyglot',     icon: '🌐', label: 'Polyglot',       desc: 'Solved in 3+ languages'     },
  { id: 'top_10',       icon: '🏆', label: 'Top 10',         desc: 'College top-10 rank'        },
]

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user, loading } = useAuth()
  const { list: submissions } = useSelector(s => s.submissions)

  useEffect(() => {
    dispatch(fetchMe())
    dispatch(fetchSubmissions({ limit: 200 }))
  }, [dispatch])

  if (loading && !user) return <PageLoader />

  // Compute from submissions
  const accepted   = submissions.filter(s => s.verdict === 'Accepted' || s.status === 'Accepted')
  const accuracy   = submissions.length ? Math.round((accepted.length / submissions.length) * 100) : 0

  // Difficulty breakdown
  const diffData = ['Easy', 'Medium', 'Hard'].map(d => ({
    name: d,
    solved: accepted.filter(s => s.problemId?.difficulty === d).length,
  }))

  // Language breakdown
  const langMap = {}
  accepted.forEach(s => { langMap[s.language] = (langMap[s.language] || 0) + 1 })
  const langData = Object.entries(langMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const userBadges = user?.badges ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Profile header card */}
      <div className="card p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 border-2 border-primary-200 flex items-center justify-center text-primary-700 text-2xl font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900">{user?.name ?? '—'}</h1>
          <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-surface-400">
            {user?.email && (
              <span className="flex items-center gap-1.5"><Mail size={13} />{user.email}</span>
            )}
            {user?.college?.name && (
              <span className="flex items-center gap-1.5"><Building2 size={13} />{user.college.name}</span>
            )}
            {user?.createdAt && (
              <span className="flex items-center gap-1.5"><Calendar size={13} />Joined {fmtDate(user.createdAt)}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {user?.collegeRank && (
              <span className="badge badge-blue">🏆 College Rank #{user.collegeRank}</span>
            )}
            {(user?.streak ?? 0) > 0 && (
              <span className="badge" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                🔥 {user.streak}d streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle} iconCls="text-green-600" bgCls="bg-green-50"
          label="Problems Solved" value={user?.totalSolved ?? accepted.length} />
        <StatCard icon={Flame} iconCls="text-amber-500" bgCls="bg-amber-50"
          label="Day Streak" value={`${user?.streak ?? 0}d`} />
        <StatCard icon={Target} iconCls="text-blue-500" bgCls="bg-blue-50"
          label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon={Trophy} iconCls="text-purple-500" bgCls="bg-purple-50"
          label="Submissions" value={submissions.length} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty bar chart */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Problems by Difficulty</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diffData} barCategoryGap="35%">
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
                  {diffData.map(d => <Cell key={d.name} fill={DIFF_COLORS[d.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language pie chart */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Language Usage</h3>
          {langData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-surface-300 text-sm">
              No accepted submissions yet
            </div>
          ) : (
            <div className="space-y-2.5 mt-2">
              {langData.map(({ name, value }) => {
                const pct = Math.round((value / accepted.length) * 100)
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-medium capitalize">{name}</span>
                      <span className="text-surface-400 font-mono">{value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Award size={15} className="text-amber-500" /> Badges
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGES.map(b => {
            const earned = userBadges.includes(b.id)
            return (
              <div
                key={b.id}
                className={`rounded-xl p-4 border text-center transition-all ${
                  earned
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-surface-200 bg-surface-50 opacity-40 grayscale'
                }`}
              >
                <div className="text-3xl mb-1.5">{b.icon}</div>
                <div className={`text-xs font-bold ${earned ? 'text-primary-700' : 'text-slate-500'}`}>{b.label}</div>
                <div className="text-xs text-surface-400 mt-0.5">{b.desc}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
