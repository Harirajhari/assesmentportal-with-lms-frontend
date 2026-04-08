import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaderboard, fetchCollegeLeaderboard } from '../features/leaderboard/leaderboardSlice'
import { useAuth } from '../hooks'
import { PageLoader, EmptyState, StatCard } from '../components/ui'
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react'
import { rankLabel } from '../utils/helpers'

export default function LeaderboardPage() {
  const dispatch = useDispatch()
  const { user, isAdmin } = useAuth()
  const { entries, myRank, loading, error } = useSelector(s => s.leaderboard)

  useEffect(() => {
    // Students auto-scoped to their college by backend
    // Admins get all colleges
    dispatch(fetchLeaderboard())
  }, [dispatch])

  const top3 = entries.slice(0, 3)

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-surface-400 text-sm mt-0.5">
          {user?.college?.name
            ? `${user.college.name} · College Rankings`
            : 'Platform Rankings'}
        </p>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="card p-5 mb-6 border-primary-200 bg-primary-50 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold font-mono text-primary-700">#{myRank.rank}</span>
          </div>
          <div>
            <div className="text-slate-900 font-bold">Your Rank</div>
            <div className="text-surface-500 text-sm mt-0.5">
              Score: <span className="font-semibold text-primary-700">{myRank.score}</span>
            </div>
          </div>
          <div className="ml-auto hidden sm:flex gap-4">
            <StatCard
              icon={Star}
              iconCls="text-amber-500"
              bgCls="bg-amber-50"
              label="Score"
              value={myRank.score ?? '—'}
            />
          </div>
        </div>
      )}

      {/* Podium – top 3 */}
      {top3.length >= 2 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {/* 2nd */}
          {top3[1] && <PodiumCard entry={top3[1]} pos={2} />}
          {/* 1st */}
          {top3[0] && <PodiumCard entry={top3[0]} pos={1} />}
          {/* 3rd */}
          {top3[2] && <PodiumCard entry={top3[2]} pos={3} />}
        </div>
      )}

      {/* Full table */}
      {loading ? (
        <PageLoader />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="No leaderboard data" desc="Solve problems to appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-14">Rank</th>
                <th>Name</th>
                <th className="hidden sm:table-cell">College</th>
                <th className="text-right w-20">Solved</th>
                <th className="text-right w-20">Score</th>
                <th className="text-right hidden md:table-cell w-24">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const isMe = e.userId === user?._id || e.userId === user?.id
                return (
                  <tr
                    key={e.userId ?? i}
                    className={isMe ? '!bg-primary-50 !border-primary-100' : ''}
                  >
                    <td>
                      <RankCell rank={i + 1} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                          {e.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isMe ? 'text-primary-700' : 'text-slate-800'}`}>
                            {e.name}
                            {isMe && <span className="ml-2 text-xs font-normal text-primary-500">(you)</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-surface-400 text-xs">{e.college ?? '—'}</td>
                    <td className="text-right font-mono font-bold text-primary-600">{e.totalSolved ?? 0}</td>
                    <td className="text-right font-mono text-slate-700">{e.score ?? 0}</td>
                    <td className="text-right hidden md:table-cell">
                      {(e.streak ?? 0) > 0
                        ? <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold"><Flame size={11} />{e.streak}d</span>
                        : <span className="text-surface-300 text-xs">—</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RankCell({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-surface-400 font-mono text-sm">#{rank}</span>
}

function PodiumCard({ entry, pos }) {
  const heights  = { 1: 'h-24', 2: 'h-16', 3: 'h-12' }
  const bgColors = { 1: 'bg-amber-400', 2: 'bg-slate-300', 3: 'bg-amber-600' }
  const labels   = { 1: '🥇', 2: '🥈', 3: '🥉' }

  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 max-w-[110px]">
      <div className="w-10 h-10 rounded-full bg-primary-100 border-2 border-primary-300 flex items-center justify-center text-primary-700 font-bold text-sm">
        {entry.name?.[0]?.toUpperCase()}
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-slate-800 truncate max-w-[90px]">{entry.name}</div>
        <div className="text-xs text-surface-400 font-mono">{entry.totalSolved ?? 0} solved</div>
      </div>
      <div className={`w-full ${heights[pos]} ${bgColors[pos]} rounded-t-xl flex items-center justify-center shadow-card`}>
        <span className="text-xl">{labels[pos]}</span>
      </div>
    </div>
  )
}
