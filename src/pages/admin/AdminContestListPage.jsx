import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchContests } from '../../features/contest/contestSlice'
import { contestService } from '../../services/contestService'
import { useNotify } from '../../hooks'
import { PageLoader, EmptyState } from '../../components/ui'
import { Plus, Pencil, Trash2, Trophy, Eye, Calendar, Clock, ChevronDown } from 'lucide-react'

const STATUSES = ['draft', 'upcoming', 'live', 'frozen', 'ended']

const STATUS_STYLE = {
  draft:    { badge: 'bg-amber-50 text-amber-600 border-amber-200',  dot: 'bg-amber-400'  },
  upcoming: { badge: 'bg-blue-50 text-blue-600 border-blue-200',     dot: 'bg-blue-400'   },
  live:     { badge: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500'  },
  frozen:   { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',     dot: 'bg-cyan-500'   },
  ended:    { badge: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400'  },
}

const STATUS_LABEL = {
  draft: 'Draft', upcoming: 'Upcoming', live: '🔴 Live', frozen: '❄️ Frozen', ended: 'Ended',
}

export default function AdminContestListPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notify   = useNotify()
  const { list, loading } = useSelector(s => s.contest)

  // Track which row's status dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null)
  const [updatingId,   setUpdatingId]   = useState(null)

  useEffect(() => { dispatch(fetchContests()) }, [dispatch])

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setOpenDropdown(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      await contestService.remove(id)
      notify.success('Contest deleted')
      dispatch(fetchContests())
    } catch {
      notify.error('Delete failed')
    }
  }

  const handleStatusChange = async (contestId, newStatus) => {
    setOpenDropdown(null)
    setUpdatingId(contestId)
    try {
      await contestService.update(contestId, { status: newStatus })
      notify.success(`Status updated to "${newStatus}"`)
      dispatch(fetchContests())
    } catch {
      notify.error('Status update failed')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Contests</h1>
          <p className="text-surface-400 text-sm mt-0.5">Create and manage coding contests</p>
        </div>
        <button onClick={() => navigate('/admin/contests/new')} className="btn btn-primary gap-2">
          <Plus size={15} /> New Contest
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    value: list.length,                                       color: 'text-slate-700'  },
          { label: 'Live',     value: list.filter(c => c.status === 'live').length,     color: 'text-green-600'  },
          { label: 'Upcoming', value: list.filter(c => c.status === 'upcoming').length, color: 'text-blue-600'   },
          { label: 'Ended',    value: list.filter(c => c.status === 'ended').length,    color: 'text-slate-400'  },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-surface-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No contests yet"
          desc="Create your first contest to get started."
          action={
            <button onClick={() => navigate('/admin/contests/new')} className="btn btn-primary gap-2">
              <Plus size={14} /> Create Contest
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Contest</th>
                <th className="hidden sm:table-cell w-36">Status</th>
                <th className="hidden md:table-cell w-28">Start</th>
                <th className="hidden md:table-cell w-20">Duration</th>
                <th className="w-20 text-center">Problems</th>
                <th className="w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => {
                const style = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft
                const isUpdating = updatingId === c._id

                return (
                  <tr key={c._id}>

                    {/* Title */}
                    <td>
                      <div className="font-semibold text-slate-800">{c.title}</div>
                      {c.description && (
                        <div className="text-xs text-surface-400 truncate max-w-xs">{c.description}</div>
                      )}
                      {c.sequentialUnlock && (
                        <span className="inline-block mt-0.5 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded px-1.5 py-0.5">
                          Sequential
                        </span>
                      )}
                    </td>

                    {/* Status — clickable dropdown */}
                    <td className="hidden sm:table-cell">
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === c._id ? null : c._id)}
                          disabled={isUpdating}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all
                            ${style.badge}
                            hover:shadow-sm hover:brightness-95 disabled:opacity-60 cursor-pointer`}
                        >
                          {isUpdating
                            ? <span className="w-2.5 h-2.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            : <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          }
                          {STATUS_LABEL[c.status] ?? c.status}
                          <ChevronDown size={11} className="opacity-60" />
                        </button>

                        {/* Dropdown */}
                        {openDropdown === c._id && (
                          <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
                            <div className="px-3 py-2 border-b border-surface-100">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Set Status</span>
                            </div>
                            {STATUSES.map(s => {
                              const st = STATUS_STYLE[s]
                              const isCurrent = s === c.status
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(c._id, s)}
                                  disabled={isCurrent}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors
                                    ${isCurrent
                                      ? 'bg-surface-50 text-surface-400 cursor-default'
                                      : 'hover:bg-surface-50 text-slate-700 cursor-pointer'}`}
                                >
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
                                  {STATUS_LABEL[s]}
                                  {isCurrent && (
                                    <span className="ml-auto text-[10px] text-surface-400 font-medium">current</span>
                                  )}
                                </button>
                              )
                            })}

                            {/* Info note */}
                            <div className="px-3 py-2 border-t border-surface-100 bg-surface-50">
                              <p className="text-[10px] text-surface-400 leading-relaxed">
                                Manually overrides auto-computed status. Students see the contest based on this.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Start time */}
                    <td className="hidden md:table-cell text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} className="text-surface-400" />
                        {new Date(c.startTime).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-surface-400">
                        {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="hidden md:table-cell text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-surface-400" />
                        {c.durationMinutes ?? Math.round((new Date(c.endTime) - new Date(c.startTime)) / 60000)} min
                      </div>
                    </td>

                    {/* Problem count */}
                    <td className="text-center font-mono font-bold text-primary-600">
                      {c.problemCount ?? c.problems?.length ?? 0}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/contests/${c._id}/leaderboard`)}
                          className="btn btn-ghost btn-sm p-1.5 text-surface-400 hover:text-primary-600"
                          title="View leaderboard"
                        >
                          <Trophy size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/contests/${c._id}`)}
                          className="btn btn-ghost btn-sm p-1.5 text-surface-400 hover:text-slate-700"
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/contests/${c._id}/edit`)}
                          className="btn btn-ghost btn-sm p-1.5 text-surface-400 hover:text-primary-600"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id, c.title)}
                          className="btn btn-ghost btn-sm p-1.5 text-surface-400 hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}