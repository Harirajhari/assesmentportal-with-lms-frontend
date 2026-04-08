import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchSubmissions } from '../features/submissions/submissionSlice'
import { VerdictBadge, PageLoader, EmptyState, Pagination } from '../components/ui'
import { fmtDateTime, fmtRuntime, fmtMemory } from '../utils/helpers'
import { Send, ChevronDown, ChevronUp, Copy } from 'lucide-react'

export default function SubmissionsPage() {
  const dispatch = useDispatch()
  const { list, total, loading, error } = useSelector(s => s.submissions)
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    dispatch(fetchSubmissions({ page, limit }))
  }, [dispatch, page])

  const pages = Math.ceil(total / limit) || 1

  const toggle = (id) => setExpanded(p => p === id ? null : id)

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">My Submissions</h1>
        <p className="text-surface-400 text-sm mt-0.5">{total || list.length} total submissions</p>
      </div>

      {loading ? <PageLoader /> : list.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No submissions yet"
          desc="Solve a problem and submit your code to see it here."
          action={<Link to="/practice" className="btn btn-primary">Browse Problems</Link>}
        />
      ) : (
        <>
          <div className="space-y-2">
            {list.map(sub => (
              <SubRow key={sub._id} sub={sub} expanded={expanded === sub._id} onToggle={() => toggle(sub._id)} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}
    </div>
  )
}

function SubRow({ sub, expanded, onToggle }) {
  const copy = () => navigator.clipboard.writeText(sub.code ?? '')

  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={onToggle}
      >
        {/* Verdict */}
        <div className="w-36 flex-shrink-0">
          <VerdictBadge verdict={sub.verdict ?? sub.status} />
        </div>

        {/* Problem name */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/problem/${sub.problemId?._id ?? sub.problemId}`}
            className="text-slate-800 font-semibold text-sm hover:text-primary-600 transition-colors truncate block"
            onClick={e => e.stopPropagation()}
          >
            {sub.problemId?.title ?? 'Problem'}
          </Link>
        </div>

        {/* Language */}
        <span className="hidden sm:block text-surface-400 text-xs font-mono w-24 flex-shrink-0 capitalize">
          {sub.language}
        </span>

        {/* Runtime + memory */}
        <div className="hidden md:flex gap-4 text-surface-400 text-xs font-mono w-32 flex-shrink-0">
          <span>{fmtRuntime(sub.runtime)}</span>
          <span>{fmtMemory(sub.memory)}</span>
        </div>

        {/* Time */}
        <span className="hidden lg:block text-surface-300 text-xs w-32 flex-shrink-0 text-right">
          {fmtDateTime(sub.createdAt)}
        </span>

        <span className="text-surface-300 ml-1 flex-shrink-0">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </div>

      {/* Expanded code */}
      {expanded && (
        <div className="border-t border-surface-100">
          <div className="flex items-center justify-between px-5 py-2 bg-surface-50 border-b border-surface-100">
            <span className="text-xs font-mono text-surface-400 capitalize">{sub.language}</span>
            <button onClick={copy} className="btn btn-ghost btn-sm text-xs">
              <Copy size={12} /> Copy
            </button>
          </div>
          {sub.code ? (
            <pre className="p-5 font-mono text-xs text-slate-700 overflow-x-auto max-h-72 bg-white leading-relaxed">
              {sub.code}
            </pre>
          ) : (
            <div className="p-5 text-sm text-surface-400">Code not available.</div>
          )}
        </div>
      )}
    </div>
  )
}
