import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchContests } from '../../features/contest/contestSlice'
import { PageLoader, EmptyState } from '../../components/ui'
import { Trophy, Clock, Zap, CheckCircle, Lock, Calendar } from 'lucide-react'

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',  icon: Calendar  },
  live:     { label: '🔴 Live',  color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', icon: Zap       },
  frozen:   { label: '❄️ Frozen', color: 'text-cyan-700',   bg: 'bg-cyan-50',   border: 'border-cyan-200',  icon: Lock      },
  ended:    { label: 'Ended',    color: 'text-slate-500',   bg: 'bg-slate-50',  border: 'border-slate-200', icon: CheckCircle },
  draft:    { label: 'Draft',    color: 'text-amber-600',   bg: 'bg-amber-50',  border: 'border-amber-200', icon: Clock     },
}

export default function ContestListPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { list, loading } = useSelector(s => s.contest)

  useEffect(() => { dispatch(fetchContests()) }, [dispatch])

  if (loading) return <PageLoader />

  const live     = list.filter(c => c.status === 'live')
  const upcoming = list.filter(c => c.status === 'upcoming')
  const past     = list.filter(c => c.status === 'ended' || c.status === 'frozen')

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Contests</h1>
        <p className="text-surface-400 text-sm mt-0.5">Compete, climb the ranks, win glory</p>
      </div>

      {list.length === 0 && (
        <EmptyState icon={Trophy} title="No contests yet" desc="Check back soon for upcoming contests." />
      )}

      {/* Live */}
      {live.length > 0 && (
        <Section title="🔴 Live Now">
          {live.map(c => <ContestCard key={c._id} contest={c} onClick={() => navigate(`/contests/${c._id}`)} />)}
        </Section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="Upcoming">
          {upcoming.map(c => <ContestCard key={c._id} contest={c} onClick={() => navigate(`/contests/${c._id}`)} />)}
        </Section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <Section title="Past Contests">
          {past.map(c => <ContestCard key={c._id} contest={c} onClick={() => navigate(`/contests/${c._id}`)} />)}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-3">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function ContestCard({ contest, onClick }) {
  const cfg = STATUS_CONFIG[contest.status] ?? STATUS_CONFIG.draft
  const start = new Date(contest.startTime)
  const end   = new Date(contest.endTime)
  const now   = new Date()

  const timeLabel = contest.status === 'live'
    ? `Ends ${formatCountdown(end - now)}`
    : contest.status === 'upcoming'
    ? `Starts ${start.toLocaleDateString()} ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `${start.toLocaleDateString()}`

  return (
    <button
      onClick={onClick}
      className={`card p-5 text-left hover:border-primary-300 hover:shadow-md transition-all border ${
        contest.status === 'live' ? 'border-green-200 bg-green-50/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              {cfg.label}
            </span>
            {contest.sequentialUnlock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
                <Lock size={9} /> Sequential
              </span>
            )}
          </div>
          <div className="text-slate-900 font-bold text-base truncate">{contest.title}</div>
          {contest.description && (
            <div className="text-surface-400 text-sm mt-0.5 line-clamp-1">{contest.description}</div>
          )}
        </div>
        <div className="text-right flex-shrink-0 text-sm">
          <div className="font-semibold text-slate-700">{contest.problemCount ?? contest.problems?.length ?? 0} problems</div>
          <div className="text-surface-400 mt-0.5">{contest.durationMinutes} min</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-xs text-surface-400">
        <Clock size={11} />
        {timeLabel}
      </div>
    </button>
  )
}

function formatCountdown(ms) {
  if (ms <= 0) return 'now'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `in ${h}h ${m}m`
  if (m > 0) return `in ${m}m ${s}s`
  return `in ${s}s`
}