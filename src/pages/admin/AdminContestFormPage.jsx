import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchContest } from '../../features/contest/contestSlice'
import { contestService } from '../../services/contestService'
import { useNotify } from '../../hooks'
import { PageLoader } from '../../components/ui'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

const DEFAULT_FORM = {
  title:            '',
  description:      '',
  startTime:        '',
  endTime:          '',
  scope:            'all',
  allowedColleges:  [],
  freezeMinutes:    0,
  sequentialUnlock: false,
  problems:         [],   // [{ problemId, order, points }]
}

export default function AdminContestFormPage() {
  const { id }    = useParams()          // undefined = create, defined = edit
  const isEdit    = !!id
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const notify    = useNotify()

  const { current, loading } = useSelector(s => s.contest)

  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [saving,  setSaving]  = useState(false)
  const [probInput, setProbInput] = useState({ problemId: '', points: 100 })

  // Load existing contest for edit
  useEffect(() => {
    if (isEdit) dispatch(fetchContest(id))
  }, [isEdit, id, dispatch])

  useEffect(() => {
    if (isEdit && current && current._id === id) {
      const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : ''
      setForm({
        title:            current.title ?? '',
        description:      current.description ?? '',
        startTime:        fmt(current.startTime),
        endTime:          fmt(current.endTime),
        scope:            current.scope ?? 'all',
        allowedColleges:  current.allowedColleges ?? [],
        freezeMinutes:    current.freezeMinutes ?? 0,
        sequentialUnlock: current.sequentialUnlock ?? false,
        problems:         current.problems?.map(p => ({
          problemId: p.problemId?._id ?? p.problemId,
          order:     p.order,
          points:    p.points,
        })) ?? [],
      })
    }
  }, [isEdit, current, id])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const addProblem = () => {
    const pid = probInput.problemId.trim()
    if (!pid) return notify.error('Enter a Problem ID')
    if (form.problems.find(p => p.problemId === pid)) return notify.error('Already added')
    const newProb = {
      problemId: pid,
      order:     form.problems.length + 1,
      points:    Number(probInput.points) || 100,
    }
    set('problems', [...form.problems, newProb])
    setProbInput({ problemId: '', points: 100 })
  }

  const removeProb = (idx) => {
    const updated = form.problems
      .filter((_, i) => i !== idx)
      .map((p, i) => ({ ...p, order: i + 1 }))
    set('problems', updated)
  }

  const handleSubmit = async () => {
    if (!form.title.trim())       return notify.error('Title is required')
    if (!form.startTime)          return notify.error('Start time is required')
    if (!form.endTime)            return notify.error('End time is required')
    if (form.problems.length < 1) return notify.error('Add at least one problem')
    if (new Date(form.endTime) <= new Date(form.startTime))
      return notify.error('End time must be after start time')

    setSaving(true)
    try {
      if (isEdit) {
        await contestService.update(id, form)
        notify.success('Contest updated!')
      } else {
        await contestService.create(form)
        notify.success('Contest created!')
      }
      navigate('/admin/contests')
    } catch (err) {
      notify.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && loading && !current) return <PageLoader />

  return (
    <div className="p-6 max-w-3xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm p-1.5">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          {isEdit ? 'Edit Contest' : 'Create Contest'}
        </h1>
      </div>

      <div className="flex flex-col gap-5">

        {/* Basic info */}
        <FormCard title="Basic Info">
          <Field label="Title" required>
            <input
              className="input"
              placeholder="e.g. Weekly Challenge #1"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Optional description…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </Field>
        </FormCard>

        {/* Timing */}
        <FormCard title="Timing">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time" required>
              <input
                type="datetime-local"
                className="input"
                value={form.startTime}
                onChange={e => set('startTime', e.target.value)}
              />
            </Field>
            <Field label="End Time" required>
              <input
                type="datetime-local"
                className="input"
                value={form.endTime}
                onChange={e => set('endTime', e.target.value)}
              />
            </Field>
          </div>
          <Field label="Freeze leaderboard (minutes before end)" hint="0 = never freeze">
            <input
              type="number"
              className="input w-32"
              min={0}
              max={120}
              value={form.freezeMinutes}
              onChange={e => set('freezeMinutes', Number(e.target.value))}
            />
          </Field>
        </FormCard>

        {/* Settings */}
        <FormCard title="Settings">
          <Field label="Scope">
            <select className="input w-48" value={form.scope} onChange={e => set('scope', e.target.value)}>
              <option value="all">All colleges</option>
              <option value="college">Specific colleges only</option>
            </select>
          </Field>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-primary-600"
              checked={form.sequentialUnlock}
              onChange={e => set('sequentialUnlock', e.target.checked)}
            />
            <div>
              <div className="text-sm font-medium text-slate-800">Sequential unlock</div>
              <div className="text-xs text-surface-400">Students must solve problems in order</div>
            </div>
          </label>
        </FormCard>

        {/* Problems */}
        <FormCard title="Problems">
          {form.problems.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {form.problems.map((p, i) => (
                <div key={i} className="flex items-center gap-3 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {p.order}
                  </span>
                  <code className="text-xs text-slate-600 flex-1 truncate">{p.problemId}</code>
                  <span className="text-xs text-primary-600 font-semibold">{p.points}pts</span>
                  <button onClick={() => removeProb(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add problem row */}
          <div className="flex gap-2 items-end">
            <Field label="Problem ID" className="flex-1">
              <input
                className="input font-mono text-sm"
                placeholder="64abc123def456…"
                value={probInput.problemId}
                onChange={e => setProbInput(p => ({ ...p, problemId: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addProblem()}
              />
            </Field>
            <Field label="Points" className="w-24">
              <input
                type="number"
                className="input"
                min={10}
                max={1000}
                value={probInput.points}
                onChange={e => setProbInput(p => ({ ...p, points: e.target.value }))}
              />
            </Field>
            <button onClick={addProblem} className="btn btn-secondary btn-sm mb-0.5">
              <Plus size={14} /> Add
            </button>
          </div>
          <p className="text-xs text-surface-400 mt-2">
            Paste the MongoDB <code>_id</code> of each problem. Problems are displayed in order added.
          </p>
        </FormCard>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="btn btn-primary gap-2">
            <Save size={14} />
            {saving ? 'Saving…' : isEdit ? 'Update Contest' : 'Create Contest'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormCard({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function Field({ label, required, hint, className, children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-surface-400 mt-1">{hint}</p>}
    </div>
  )
}