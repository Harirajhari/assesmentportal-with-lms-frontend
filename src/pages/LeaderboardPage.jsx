import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchLeaderboard,
  fetchOverallLeaderboard,
} from '../features/leaderboard/leaderboardSlice'
import { useAuth } from '../hooks'
import { PageLoader, EmptyState, StatCard } from '../components/ui'
import { Trophy, Flame, Star, Globe, Building2 } from 'lucide-react'

const TABS = [
  { key: 'college', label: 'My College', icon: Building2 },
  { key: 'overall', label: 'Overall',    icon: Globe     },
]

export default function LeaderboardPage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const {
    entries, myRank, myOverallRank,
    overallEntries, loading, overallLoading,
  } = useSelector(s => s.leaderboard)

  const [tab, setTab] = useState('college')

  useEffect(() => { dispatch(fetchLeaderboard()) },        [dispatch])
  useEffect(() => { dispatch(fetchOverallLeaderboard()) }, [dispatch])

  const isCollegeTab  = tab === 'college'
  const activeEntries = isCollegeTab ? entries : overallEntries
  const isLoading     = isCollegeTab ? loading : overallLoading
  const top3          = activeEntries.slice(0, 3)
  const currentRank   = isCollegeTab ? myRank : myOverallRank

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900">Leaderboard</h1>
        <p className="text-surface-400 text-sm mt-0.5">
          {isCollegeTab
            ? (user?.college?.name ? `${user.college.name} · College Rankings` : 'College Rankings')
            : 'Overall Rankings · All Colleges'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${tab === key
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white border-surface-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
              }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* My rank card */}
      {currentRank && (
        <div className="card p-5 mb-6 border-primary-200 bg-primary-50 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-100 border border-primary-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold font-mono text-primary-700">#{currentRank.rank}</span>
          </div>
          <div>
            <div className="text-slate-900 font-bold">
              {isCollegeTab ? 'Your College Rank' : 'Your Overall Rank'}
            </div>
            <div className="text-surface-500 text-sm mt-0.5">
              Score: <span className="font-semibold text-primary-700">{currentRank.score}</span>
            </div>
          </div>
          <div className="ml-auto hidden sm:flex gap-4">
            <StatCard
              icon={Star}
              iconCls="text-amber-500"
              bgCls="bg-amber-50"
              label="Score"
              value={currentRank.score ?? '—'}
            />
          </div>
        </div>
      )}

      {/* Podium – top 3 */}
      {top3.length >= 2 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {top3[1] && <PodiumCard entry={top3[1]} pos={2} showCollege={!isCollegeTab} />}
          {top3[0] && <PodiumCard entry={top3[0]} pos={1} showCollege={!isCollegeTab} />}
          {top3[2] && <PodiumCard entry={top3[2]} pos={3} showCollege={!isCollegeTab} />}
        </div>
      )}

      {/* Full table */}
      {isLoading ? (
        <PageLoader />
      ) : activeEntries.length === 0 ? (
        <EmptyState icon={Trophy} title="No leaderboard data" desc="Solve problems to appear here." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-14">Rank</th>
                <th>Name</th>
                {!isCollegeTab && <th className="hidden sm:table-cell">College</th>}
                <th className="text-right w-20">Solved</th>
                <th className="text-right w-20">Score</th>
                <th className="text-right hidden md:table-cell w-24">Streak</th>
              </tr>
            </thead>
            <tbody>
              {activeEntries.map((e, i) => {
                const isMe = e.userId === user?._id || e.userId === user?.id
                return (
                  <tr
                    key={e.userId ?? i}
                    className={isMe ? '!bg-primary-50 !border-primary-100' : ''}
                  >
                    <td><RankCell rank={e.rank ?? i + 1} /></td>
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
                    {!isCollegeTab && (
                      <td className="hidden sm:table-cell">
                        <CollegeBadge college={e.college} />
                      </td>
                    )}
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

function CollegeBadge({ college }) {
  if (!college) return <span className="text-surface-300 text-xs">—</span>
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-100 border border-surface-200 text-xs font-medium text-slate-600">
      <Building2 size={10} />
      {college.code ?? college.name ?? '—'}
    </span>
  )
}

function PodiumCard({ entry, pos, showCollege }) {
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
        {showCollege && entry.college && (
          <div className="text-xs text-primary-500 font-medium truncate max-w-[90px]">
            {entry.college.code ?? entry.college.name}
          </div>
        )}
        <div className="text-xs text-surface-400 font-mono">{entry.totalSolved ?? 0} solved</div>
      </div>
      <div className={`w-full ${heights[pos]} ${bgColors[pos]} rounded-t-xl flex items-center justify-center shadow-card`}>
        <span className="text-xl">{labels[pos]}</span>
      </div>
    </div>
  )
}