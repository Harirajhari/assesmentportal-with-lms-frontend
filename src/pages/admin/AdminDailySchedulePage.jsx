import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDailyCalendar } from '../../features/daily/dailySlice'
import { useNotify } from '../../hooks'
import { PageLoader } from '../../components/ui'
import api from '../../services/api'
import { Flame, ChevronLeft, ChevronRight, Plus, X, Search } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function AdminDailySchedulePage() {
  const dispatch = useDispatch()
  const notify   = useNotify()
  const { calendar, loading } = useSelector(s => s.daily)

  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1) // 1-based

  // Problem picker modal
  const [pickerDate,    setPickerDate]    = useState(null)   // 'YYYY-MM-DD'
  const [searchQuery,   setSearchQuery]   = useState('')
  const [problems,      setProblems]      = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [saving,        setSaving]        = useState(false)

  useEffect(() => {
    dispatch(fetchDailyCalendar({ month, year }))
  }, [dispatch, month, year])

  // Search problems when picker opens
  useEffect(() => {
    if (!pickerDate) return
    setSearchQuery('')
    searchProblems('')
  }, [pickerDate])

  const searchProblems = async (q) => {
    setSearchLoading(true)
    try {
      const res = await api.get('/problems', { params: { search: q, limit: 20, isActive: true } })
      setProblems(res.data.data ?? [])
    } catch {
      setProblems([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    searchProblems(e.target.value)
  }

  const assignProblem = async (problemId) => {
    setSaving(true)
    try {
      await api.post('/daily/schedule', {
        schedules: [{ date: pickerDate, problemId }],
      })
      notify.success(`Problem scheduled for ${pickerDate}`)
      setPickerDate(null)
      dispatch(fetchDailyCalendar({ month, year }))
    } catch {
      notify.error('Failed to schedule problem')
    } finally {
      setSaving(false)
    }
  }

  const removeProblem = async (date, e) => {
    e.stopPropagation()
    if (!window.confirm(`Remove challenge for ${date}?`)) return
    try {
      await api.delete(`/daily/${date}`)
      notify.success('Challenge removed')
      dispatch(fetchDailyCalendar({ month, year }))
    } catch {
      notify.error('Failed to remove')
    }
  }

  // Build calendar grid
  const firstDay   = new Date(year, month - 1, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  // Build map from date string to challenge info
  const challengeMap = {}
  calendar.forEach(c => { challengeMap[c.date] = c })

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const todayStr  = today.toISOString().slice(0, 10)

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <Flame size={18} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Daily Challenge Schedule</h1>
            <p className="text-surface-400 text-sm">Click any day to assign a problem</p>
          </div>
        </div>

        {/* Scheduled count */}
        <div className="card px-4 py-2 text-center">
          <div className="text-xl font-bold text-orange-500">{calendar.length}</div>
          <div className="text-xs text-surface-400">scheduled this month</div>
        </div>
      </div>

      {/* Calendar nav */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100">
          <button onClick={prevMonth} className="btn btn-ghost btn-sm p-1.5"><ChevronLeft size={16} /></button>
          <span className="font-bold text-slate-800">{monthName}</span>
          <button onClick={nextMonth} className="btn btn-ghost btn-sm p-1.5"><ChevronRight size={16} /></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-surface-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-surface-400">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        {loading ? (
          <div className="p-8 flex justify-center"><PageLoader /></div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-surface-100 bg-surface-50/50" />

              const dateStr   = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const challenge = challengeMap[dateStr]
              const isToday   = dateStr === todayStr
              const isPast    = dateStr < todayStr

              return (
                <div
                  key={day}
                  onClick={() => setPickerDate(dateStr)}
                  className={`min-h-[80px] border-b border-r border-surface-100 p-2 cursor-pointer transition-colors relative group
                    ${isToday   ? 'bg-orange-50'     : ''}
                    ${isPast && !challenge ? 'bg-surface-50/60' : ''}
                    ${challenge ? 'hover:bg-green-50' : 'hover:bg-primary-50/40'}
                  `}
                >
                  {/* Day number */}
                  <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                    ${isToday ? 'bg-orange-500 text-white' : 'text-slate-600'}`}>
                    {day}
                  </div>

                  {/* Assigned problem */}
                  {challenge ? (
                    <div className="group/tag relative">
                      <div className={`text-[11px] rounded-md px-1.5 py-1 leading-tight font-medium truncate
                        ${isPast ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                        <DiffDot diff={challenge.problem?.difficulty} />
                        {challenge.problem?.title ?? 'Unknown'}
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={(e) => removeProblem(dateStr, e)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full hidden group-hover/tag:flex items-center justify-center hover:bg-red-600"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ) : (
                    <div className="hidden group-hover:flex items-center justify-center h-8">
                      <Plus size={14} className="text-primary-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Problem picker modal ── */}
      {pickerDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <div>
                <div className="font-bold text-slate-900">Assign Problem</div>
                <div className="text-xs text-surface-400">{formatDate(pickerDate)}</div>
              </div>
              <button onClick={() => setPickerDate(null)} className="btn btn-ghost btn-sm p-1.5">
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-surface-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search problems…"
                  className="input w-full pl-8 text-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Problem list */}
            <div className="flex-1 overflow-y-auto py-2">
              {searchLoading ? (
                <div className="flex justify-center py-8"><PageLoader /></div>
              ) : problems.length === 0 ? (
                <div className="text-center text-surface-400 text-sm py-8">No problems found</div>
              ) : (
                problems.map(p => (
                  <button
                    key={p._id}
                    onClick={() => assignProblem(p._id)}
                    disabled={saving}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 text-left transition-colors"
                  >
                    <DiffBadge diff={p.difficulty} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{p.title}</div>
                      <div className="text-xs text-surface-400 mt-0.5">
                        {p.acceptanceRate?.toFixed(1)}% accepted · {p.tags?.slice(0,2).join(', ')}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DiffDot({ diff }) {
  const colors = { Easy: 'text-green-500', Medium: 'text-amber-500', Hard: 'text-red-500' }
  return <span className={`mr-1 ${colors[diff] ?? ''}`}>●</span>
}

function DiffBadge({ diff }) {
  const styles = {
    Easy:   'bg-green-50 text-green-700 border-green-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Hard:   'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border flex-shrink-0 ${styles[diff] ?? 'bg-surface-100 text-slate-500 border-surface-200'}`}>
      {diff}
    </span>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}