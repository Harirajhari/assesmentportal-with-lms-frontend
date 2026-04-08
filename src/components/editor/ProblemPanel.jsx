import { DiffBadge, Spinner } from '../ui'
import { Clock, MemoryStick, Tag } from 'lucide-react'

export default function ProblemPanel({ problem, loading }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
  if (!problem) return <div className="p-8 text-surface-400 text-center text-sm">Problem not found.</div>

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="p-6 space-y-6">
        {/* Title & meta */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <DiffBadge difficulty={problem.difficulty} />
            {problem.acceptanceRate !== undefined && (
              <span className="badge badge-gray">{Number(problem.acceptanceRate).toFixed(1)}% accepted</span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900 leading-snug">{problem.title}</h2>
        </div>

        {/* Description */}
        <div className="text-sm text-slate-700 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: problem.description?.replace(/\n/g, '<br/>') ?? '' }}
        />

        {/* Examples */}
        {problem.examples?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Examples</h3>
            <div className="space-y-3">
              {problem.examples.map((ex, i) => (
                <div key={i} className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-sm font-mono space-y-2">
                  <div><span className="text-surface-400 font-sans font-semibold text-xs">Input: </span><span className="text-slate-800">{ex.input}</span></div>
                  <div><span className="text-surface-400 font-sans font-semibold text-xs">Output: </span><span className="text-slate-800">{ex.output}</span></div>
                  {ex.explanation && <div className="text-surface-400 text-xs font-sans">{ex.explanation}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Constraints</h3>
            <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
              {problem.constraints}
            </div>
          </div>
        )}

        {/* Tags */}
        {problem.tags?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag size={11} /> Topics
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {problem.tags.map(t => <span key={t} className="tag capitalize">{t}</span>)}
            </div>
          </div>
        )}

        {/* Limits */}
        <div className="flex items-center gap-4 text-xs text-surface-400 font-mono">
          {problem.timeLimit   && <span className="flex items-center gap-1"><Clock size={11} /> {problem.timeLimit / 1000}s</span>}
          {problem.memoryLimit && <span className="flex items-center gap-1"><MemoryStick size={11} /> {problem.memoryLimit}MB</span>}
        </div>
      </div>
    </div>
  )
}
