/**
 * CodingWorkspace — shared coding environment for Practice & Contest pages.
 * Left panel (problem description) + output console = white/light theme
 * Right panel (Monaco editor) = dark theme
 */

import { useState } from 'react'
import { Clock, MemoryStick, Tag, ChevronDown, ChevronUp } from 'lucide-react'
import CodeEditor  from './CodeEditor'
import OutputPanel from './OutputPanel'
import { DiffBadge, Spinner } from '../ui'

export default function CodingWorkspace({
  problem,
  problemLoading = false,
  problemMeta    = null,
  code,
  onCodeChange,
  language,
  onLangChange,
  onRun,
  onSubmit,
  readOnly       = false,
  submitLabel    = 'Submit',
  extraActions   = null,
  problemId,
}) {
  const [outputOpen, setOutputOpen] = useState(true)
  const OUTPUT_HEIGHT = 260

  return (
    <div className="flex h-full overflow-hidden bg-white">

      {/* ── Left: Problem Panel (white) ── */}
      <div className="w-[42%] min-w-[300px] max-w-[520px] flex-shrink-0 border-r border-surface-200 flex flex-col overflow-hidden bg-white">
        <ProblemPanel problem={problem} loading={problemLoading} meta={problemMeta} />
      </div>

      {/* ── Right: Editor (dark) + Output console (white) ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">

        {/* Monaco editor — fills remaining height */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            problemId={problemId}
            language={language}
            onLangChange={onLangChange}
            code={code}
            onCodeChange={onCodeChange}
            readOnly={readOnly}
            extraActions={extraActions}
          />
        </div>

        {/* Output console — white, collapsible */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-200 bg-white border-t border-surface-200"
          style={{ height: outputOpen ? OUTPUT_HEIGHT : 40 }}
        >
          {/* Console header — toggle */}
          <div
            className="flex items-center justify-between px-4 h-10 bg-surface-50 border-b border-surface-100 cursor-pointer select-none"
            onClick={() => setOutputOpen(v => !v)}
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-surface-400">Console</span>
            {outputOpen
              ? <ChevronDown size={13} className="text-surface-400" />
              : <ChevronUp   size={13} className="text-surface-400" />
            }
          </div>

          {outputOpen && (
            <div style={{ height: OUTPUT_HEIGHT - 40 }} className="overflow-hidden">
              <OutputPanel
                problem={problem}
                onRun={onRun}
                onSubmit={onSubmit}
                submitLabel={submitLabel}
                readOnly={readOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Problem description panel (light) ─────────────────────────────────── */

function ProblemPanel({ problem, loading, meta }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400 text-sm bg-white">
        Problem not found.
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 space-y-6">

        {/* Title block */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <DiffBadge difficulty={problem.difficulty} />
            {problem.acceptanceRate !== undefined && (
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-surface-100 text-surface-400 border border-surface-200">
                {Number(problem.acceptanceRate).toFixed(1)}% accepted
              </span>
            )}
            {meta}
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">{problem.title}</h2>
        </div>

        {/* Description */}
        <div
          className="text-sm text-slate-700 leading-7 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: problem.description?.replace(/\n/g, '<br/>') ?? '',
          }}
        />

        {/* Examples */}
        {problem.examples?.length > 0 && (
          <div>
            <SectionLabel>Examples</SectionLabel>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="rounded-xl border border-surface-200 bg-surface-50 overflow-hidden">
                  <div className="px-4 py-2 bg-surface-100 border-b border-surface-200">
                    <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">Example {i + 1}</span>
                  </div>
                  <div className="px-4 py-3 font-mono text-xs space-y-1.5">
                    <div>
                      <span className="text-surface-400 font-sans font-semibold">Input: </span>
                      <span className="text-slate-800">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-surface-400 font-sans font-semibold">Output: </span>
                      <span className="text-emerald-700">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-surface-400 text-[11px] font-sans pt-1">{ex.explanation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <div>
            <SectionLabel>Constraints</SectionLabel>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {problem.constraints}
            </div>
          </div>
        )}

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div>
            <SectionLabel icon={<Tag size={10} />}>Topics</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary-50 text-primary-700 border border-primary-200 capitalize">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Limits */}
        {(problem.timeLimit || problem.memoryLimit) && (
          <div className="flex items-center gap-4 text-xs text-surface-400 font-mono">
            {problem.timeLimit   && <span className="flex items-center gap-1.5"><Clock size={11} /> {problem.timeLimit / 1000}s</span>}
            {problem.memoryLimit && <span className="flex items-center gap-1.5"><MemoryStick size={11} /> {problem.memoryLimit}MB</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ children, icon }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-surface-400 mb-3">
      {icon}{children}
    </h3>
  )
}