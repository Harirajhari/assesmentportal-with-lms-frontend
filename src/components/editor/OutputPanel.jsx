import { useDispatch, useSelector } from 'react-redux'
import { setConsoleTab } from '../../features/submissions/submissionSlice'
import { Spinner, VerdictBadge } from '../ui'
import { Play, Send, CheckCircle, XCircle, Clock, MemoryStick, Zap } from 'lucide-react'

export default function OutputPanel({ problem, onRun, onSubmit, submitLabel = 'Submit', readOnly = false }) {
  const dispatch = useDispatch()
  const { runResult, submitResult, running, submitting, consoleTab, error } = useSelector(s => s.submissions)

  const activeResult = submitResult ?? runResult
  const isSubmitResult = !!submitResult
  const busy = running || submitting

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Tab bar + buttons */}
      <div className="flex items-center border-b border-surface-100 px-4 flex-shrink-0 bg-surface-50">
        <TabBtn label="Test Cases" active={consoleTab === 'cases'} onClick={() => dispatch(setConsoleTab('cases'))} />
        <TabBtn label="Output" active={consoleTab === 'output'} onClick={() => dispatch(setConsoleTab('output'))} dot={!!activeResult} />

        <div className="ml-auto flex items-center gap-2 py-2">
          {onRun && (
            <button
              onClick={() => { dispatch(setConsoleTab('output')); onRun() }}
              disabled={busy || readOnly}
              className="btn btn-secondary btn-sm"
            >
              {running ? <><Spinner size="sm" /> Running…</> : <><Play size={12} /> Run Code</>}
            </button>
          )}
          <button
            onClick={() => { dispatch(setConsoleTab('output')); onSubmit() }}
            disabled={busy || readOnly}
            className="btn btn-primary btn-sm"
          >
            {submitting ? <><Spinner size="sm" /> {submitLabel}</> : <><Send size={12} /> {submitLabel}</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {consoleTab === 'cases' && <TestCasesTab problem={problem} />}
        {consoleTab === 'output' && (
          <OutputTab
            result={activeResult}
            isSubmit={isSubmitResult}
            running={running}
            submitting={submitting}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Tab button ─────────────────────────────────────────────────────────── */
function TabBtn({ label, active, onClick, dot }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-3 text-sm font-medium border-b-2 mr-1 transition-colors
        ${active ? 'border-primary-500 text-primary-700' : 'border-transparent text-surface-400 hover:text-slate-700'}`}
    >
      {label}
      {dot && !active && <span className="absolute top-2.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />}
    </button>
  )
}

/* ─── Test cases tab ─────────────────────────────────────────────────────── */
function TestCasesTab({ problem }) {
  const examples = problem?.examples ?? []
  if (!examples.length) return <p className="text-surface-400 text-sm">No sample test cases available.</p>

  return (
    <div className="space-y-3">
      {examples.slice(0, 3).map((ex, i) => (
        <div key={i} className="bg-surface-50 border border-surface-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-surface-100 border-b border-surface-200">
            <span className="text-xs font-semibold text-surface-500">Case {i + 1}</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-surface-400 mb-1 font-semibold">Input</div>
              <pre className="font-mono text-xs text-slate-700 bg-white border border-surface-200 rounded-lg p-2 overflow-x-auto">{ex.input}</pre>
            </div>
            <div>
              <div className="text-xs text-surface-400 mb-1 font-semibold">Expected Output</div>
              <pre className="font-mono text-xs text-emerald-700 bg-white border border-surface-200 rounded-lg p-2 overflow-x-auto">{ex.output}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Output tab ─────────────────────────────────────────────────────────── */
function OutputTab({ result, isSubmit, running, submitting, error }) {
  if (running || submitting) {
    return (
      <div className="flex flex-col items-center justify-center h-28 gap-3">
        <div className="relative">
          <Spinner size="lg" />
          <Zap size={14} className="absolute inset-0 m-auto text-primary-500" />
        </div>
        <span className="text-surface-400 text-sm animate-pulse">
          {running ? 'Running against test cases…' : 'Judging your submission…'}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="text-red-700 font-semibold text-sm mb-1">Error</div>
        <pre className="text-red-600 text-xs font-mono whitespace-pre-wrap">{error}</pre>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-28 gap-2 text-surface-300">
        <Play size={28} className="opacity-30" />
        <p className="text-sm">Run or submit your code to see results</p>
      </div>
    )
  }

  const verdict = result.verdict ?? result.overallStatus ?? result.status ?? '—'
  const passedCount = result.passedCount ?? result.testCasesPassed ?? 0
  const totalCases = result.totalTestCases ?? 0
  const runtime = result.runtime ?? result.avgRuntime   // ms
  const memory = result.memory                          // KB
  const accepted = verdict === 'Accepted'

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Verdict hero ── */}
      <div className={`rounded-xl border-2 overflow-hidden
        ${accepted ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>

        {/* Top: verdict + test count */}
        <div className="px-5 py-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${accepted ? 'bg-green-100' : 'bg-red-100'}`}>
            {accepted
              ? <CheckCircle size={22} className="text-green-600" />
              : <XCircle size={22} className="text-red-500" />
            }
          </div>
          <div>
            <div className={`text-lg font-bold ${accepted ? 'text-green-700' : 'text-red-600'}`}>
              {verdict}
            </div>
            {totalCases > 0 && (
              <div className="text-xs text-slate-500 mt-0.5">
                {passedCount} / {totalCases} test cases passed
              </div>
            )}
          </div>
        </div>

        {/* Runtime + memory — shown for ALL verdicts when available */}
        {(runtime != null || memory != null) && (
          <div className={`border-t grid divide-x ${accepted ? 'border-green-200 divide-green-200' : 'border-red-200 divide-red-200'} ${runtime != null && memory != null ? 'grid-cols-2' : 'grid-cols-1'}`}>

            {/* Runtime */}
            {runtime != null && (
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Clock size={11} /> Runtime
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-slate-800 font-mono">
                    {formatRuntime(runtime)}
                  </span>
                  <span className="text-sm text-slate-500 mb-0.5">{runtimeUnit(runtime)}</span>
                </div>
                {isSubmit && <PercentileBar value={runtime} max={2000} invert />}
              </div>
            )}

            {/* Memory */}
            {memory != null && (
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <MemoryStick size={11} /> Memory
                </div>
                <div className="flex items-end gap-1.5">
                  <span className="text-2xl font-bold text-slate-800 font-mono">
                    {formatMemory(memory)}
                  </span>
                  <span className="text-sm text-slate-500 mb-0.5">{memoryUnit(memory)}</span>
                </div>
                {isSubmit && <PercentileBar value={memory} max={262144} invert />}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Per-case results (from /execute run) ── */}
      {result.results?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-surface-400">Test Cases</p>
          {result.results.map((r, i) => <TestResult key={i} index={i} r={r} />)}
        </div>
      )}

      {/* ── stdout / stderr / compile error ── */}
      {result.stdout && <OutputBlock label="stdout" content={result.stdout} cls="text-slate-700" />}
      {result.stderr && <OutputBlock label="stderr" content={result.stderr} cls="text-red-600" />}
      {result.compileError && <OutputBlock label="Compile Error" content={result.compileError} cls="text-orange-600" />}
    </div>
  )
}

/* ─── Percentile bar (simulated — shows relative speed visually) ─────────── */
function PercentileBar({ value, max, label, invert }) {
  // Invert: lower runtime = better = higher percentile
  const pct = Math.min(100, Math.max(0, invert
    ? Math.round((1 - value / max) * 100)
    : Math.round((value / max) * 100)
  ))

  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] text-slate-500 mb-1">
        <span>Beats <span className="font-bold text-slate-700">{pct}%</span> of submissions</span>
      </div>
      <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Per test case row ──────────────────────────────────────────────────── */
function TestResult({ index, r }) {
  const ok = r.passed || r.status === 'Accepted'
  return (
    <div className={`rounded-lg border px-4 py-3 text-xs ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2 font-semibold">
        {ok
          ? <CheckCircle size={12} className="text-green-600" />
          : <XCircle size={12} className="text-red-500" />
        }
        <span className={ok ? 'text-green-700' : 'text-red-600'}>
          Case {index + 1} — {ok ? 'Passed' : 'Failed'}
        </span>
        {r.runtime != null && (
          <span className="ml-auto text-surface-400 font-mono">{r.runtime} ms</span>
        )}
      </div>
      {!ok && (r.expectedOutput || r.actualOutput || r.stdout) && (
        <div className="grid grid-cols-2 gap-3 mt-2 font-mono">
          <div>
            <div className="text-surface-400 mb-1">Got</div>
            <pre className="bg-white border border-red-100 rounded p-1.5 text-slate-700 overflow-x-auto">
              {r.actualOutput ?? r.stdout ?? '—'}
            </pre>
          </div>
          <div>
            <div className="text-surface-400 mb-1">Expected</div>
            <pre className="bg-white border border-green-100 rounded p-1.5 text-emerald-700 overflow-x-auto">
              {r.expectedOutput ?? '—'}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── stdout/stderr block ────────────────────────────────────────────────── */
function OutputBlock({ label, content, cls }) {
  return (
    <div className="rounded-xl border border-surface-200 overflow-hidden">
      <div className="px-4 py-2 bg-surface-50 border-b border-surface-200">
        <span className="text-xs font-semibold text-surface-500">{label}</span>
      </div>
      <pre className={`p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto bg-white ${cls}`}>{content}</pre>
    </div>
  )
}

/* ─── Formatters ─────────────────────────────────────────────────────────── */
// runtime comes in ms from Judge0
function formatRuntime(ms) {
  if (ms == null) return '—'
  if (ms < 1) return '< 1'
  if (ms < 1000) return String(Math.round(ms))
  return (ms / 1000).toFixed(2)
}
function runtimeUnit(ms) {
  return ms >= 1000 ? ' s' : ' ms'
}

// memory comes in KB from Judge0
function formatMemory(kb) {
  if (kb == null) return '—'
  if (kb < 1024) return String(Math.round(kb))
  return (kb / 1024).toFixed(1)
}
function memoryUnit(kb) {
  return kb >= 1024 ? ' MB' : ' KB'
}