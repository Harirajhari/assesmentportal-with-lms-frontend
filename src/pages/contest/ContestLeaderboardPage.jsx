import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContestLeaderboard, fetchContest } from '../../features/contest/contestSlice'
import { useContestSocket } from '../../features/contest/useContestSocket'
import { PageLoader, EmptyState } from '../../components/ui'
import { Trophy, Building2, Clock, ArrowLeft, Wifi, CheckCircle, XCircle } from 'lucide-react'


export default function ContestLeaderboardPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { current: contest, leaderboard, loading } = useSelector(s => s.contest)

  useContestSocket(id)

  useEffect(() => {
    dispatch(fetchContest(id))
    dispatch(fetchContestLeaderboard(id))
  }, [dispatch, id])

  if (loading || !leaderboard) return <PageLoader />

  const info     = leaderboard.contest ?? {}
  const entries  = leaderboard.leaderboard ?? []
  const problems = [...(contest?.problems ?? [])].sort((a, b) => a.order - b.order)
  const isLive   = info.status === 'live'
  const isFrozen = info.status === 'frozen'
  const isEnded  = info.status === 'ended'

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }} className="min-h-screen bg-slate-50 text-slate-900">

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden bg-white border-b border-slate-200/80">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-100/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate(`/contests/${id}`)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-5 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Arena
          </button>

          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <Trophy size={17} className="text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{info.title ?? 'Leaderboard'}</h1>
              </div>
              <p className="text-sm text-slate-400 ml-12">
                {isFrozen
                  ? 'Standings frozen — last few minutes are hidden'
                  : isEnded
                  ? 'Final standings'
                  : 'Live updates as participants submit'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isFrozen && (
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-50 text-cyan-600 border border-cyan-200">
                  ❄️ Frozen
                </span>
              )}
              {isLive && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Wifi size={11} /> Live
                </span>
              )}
              {isEnded && (
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                  Final
                </span>
              )}
            </div>
          </div>

          {entries.length > 0 && (
            <div className="flex gap-6 mt-6 ml-12">
              <Stat label="Participants" value={entries.length} />
              <Stat label="Problems" value={problems.length} />
              <Stat
                label="Total Solved"
                value={entries.reduce((a, e) => a + (e.solvedCount ?? 0), 0)}
              />
            </div>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="max-w-5xl mx-auto px-6 py-16">
          <EmptyState icon={Trophy} title="No participants yet" desc="Be the first to join and submit!" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Podium top 3 ── */}
          {entries.length >= 2 && (
            <div className="flex items-end justify-center gap-3 mb-10">
              {entries[1] && <PodiumCard entry={entries[1]} pos={2} />}
              {entries[0] && <PodiumCard entry={entries[0]} pos={1} />}
              {entries[2] && <PodiumCard entry={entries[2]} pos={3} />}
            </div>
          )}

          {/* ── Full table ── */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
            <div
              className="grid gap-0 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-400"
              style={{ gridTemplateColumns: `52px 1fr 140px ${problems.map(() => '52px').join(' ')} 80px 80px` }}
            >
              <span>Rank</span>
              <span>Participant</span>
              <span className="hidden sm:block">College</span>
              {problems.map(p => (
                <span key={p.order} className="text-center hidden md:block">P{p.order}</span>
              ))}
              <span className="text-right">Score</span>
              <span className="text-right hidden sm:block">Penalty</span>
            </div>

            {entries.map((e, i) => (
              <LeaderboardRow
                key={e.userId ?? i}
                entry={e}
                problems={problems}
                isLast={i === entries.length - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function LeaderboardRow({ entry: e, problems, isLast }) {
  const medals = ['🥇', '🥈', '🥉']
  const isTop3 = e.rank <= 3

  return (
    <div
      className={`grid items-center px-5 py-3.5 transition-colors hover:bg-slate-50/80
        ${!isLast ? 'border-b border-slate-100' : ''}
        ${isTop3 ? 'bg-amber-50/40' : ''}
      `}
      style={{ gridTemplateColumns: `52px 1fr 140px ${problems.map(() => '52px').join(' ')} 80px 80px` }}
    >
      <div className="flex items-center">
        {isTop3
          ? <span className="text-xl">{medals[e.rank - 1]}</span>
          : <span className="text-sm font-mono font-semibold text-slate-400">#{e.rank}</span>
        }
      </div>

      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
          ${isTop3 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-500'}`}>
          {e.name?.[0]?.toUpperCase()}
        </div>
        <span className="font-semibold text-sm text-slate-700 truncate">{e.name}</span>
      </div>

      <div className="hidden sm:block min-w-0">
        {e.college
          ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 truncate max-w-[130px]">
              <Building2 size={10} className="flex-shrink-0" />
              {e.college.code ?? e.college.name}
            </span>
          : <span className="text-slate-300 text-xs">—</span>
        }
      </div>

      {problems.map(p => {
        const ps = e.problemStats?.[String(p.order)]
        return (
          <div key={p.order} className="text-center hidden md:flex flex-col items-center justify-center gap-0.5">
            {ps?.solved
              ? <>
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="text-[10px] text-slate-400 font-mono">{formatTime(ps.solveTimeSeconds)}</span>
                </>
              : ps?.attempts > 0
              ? <span className="text-red-400 text-xs font-mono">✗{ps.attempts}</span>
              : <span className="text-slate-300 text-xs">—</span>
            }
          </div>
        )
      })}

      <div className="text-right">
        <span className="font-bold text-sm text-indigo-600 font-mono">{e.totalPoints}</span>
      </div>

      <div className="text-right hidden sm:flex items-center justify-end gap-1 text-slate-400 text-xs">
        <Clock size={10} />{e.penaltyMinutes}m
      </div>
    </div>
  )
}


function PodiumCard({ entry, pos }) {
  const config = {
    1: { height: 'h-28', ring: 'ring-amber-300', bg: 'bg-amber-50', name: 'text-amber-600', medal: '🥇', glow: 'bg-amber-100' },
    2: { height: 'h-20', ring: 'ring-slate-300',  bg: 'bg-slate-50',  name: 'text-slate-600', medal: '🥈', glow: 'bg-slate-100' },
    3: { height: 'h-14', ring: 'ring-orange-200', bg: 'bg-orange-50', name: 'text-orange-500', medal: '🥉', glow: 'bg-orange-100' },
  }
  const c = config[pos]

  return (
    <div className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
      <div className={`relative w-14 h-14 rounded-2xl ring-2 ${c.ring} ${c.bg} flex items-center justify-center text-xl font-bold ${c.name}`}>
        {entry.name?.[0]?.toUpperCase()}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${c.glow} border border-white flex items-center justify-center text-xs shadow-sm`}>
          {c.medal}
        </div>
      </div>

      <div className="text-center">
        <div className="text-xs font-bold text-slate-700 truncate max-w-[130px]">{entry.name}</div>
        {entry.college && (
          <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
            {entry.college.code ?? entry.college.name}
          </div>
        )}
        <div className="text-xs font-bold text-indigo-600 mt-0.5">{entry.totalPoints} pts</div>
      </div>

      <div className={`w-full ${c.height} rounded-t-xl ${c.bg} border border-slate-200 flex items-center justify-center shadow-sm`}>
        <span className="text-2xl">{c.medal}</span>
      </div>
    </div>
  )
}


function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}


function formatTime(seconds) {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}