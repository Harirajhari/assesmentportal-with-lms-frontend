import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchDailyChallenge } from '../../features/daily/dailySlice'
import { Flame, ArrowRight, CheckCircle, Calendar } from 'lucide-react'

export default function DailyStreakWidget() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { today, loading } = useSelector(s => s.daily)

  useEffect(() => {
    if (!today) dispatch(fetchDailyChallenge())
  }, [dispatch, today])

  if (loading || !today) return <DailyStreakSkeleton />

  const { currentStreak, longestStreak, completed, problem } = today

  return (
    <div
      onClick={() => navigate('/daily')}
      className={`card p-5 cursor-pointer hover:shadow-md transition-all border-2 group
        ${completed ? 'border-green-200 bg-green-50/30' : 'border-orange-200 bg-orange-50/30'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
            ${completed ? 'bg-green-100' : 'bg-orange-100'}`}>
            {completed
              ? <CheckCircle size={16} className="text-green-600" />
              : <Flame size={16} className="text-orange-500" />
            }
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Daily Challenge</div>
            <div className="text-xs text-surface-400">
              {completed ? 'Completed today ✓' : 'Solve today\'s problem'}
            </div>
          </div>
        </div>
        <ArrowRight size={16} className="text-surface-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Problem title */}
      {problem && (
        <div className={`rounded-lg px-3 py-2 mb-4 text-sm font-medium truncate
          ${completed ? 'bg-green-100/60 text-green-800' : 'bg-white border border-surface-200 text-slate-700'}`}>
          {problem.title}
        </div>
      )}

      {/* Streak counters */}
      <div className="flex items-center gap-4">
        {/* Current streak */}
        <div className="flex items-center gap-1.5">
          <Flame size={18} className={currentStreak > 0 ? 'text-orange-500' : 'text-surface-300'} />
          <div>
            <div className="text-lg font-bold text-slate-800 leading-none">{currentStreak}</div>
            <div className="text-[11px] text-surface-400">day streak</div>
          </div>
        </div>

        <div className="w-px h-8 bg-surface-200" />

        {/* Longest streak */}
        <div>
          <div className="text-sm font-bold text-slate-600">{longestStreak}</div>
          <div className="text-[11px] text-surface-400">best streak</div>
        </div>

        {/* Mini streak dots (last 7 days visual) */}
        <div className="ml-auto flex items-center gap-1">
          {Array.from({ length: 7 }, (_, i) => {
            // Simplified: show completed today + placeholder for past days
            const isToday = i === 6
            const filled  = isToday ? completed : false
            return (
              <div
                key={i}
                className={`w-3 h-3 rounded-sm transition-colors
                  ${filled  ? 'bg-orange-400'
                  : isToday ? 'bg-orange-200'
                            : 'bg-surface-200'}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DailyStreakSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-surface-200" />
        <div className="space-y-1">
          <div className="h-3 w-24 bg-surface-200 rounded" />
          <div className="h-2 w-16 bg-surface-100 rounded" />
        </div>
      </div>
      <div className="h-8 bg-surface-100 rounded-lg mb-4" />
      <div className="flex gap-4">
        <div className="h-8 w-16 bg-surface-100 rounded" />
        <div className="h-8 w-16 bg-surface-100 rounded" />
      </div>
    </div>
  )
}