import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSubmissions } from '../../features/submissions/submissionSlice'
import { VerdictBadge, PageLoader, EmptyState, PageHeader, Pagination } from '../../components/ui'
import { collegeService } from '../../services/collegeService'
import { Activity, ChevronDown, ChevronUp, Copy, X, Filter } from 'lucide-react'
import { fmtDateTime, fmtRuntime, fmtMemory } from '../../utils/helpers'

const STATUSES  = ['Accepted','Wrong Answer','Time Limit Exceeded','Runtime Error','Compilation Error']
const LANGUAGES = ['javascript','python','java','cpp','c','typescript','go','rust']

export default function AdminSubmissions() {
  const dispatch = useDispatch()
  const { list, total, loading } = useSelector(s => s.submissions)

  const [page,     setPage]     = useState(1)
  const [status,   setStatus]   = useState('')
  const [lang,     setLang]     = useState('')
  const [college,  setCollege]  = useState('')
  const [colleges, setColleges] = useState([])
  const [expanded, setExpanded] = useState(null)
  const limit = 20

  useEffect(() => {
    collegeService.getAll({ limit: 100 })
      .then(r => setColleges(r.data?.data?.colleges ?? r.data?.data ?? r.data ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    dispatch(fetchSubmissions({
      page, limit,
      status:    status   || undefined,
      language:  lang     || undefined,
      collegeId: college  || undefined,
    }))
  }, [dispatch, page, status, lang, college])

  const pages    = Math.ceil(total / limit) || 1
  const hasFilter = status || lang || college

  const clearAll = () => { setStatus(''); setLang(''); setCollege(''); setPage(1) }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader title="All Submissions" subtitle={`${total || list.length} submissions`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="select w-48">
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={lang} onChange={e => { setLang(e.target.value); setPage(1) }} className="select w-40">
          <option value="">All languages</option>
          {LANGUAGES.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
        </select>
        <select value={college} onChange={e => { setCollege(e.target.value); setPage(1) }} className="select w-52">
          <option value="">All colleges</option>
          {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {hasFilter && (
          <button onClick={clearAll} className="btn btn-ghost btn-sm text-red-500"><X size={13}/>Clear</button>
        )}
      </div>

      {loading ? <PageLoader /> : list.length === 0 ? (
        <EmptyState icon={Activity} title="No submissions" desc="Submissions will appear here once students start coding." />
      ) : (
        <>
          <div className="space-y-2">
            {list.map(sub => (
              <SubRow key={sub._id} sub={sub} expanded={expanded === sub._id} onToggle={() => setExpanded(p => p === sub._id ? null : sub._id)} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onPage={setPage} />
        </>
      )}
    </div>
  )
}

function SubRow({ sub, expanded, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-surface-50 transition-colors"
        onClick={onToggle}
      >
        <div className="w-40 flex-shrink-0">
          <VerdictBadge verdict={sub.verdict ?? sub.status} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 font-semibold text-sm truncate">
            {sub.problemId?.title ?? 'Problem'}
          </div>
          <div className="text-surface-400 text-xs mt-0.5 flex items-center gap-2 flex-wrap">
            <span>{sub.userId?.name ?? sub.userId?.email ?? 'Unknown'}</span>
            {sub.userId?.college?.name && <>· <span>{sub.userId.college.name}</span></>}
          </div>
        </div>
        <span className="hidden sm:block text-surface-400 text-xs font-mono capitalize w-24 flex-shrink-0">{sub.language}</span>
        <div className="hidden md:flex gap-3 text-surface-400 text-xs font-mono w-36 flex-shrink-0">
          <span>{fmtRuntime(sub.runtime)}</span>
          <span>{fmtMemory(sub.memory)}</span>
        </div>
        <span className="hidden lg:block text-surface-300 text-xs w-32 flex-shrink-0 text-right">{fmtDateTime(sub.createdAt)}</span>
        <span className="text-surface-300 flex-shrink-0">
          {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-surface-100">
          <div className="flex items-center justify-between px-5 py-2 bg-surface-50 border-b border-surface-100">
            <div className="flex items-center gap-3 text-xs text-surface-400">
              <span className="capitalize font-mono">{sub.language}</span>
              {sub.userId?.name && <span>· {sub.userId.name}</span>}
              {sub.userId?.college?.name && <span>· {sub.userId.college.name}</span>}
            </div>
            {sub.code && (
              <button onClick={() => navigator.clipboard.writeText(sub.code)} className="btn btn-ghost btn-sm text-xs">
                <Copy size={12}/> Copy
              </button>
            )}
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
