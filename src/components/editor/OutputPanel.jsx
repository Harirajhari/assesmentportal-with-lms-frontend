import { useSelector, useDispatch } from 'react-redux'
import { setConsoleTab } from '../../features/submissions/submissionSlice'
import { Spinner, VerdictBadge } from '../ui'
import { Play, Send, CheckCircle, XCircle } from 'lucide-react'
import { fmtRuntime, fmtMemory } from '../../utils/helpers'

export default function OutputPanel({ problem, onRun, onSubmit }) {
  const dispatch = useDispatch()
  const { runResult, submitResult, running, submitting, consoleTab, error } = useSelector(s => s.submissions)

  const activeResult = submitResult ?? runResult

  return (
    <div className="flex flex-col h-full bg-white border-t border-surface-200">
      {/* Tab bar + action buttons */}
      <div className="flex items-center border-b border-surface-100 px-4 flex-shrink-0 bg-surface-50">
        <TabBtn label="Test Cases" active={consoleTab === 'cases'}  onClick={() => dispatch(setConsoleTab('cases'))}  />
        <TabBtn label="Output"     active={consoleTab === 'output'} onClick={() => dispatch(setConsoleTab('output'))} dot={!!activeResult} />

        <div className="ml-auto flex items-center gap-2 py-2">
          <button onClick={onRun} disabled={running || submitting} className="btn btn-secondary btn-sm">
            {running ? <><Spinner size="sm" /> Running…</> : <><Play size={13} /> Run</>}
          </button>
          <button onClick={onSubmit} disabled={running || submitting} className="btn btn-primary btn-sm">
            {submitting ? <><Spinner size="sm" /> Submitting…</> : <><Send size={13} /> Submit</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {consoleTab === 'cases' && <TestCasesTab problem={problem} />}
        {consoleTab === 'output' && <OutputTab result={activeResult} isSubmit={!!submitResult} running={running} submitting={submitting} error={error} />}
      </div>
    </div>
  )
}

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
              <pre className="font-mono text-xs text-slate-700 bg-white border border-surface-200 rounded-lg p-2 overflow-x-auto">{ex.output}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function OutputTab({ result, isSubmit, running, submitting, error }) {
  if (running || submitting) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-3">
        <Spinner size="lg" />
        <span className="text-surface-400 text-sm">{running ? 'Running code…' : 'Judging submission…'}</span>
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
    return <p className="text-surface-400 text-sm text-center py-8">Run or submit your code to see results here.</p>
  }

  // Backend execute response: { overallStatus, allPassed, passedCount, totalTestCases, avgRuntime, results:[] }
  // Backend submit response:  { verdict, passedCount, totalTestCases, runtime, memory, submission:{} }
  const verdict      = result.verdict ?? result.overallStatus ?? '—'
  const passedCount  = result.passedCount  ?? 0
  const totalCases   = result.totalTestCases ?? 0
  const runtime      = result.runtime ?? result.avgRuntime
  const memory       = result.memory
  const accepted     = verdict === 'Accepted'

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Verdict card */}
      <div className={`rounded-xl border p-4 ${accepted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {accepted
              ? <CheckCircle size={18} className="text-green-600" />
              : <XCircle    size={18} className="text-red-600"   />
            }
            <VerdictBadge verdict={verdict} />
          </div>
          <div className="flex items-center gap-4 text-xs text-surface-400 font-mono">
            {runtime  != null && <span>⏱ {fmtRuntime(runtime)}</span>}
            {memory   != null && <span>💾 {fmtMemory(memory)}</span>}
          </div>
        </div>
        {totalCases > 0 && (
          <div className="mt-2 text-sm text-slate-600">
            Passed <span className="font-bold text-slate-900">{passedCount}</span> / <span className="font-bold">{totalCases}</span> test cases
          </div>
        )}
      </div>

      {/* Individual results (from /execute) */}
      {result.results?.map((r, i) => (
        <TestResult key={i} index={i} r={r} />
      ))}

      {/* stdout / stderr */}
      {result.stdout  && <OutputBlock label="stdout" content={result.stdout}  cls="text-slate-700" />}
      {result.stderr  && <OutputBlock label="stderr" content={result.stderr}  cls="text-red-600"   />}
      {result.compileError && <OutputBlock label="Compile Error" content={result.compileError} cls="text-orange-600" />}
    </div>
  )
}

function TestResult({ index, r }) {
  const ok = r.passed || r.status === 'Accepted'
  return (
    <div className={`rounded-xl border p-3 text-xs ${ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center gap-2 mb-2 font-semibold">
        {ok ? <CheckCircle size={13} className="text-green-600" /> : <XCircle size={13} className="text-red-600" />}
        <span className={ok ? 'text-green-700' : 'text-red-700'}>Case {index + 1}: {ok ? 'Passed' : 'Failed'}</span>
        {r.runtime != null && <span className="ml-auto text-surface-400 font-mono">{r.runtime}ms</span>}
      </div>
      {!ok && r.expectedOutput && (
        <div className="grid grid-cols-2 gap-2 mt-1 font-mono">
          <div>
            <span className="text-surface-400">Got: </span>
            <span className="text-slate-700">{r.actualOutput ?? r.stdout ?? '—'}</span>
          </div>
          <div>
            <span className="text-surface-400">Expected: </span>
            <span className="text-slate-700">{r.expectedOutput}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function OutputBlock({ label, content, cls }) {
  return (
    <div className="rounded-xl border border-surface-200 overflow-hidden">
      <div className="px-4 py-2 bg-surface-50 border-b border-surface-200">
        <span className="text-xs font-semibold text-surface-500">{label}</span>
      </div>
      <pre className={`p-4 text-xs font-mono whitespace-pre-wrap overflow-x-auto ${cls}`}>{content}</pre>
    </div>
  )
}
