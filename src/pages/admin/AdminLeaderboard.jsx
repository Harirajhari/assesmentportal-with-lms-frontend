import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchLeaderboard,
  fetchCollegeLeaderboard,
  fetchOverallLeaderboard,
} from '../../features/leaderboard/leaderboardSlice'
import { useNotify } from '../../hooks'
import { PageLoader, EmptyState, PageHeader } from '../../components/ui'
import { collegeService, leaderboardService } from '../../services/collegeService'
import { Trophy, Flame, RefreshCw, Globe, Building2 } from 'lucide-react'

export default function AdminLeaderboard() {
  const dispatch = useDispatch()
  const notify   = useNotify()
  const { entries, overallEntries, loading, overallLoading } = useSelector(s => s.leaderboard)

  const [colleges,   setColleges]   = useState([])
  const [selectedId, setSelectedId] = useState('overall')
  const [rebuilding, setRebuilding] = useState(false)

  useEffect(() => {
    collegeService.getAll({ limit: 100 })
      .then(r => setColleges(r.data?.data?.colleges ?? r.data?.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selectedId === 'overall') dispatch(fetchOverallLeaderboard())
    else if (selectedId)          dispatch(fetchCollegeLeaderboard(selectedId))
    else                          dispatch(fetchLeaderboard())
  }, [dispatch, selectedId])

  const handleRebuild = useCallback(async () => {
    setRebuilding(true)
    try {
      if (selectedId === 'overall') {
        await leaderboardService.rebuildOverall()
        notify.success('Overall leaderboard rebuilt!')
        dispatch(fetchOverallLeaderboard())
      } else if (selectedId) {
        await leaderboardService.rebuild(selectedId)
        notify.success('College leaderboard rebuilt!')
        dispatch(fetchCollegeLeaderboard(selectedId))
      } else {
        notify.info('Select a college or Overall to rebuild')
      }
    } catch { notify.error('Rebuild failed') }
    finally { setRebuilding(false) }
  }, [selectedId, dispatch, notify])

  const isOverall     = selectedId === 'overall'
  const activeEntries = isOverall ? overallEntries : entries
  const isLoading     = isOverall ? overallLoading : loading
  const selectedCollegeName = isOverall
    ? 'Overall · All Colleges'
    : colleges.find(c => c._id === selectedId)?.name ?? 'All colleges'

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle={selectedCollegeName}
        actions={
          <button onClick={handleRebuild} disabled={rebuilding} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} className={rebuilding ? 'animate-spin' : ''} />
            {rebuilding ? 'Rebuilding…' : 'Rebuild'}
          </button>
        }
      />

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2 mb-6 p-1">
        <button
          onClick={() => setSelectedId('overall')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all
            ${isOverall
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
              : 'bg-white border-surface-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
            }`}
        >
          <Globe size={13} /> Overall
        </button>

        {colleges.length > 0 && (
          <div className="flex items-center px-1">
            <div className="w-px h-6 bg-surface-200" />
          </div>
        )}

        {colleges.map(c => (
          <button
            key={c._id}
            onClick={() => setSelectedId(c._id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${selectedId === c._id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white border-surface-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
              }`}
          >
            <Building2 size={12} />
            {c.code ?? c.name}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      {isLoading ? (
        <PageLoader />
      ) : activeEntries.length === 0 ? (
        <EmptyState icon={Trophy} title="No data" desc="Students need to solve problems first." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-14">Rank</th>
                <th>Name</th>
                {isOverall && <th className="hidden sm:table-cell">College</th>}
                <th className="text-right w-20">Solved</th>
                <th className="text-right w-20">Score</th>
                <th className="text-right hidden md:table-cell w-24">Streak</th>
              </tr>
            </thead>
            <tbody>
              {activeEntries.map((e, i) => (
                <tr key={e.userId ?? i}>
                  <td><RankCell rank={e.rank ?? i + 1} /></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                        {e.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-slate-800 font-semibold text-sm">{e.name}</span>
                    </div>
                  </td>
                  {isOverall && (
                    <td className="hidden sm:table-cell">
                      {e.college ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-100 border border-surface-200 text-xs font-medium text-slate-600">
                          <Building2 size={10} />
                          {e.college.code ?? e.college.name}
                        </span>
                      ) : <span className="text-surface-300 text-xs">—</span>}
                    </td>
                  )}
                  <td className="text-right font-mono font-bold text-primary-600">{e.totalSolved ?? 0}</td>
                  <td className="text-right font-mono text-slate-700">{e.score ?? 0}</td>
                  <td className="text-right hidden md:table-cell">
                    {(e.streak ?? 0) > 0
                      ? <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-semibold"><Flame size={11}/>{e.streak}d</span>
                      : <span className="text-surface-300 text-xs">—</span>
                    }
                  </td>
                </tr>
              ))}
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