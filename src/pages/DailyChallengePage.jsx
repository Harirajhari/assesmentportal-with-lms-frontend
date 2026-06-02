import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchDailyChallenge, submitDailyChallenge,
  clearDailyResult,
} from '../features/daily/dailySlice'
import { setConsoleTab } from '../features/submissions/submissionSlice'
import { loadCode } from '../utils/editorUtils'
import { PageLoader } from '../components/ui'
import CodingWorkspace from '../components/editor/CodingWorkspace'
import { Flame, Trophy, Calendar, CheckCircle, Lock } from 'lucide-react'

export default function DailyChallengePage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  const { today, loading, submitting, result } = useSelector(s => s.daily)

  const [language, setLanguage] = useState('python')
  const [code,     setCode]     = useState('')

  useEffect(() => {
    dispatch(fetchDailyChallenge())
    return () => dispatch(clearDailyResult())
  }, [dispatch])

  useEffect(() => {
    if (today?.problem) {
      setCode(loadCode(`daily-${today.date}`, language, today.problem.starterCode))
    }
  }, [today?.problem, today?.date, language])

  const handleSubmit = useCallback(() => {
    if (!code.trim()) return
    dispatch(setConsoleTab('output'))
    dispatch(submitDailyChallenge({ code, language }))
  }, [code, language, dispatch])

  if (loading) return <PageLoader />

  if (!today) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-56px)] gap-4 text-surface-400">
        <Calendar size={48} className="opacity-30" />
        <p className="text-base font-semibold">No daily challenge scheduled for today</p>
        <p className="text-sm">Check back tomorrow!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden">

      {/* ── Top banner ── */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-white border-b border-surface-200 flex-shrink-0">
        {/* Daily badge */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
            <Flame size={15} className="text-orange-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 leading-tight">Daily Challenge</div>
            <div className="text-[11px] text-surface-400">{formatDate(today.date)}</div>
          </div>
        </div>

        <div className="w-px h-6 bg-surface-200" />

        {/* Streak counter */}
        <StreakBadge current={today.currentStreak} longest={today.longestStreak} />

        <div className="flex-1" />

        {/* Completed badge */}
        {today.completed && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-bold">
            <CheckCircle size={13} /> Completed today!
          </div>
        )}

        {/* Leaderboard link */}
        <button
          onClick={() => navigate('/daily/leaderboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <Trophy size={12} /> Streak Board
        </button>
      </div>

      {/* ── Coding workspace ── */}
      <div className="flex-1 overflow-hidden">
        <CodingWorkspace
          problemId={`daily-${today.date}`}
          problem={today.problem}
          problemMeta={
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-200">
              Daily · +10 pts
            </span>
          }
          code={code}
          onCodeChange={setCode}
          language={language}
          onLangChange={setLanguage}
          onRun={null}
          onSubmit={handleSubmit}
          readOnly={today.completed}
          submitLabel={
            submitting          ? 'Judging…'
            : today.completed   ? 'Already Completed'
            : 'Submit'
          }
        />
      </div>
    </div>
  )
}

/* ─── Streak badge ───────────────────────────────────────────────────────── */
function StreakBadge({ current, longest }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Flame size={16} className={current > 0 ? 'text-orange-500' : 'text-surface-300'} />
        <div>
          <div className="text-sm font-bold text-slate-800 leading-tight">
            {current}
            <span className="text-xs font-normal text-surface-400 ml-1">day streak</span>
          </div>
        </div>
      </div>
      {longest > 0 && (
        <div className="text-xs text-surface-400">
          Best: <span className="font-bold text-slate-600">{longest}</span>
        </div>
      )}
    </div>
  )
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}