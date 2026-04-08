import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLeaderboard, fetchCollegeLeaderboard } from '../../features/leaderboard/leaderboardSlice'
import { useNotify } from '../../hooks'
import { PageLoader, EmptyState, PageHeader } from '../../components/ui'
import { collegeService, leaderboardService } from '../../services/collegeService'
import { Trophy, Flame, RefreshCw, Globe } from 'lucide-react'
import { rankLabel } from '../../utils/helpers'

export default function AdminLeaderboard() {
  const dispatch  = useDispatch()
  const notify    = useNotify()
  const { entries, loading } = useSelector(s => s.leaderboard)

  const [colleges,    setColleges]    = useState([])
  const [selectedId,  setSelectedId]  = useState('')   // '' = all (global)
  const [rebuilding,  setRebuilding]  = useState(false)

  // Load colleges for tab selector
  useEffect(() => {
    collegeService.getAll({ limit: 100 })
      .then(r => setColleges(r.data?.data?.colleges ?? r.data?.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  // Fetch whenever selected college changes
  useEffect(() => {
    if (selectedId) dispatch(fetchCollegeLeaderboard(selectedId))
    else            dispatch(fetchLeaderboard())
  }, [dispatch, selectedId])

  const handleRebuild = useCallback(async () => {
    if (!selectedId) return notify.info('Select a college to rebuild its leaderboard')
    setRebuilding(true)
    try {
      await leaderboardService.rebuild(selectedId)
      notify.success('Leaderboard rebuilt from database!')
      dispatch(fetchCollegeLeaderboard(selectedId))
    } catch { notify.error('Rebuild failed') }
    finally { setRebuilding(false) }
  }, [selectedId, dispatch, notify])

  const selectedCollegeName = colleges.find(c => c._id === selectedId)?.name

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Leaderboard"
        subtitle={selectedCollegeName ?? 'All colleges'}
        actions={
          selectedId ? (
            <button onClick={handleRebuild} disabled={rebuilding} className="btn btn-secondary btn-sm">
              <RefreshCw size={13} className={rebuilding ? 'animate-spin' : ''} />
              {rebuilding ? 'Rebuilding…' : 'Rebuild'}
            </button>
          ) : null
        }
      />

      {/* College selector tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1">
        {/* All tab */}
        <button
          onClick={() => setSelectedId('')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all
            ${!selectedId
              ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
              : 'bg-white border-surface-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
            }`}
        >
          <Globe size={13} /> All
        </button>

        {colleges.map(c => (
          <button
            key={c._id}
            onClick={() => setSelectedId(c._id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all
              ${selectedId === c._id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white border-surface-200 text-slate-600 hover:border-primary-200 hover:text-primary-600'
              }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      {loading ? (
        <PageLoader />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title="No data" desc="Students need to solve problems first." />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-14">Rank</th>
                <th>Name</th>
                {!selectedId && <th className="hidden sm:table-cell">College</th>}
                <th className="text-right w-20">Solved</th>
                <th className="text-right w-20">Score</th>
                <th className="text-right hidden md:table-cell w-24">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.userId ?? i}>
                  <td><RankCell rank={i + 1} /></td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                        {e.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-slate-800 font-semibold text-sm">{e.name}</span>
                    </div>
                  </td>
                  {!selectedId && (
                    <td className="hidden sm:table-cell text-surface-400 text-xs">{e.college ?? '—'}</td>
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
