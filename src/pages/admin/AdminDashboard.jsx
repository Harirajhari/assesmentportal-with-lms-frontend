import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { StatCard, PageLoader } from '../../components/ui'
import { Users, Building2, FileText, Activity, TrendingUp, ArrowRight } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const QUICK = [
  { to: '/admin/problems',    icon: FileText,   label: 'Problems',    desc: 'Create & manage problems'   },
  { to: '/admin/students',    icon: Users,      label: 'Students',    desc: 'View & manage students'      },
  { to: '/admin/colleges',    icon: Building2,  label: 'Colleges',    desc: 'Configure institutions'      },
  { to: '/admin/submissions', icon: Activity,   label: 'Submissions', desc: 'Monitor all activity'        },
  { to: '/admin/leaderboard', icon: TrendingUp, label: 'Leaderboard', desc: 'Rankings by college'         },
]

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data?.data ?? r.data))
      .catch(() => setStats(null))        // graceful fallback — no crash
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const submissionsChart = stats?.submissionsOverTime ?? []
  const collegesChart    = stats?.topColleges         ?? []

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in space-y-6">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-surface-400 text-sm mt-0.5">Platform overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users}     iconCls="text-blue-500"   bgCls="bg-blue-50"   label="Students"    value={stats?.totalStudents    ?? '—'} />
        <StatCard icon={Building2} iconCls="text-purple-500" bgCls="bg-purple-50" label="Colleges"    value={stats?.totalColleges    ?? '—'} />
        <StatCard icon={FileText}  iconCls="text-amber-500"  bgCls="bg-amber-50"  label="Problems"    value={stats?.totalProblems    ?? '—'} />
        <StatCard icon={Activity}  iconCls="text-green-500"  bgCls="bg-green-50"  label="Submissions" value={stats?.totalSubmissions?.toLocaleString() ?? '—'} />
      </div>

      {/* Charts */}
      {(submissionsChart.length > 0 || collegesChart.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {submissionsChart.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Submissions (last 7 days)</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={submissionsChart}>
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {collegesChart.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Top Colleges by Solved</h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={collegesChart} layout="vertical" barCategoryGap="25%">
                    <XAxis type="number" tick={{ fill: '#cbd5e1', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="solved" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK.map(q => (
            <Link key={q.to} to={q.to}>
              <div className="card p-5 hover:border-primary-200 hover:shadow-card-md transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                    <q.icon size={18} className="text-primary-600" />
                  </div>
                  <ArrowRight size={14} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="text-slate-800 font-semibold text-sm group-hover:text-primary-700 transition-colors">{q.label}</div>
                <div className="text-surface-400 text-xs mt-0.5">{q.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
