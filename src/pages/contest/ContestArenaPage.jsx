import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchContest, joinContest,
  submitContestSolution, fetchContestLeaderboard,
  clearResult,
} from '../../features/contest/contestSlice'
import { runCode, setConsoleTab } from '../../features/submissions/submissionSlice'
import { useContestSocket } from '../../features/contest/useContestSocket'
import { useCountdown }      from '../../features/contest/useCountdown'
import { useNotify }         from '../../hooks'
import { PageLoader }        from '../../components/ui'
import CodingWorkspace       from '../../components/editor/CodingWorkspace'
import { loadCode }          from '../../utils/editorUtils'
import {
  Clock, CheckCircle, Lock, Trophy,
  AlertTriangle, ChevronRight, ExternalLink,
} from 'lucide-react'

export default function ContestArenaPage() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const notify   = useNotify()

  const { current: contest, submitting, lastResult } = useSelector(s => s.contest)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [code,          setCode]          = useState('')
  const [language,      setLanguage]      = useState('python')
  const [joined,        setJoined]        = useState(false)
  const autoSubmittedRef = useRef(false)

  const problems        = [...(contest?.problems ?? [])].sort((a, b) => a.order - b.order)
  const selectedEntry   = problems.find(p => p.order === selectedOrder)
  const selectedProblem = selectedEntry?.problemId
  const unlockedOrders  = contest?.unlockedOrders ?? problems.map(p => p.order)
  const myStats         = contest?.myStats ?? {}
  const isLive          = !!(contest?.hasStarted && !contest?.hasEnded)
  const isFrozen        = contest?.status === 'frozen'

  useContestSocket(id)

  useEffect(() => {
    dispatch(fetchContest(id))
    dispatch(fetchContestLeaderboard(id))
  }, [dispatch, id])

  useEffect(() => {
    if (contest && !selectedOrder) {
      const sorted = [...(contest.problems ?? [])].sort((a, b) => a.order - b.order)
      setSelectedOrder(sorted[0]?.order ?? 1)
    }
  }, [contest, selectedOrder])

  // When problem or language changes:
  // Priority: localStorage saved → problem.starterCode[lang] → default template
  useEffect(() => {
    if (!selectedProblem) return
    setCode(loadCode(selectedProblem._id, language, selectedProblem.starterCode))
    dispatch(clearResult())
  }, [selectedOrder, language]) // eslint-disable-line

  const handleExpire = useCallback(async () => {
    if (autoSubmittedRef.current || !joined || !selectedOrder) return
    autoSubmittedRef.current = true
    notify.warning('⏰ Time is up! Auto-submitting your code…')
    await dispatch(submitContestSolution({
      contestId: id, problemOrder: selectedOrder,
      code, language, autoSubmitted: true,
    }))
    dispatch(fetchContestLeaderboard(id))
  }, [id, selectedOrder, code, language, joined, dispatch, notify])

  const { formatted, isWarning, isExpired } = useCountdown(
    contest?.endTime ?? new Date(Date.now() + 999999999),
    handleExpire,
  )

  useEffect(() => {
    if (contest?.hasStarted && !contest?.hasEnded && !joined) {
      dispatch(joinContest(id)).then(r => { if (!r.error) setJoined(true) })
    }
  }, [contest?.hasStarted, contest?.hasEnded, joined, dispatch, id])

  useEffect(() => {
    if (!lastResult) return
    if (lastResult.status === 'Accepted') {
      notify.success(`✅ Accepted! +${lastResult.pointsAwarded} points`)
      dispatch(fetchContest(id))
      dispatch(fetchContestLeaderboard(id))
    } else {
      notify.error(`❌ ${lastResult.status}`)
    }
  }, [lastResult, dispatch, id, notify])

  if (!contest) return <PageLoader />

  const handleRun = () => {
    if (!code.trim()) return notify.warn('Write some code first!')
    dispatch(setConsoleTab('output'))
    dispatch(runCode({ problemId: selectedProblem?._id, language, code }))
  }

  const handleSubmit = () => {
    if (!code.trim()) return notify.warn('Write some code first!')
    dispatch(setConsoleTab('output'))
    dispatch(submitContestSolution({ contestId: id, problemOrder: selectedOrder, code, language }))
  }

  const problemMeta = selectedEntry ? (
    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary-50 text-primary-700 border border-primary-200">
      {selectedEntry.points} pts · P{selectedOrder}
    </span>
  ) : null

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-white">

      {/* ── Top bar ── */}
      <header className="flex items-center gap-4 px-5 py-2.5 bg-slate-900 border-b border-slate-700 z-10 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h1 className="text-sm font-semibold text-white truncate">{contest.title}</h1>
          {isFrozen && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">❄️ Frozen</span>
          )}
          {isLive && !isFrozen && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          )}
          {isExpired && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/25">Ended</span>
          )}
        </div>

        <span className="hidden sm:block text-xs text-slate-400">
          {myStats.solvedOrders?.length ?? 0}/{problems.length} solved
        </span>

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-wider
          ${isWarning ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'bg-white/5 text-white border border-white/10'}`}>
          {isWarning ? <AlertTriangle size={13} className="text-red-400" /> : <Clock size={13} className="text-slate-400" />}
          {isExpired ? '00:00:00' : formatted}
        </div>

        <button
          onClick={() => navigate(`/contests/${id}/leaderboard`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
        >
          <Trophy size={12} /> Leaderboard <ExternalLink size={11} className="opacity-60" />
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Problem sidebar */}
        <aside className="w-[200px] flex-shrink-0 bg-surface-50 border-r border-surface-200 flex flex-col overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400 px-4 pt-4 pb-2">Problems</p>
          <div className="flex-1 px-2 pb-4 flex flex-col gap-1">
            {problems.map(({ order, points, problemId: prob }) => {
              const locked   = !unlockedOrders.includes(order)
              const pStats   = myStats.problemStats?.[String(order)]
              const isSolved = pStats?.solved
              const attempts = pStats?.attempts ?? 0
              const isActive = order === selectedOrder

              return (
                <button
                  key={order}
                  disabled={locked}
                  onClick={() => !locked && setSelectedOrder(order)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                    ${isActive ? 'bg-primary-50 border border-primary-200' : 'border border-transparent hover:bg-white hover:border-surface-200'}
                    ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${isSolved  ? 'bg-green-100 text-green-600'
                    : locked    ? 'bg-surface-100 text-surface-400'
                    : isActive  ? 'bg-primary-100 text-primary-700'
                                : 'bg-surface-100 text-slate-500'}`}>
                    {isSolved ? <CheckCircle size={13} /> : locked ? <Lock size={11} /> : order}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-semibold truncate leading-tight ${isActive ? 'text-primary-700' : 'text-slate-700'}`}>
                      {prob?.title ?? `Problem ${order}`}
                    </div>
                    <div className="text-[11px] text-surface-400 mt-0.5">
                      {points} pts{attempts > 0 && !isSolved ? ` · ${attempts}✗` : ''}
                    </div>
                  </div>
                  {isActive && <ChevronRight size={12} className="text-primary-400 flex-shrink-0" />}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Shared coding workspace */}
        <div className="flex-1 overflow-hidden">
          <CodingWorkspace
            problemId={selectedProblem?._id}
            problem={selectedProblem}
            problemMeta={problemMeta}
            code={code}
            onCodeChange={setCode}
            language={language}
            onLangChange={setLanguage}
            onRun={handleRun}
            onSubmit={handleSubmit}
            readOnly={isExpired || !isLive}
            submitLabel={submitting ? 'Judging…' : isExpired ? 'Contest Ended' : 'Submit'}
          />
        </div>
      </div>
    </div>
  )
}