import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchProblems, setFilters, setPage } from '../features/problems/problemSlice'
import { DiffBadge, PageLoader, EmptyState, Pagination } from '../components/ui'
import { ALL_TAGS, debounce } from '../utils/helpers'
import { Search, Filter, X, BookOpen } from 'lucide-react'

const DIFFICULTIES = ['', 'Easy', 'Medium', 'Hard']

export default function PracticePage() {
  const dispatch = useDispatch()
  const { list, loading, error, filters, page, pages, total } = useSelector(s => s.problems)
  const searchRef = useRef(null)

  // Fetch whenever filters or page change
  useEffect(() => {
    dispatch(fetchProblems({
      page,
      limit:      20,
      difficulty: filters.difficulty || undefined,
      tags:       filters.tag        || undefined,
      search:     filters.search     || undefined,
    }))
  }, [dispatch, filters, page])

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((val) => dispatch(setFilters({ search: val })), 400),
    [dispatch]
  )

  const handleSearch = (e) => {
    debouncedSearch(e.target.value)
  }

  const clearAll = () => {
    dispatch(setFilters({ difficulty: '', tag: '', search: '' }))
    if (searchRef.current) searchRef.current.value = ''
  }

  const hasFilters = filters.difficulty || filters.tag || filters.search

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Practice</h1>
        <p className="text-surface-400 text-sm mt-0.5">
          {total > 0 ? `${total} problems` : 'Browse problems'}
        </p>
      </div>

      {/* Filter bar */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            ref={searchRef}
            type="text"
            defaultValue={filters.search}
            onChange={handleSearch}
            placeholder="Search problems…"
            className="input pl-8"
          />
        </div>

        {/* Difficulty */}
        <select
          value={filters.difficulty}
          onChange={e => dispatch(setFilters({ difficulty: e.target.value }))}
          className="select w-44"
        >
          {DIFFICULTIES.map(d => (
            <option key={d} value={d}>{d || 'All difficulties'}</option>
          ))}
        </select>

        {/* Tag */}
        <select
          value={filters.tag}
          onChange={e => dispatch(setFilters({ tag: e.target.value }))}
          className="select w-44"
        >
          <option value="">All topics</option>
          {ALL_TAGS.map(t => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearAll} className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.difficulty && (
            <FilterPill label={filters.difficulty} onRemove={() => dispatch(setFilters({ difficulty: '' }))} />
          )}
          {filters.tag && (
            <FilterPill label={filters.tag} onRemove={() => dispatch(setFilters({ tag: '' }))} />
          )}
          {filters.search && (
            <FilterPill label={`"${filters.search}"`} onRemove={() => { dispatch(setFilters({ search: '' })); if (searchRef.current) searchRef.current.value = '' }} />
          )}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="card p-6 text-center text-red-600 text-sm">{error}</div>
      ) : list.length === 0 ? (
        <EmptyState icon={BookOpen} title="No problems found" desc="Try adjusting your filters." action={<button onClick={clearAll} className="btn btn-primary">Clear filters</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-12">#</th>
                <th>Title</th>
                <th className="w-28">Difficulty</th>
                <th className="hidden md:table-cell">Topics</th>
                <th className="hidden lg:table-cell w-24">Acceptance</th>
                <th className="w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p, i) => (
                <tr key={p._id}>
                  <td className="text-surface-300 font-mono text-xs">{(page - 1) * 20 + i + 1}</td>
                  <td>
                    <Link to={`/problem/${p._id}`} className="font-semibold text-slate-800 hover:text-primary-600 transition-colors">
                      {p.title}
                    </Link>
                  </td>
                  <td><DiffBadge difficulty={p.difficulty} /></td>
                  <td className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 2).map(t => <span key={t} className="tag capitalize text-xs">{t}</span>)}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell text-surface-400 text-xs font-mono">
                    {p.acceptanceRate != null ? `${Number(p.acceptanceRate).toFixed(1)}%` : '—'}
                  </td>
                  <td>
                    {p.isSolved
                      ? <span className="badge badge-easy">Solved</span>
                      : p.isAttempted
                        ? <span className="badge badge-gray">Tried</span>
                        : <span className="text-surface-300 text-xs">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={(p) => dispatch(setPage(p))} />
    </div>
  )
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900"><X size={11} /></button>
    </span>
  )
}
