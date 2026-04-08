import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProblems, createProblem, updateProblem, deleteProblem, setFilters } from '../../features/problems/problemSlice'
import { useNotify } from '../../hooks'
import { DiffBadge, PageLoader, EmptyState, Modal, ConfirmModal, PageHeader, Pagination } from '../../components/ui'
import { Plus, Pencil, Trash2, Search, FileText, X } from 'lucide-react'
import { ALL_TAGS } from '../../utils/helpers'

const BLANK = {
  title: '', description: '', difficulty: 'Easy', tags: [],
  examples: [{ input: '', output: '', explanation: '' }],
  constraints: '', timeLimit: 2000, memoryLimit: 256,
  testCases: { sample: [], hidden: [] },
  starterCode: {},
}

export default function AdminProblems() {
  const dispatch = useDispatch()
  const notify   = useNotify()
  const { list, loading, filters, page, pages, total } = useSelector(s => s.problems)

  const [formOpen,    setFormOpen]    = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [delTarget,   setDelTarget]   = useState(null)
  const [form,        setForm]        = useState(BLANK)
  const [saving,      setSaving]      = useState(false)
  const [searchVal,   setSearchVal]   = useState('')

  useEffect(() => {
    dispatch(fetchProblems({ page, limit: 20, difficulty: filters.difficulty || undefined, search: filters.search || undefined }))
  }, [dispatch, page, filters])

  const openCreate = () => { setEditing(null); setForm(BLANK); setFormOpen(true) }
  const openEdit   = (p) => {
    setEditing(p)
    setForm({
      title:        p.title        ?? '',
      description:  p.description  ?? '',
      difficulty:   p.difficulty   ?? 'Easy',
      tags:         p.tags         ?? [],
      examples:     p.examples?.length ? p.examples : BLANK.examples,
      constraints:  p.constraints  ?? '',
      timeLimit:    p.timeLimit    ?? 2000,
      memoryLimit:  p.memoryLimit  ?? 256,
      testCases:    p.testCases    ?? { sample: [], hidden: [] },
      starterCode:  p.starterCode  ?? {},
    })
    setFormOpen(true)
  }

  const confirmDelete = (p) => { setDelTarget(p); setDeleteOpen(true) }

  const handleDelete = async () => {
    try {
      await dispatch(deleteProblem(delTarget._id)).unwrap()
      notify.success('Problem deleted')
    } catch (e) { notify.error(e ?? 'Delete failed') }
    setDeleteOpen(false)
    setDelTarget(null)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const fNum = (k) => (e) => setForm(p => ({ ...p, [k]: Number(e.target.value) }))

  const toggleTag = (tag) => setForm(p => ({
    ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag]
  }))

  const setEx = (i, k, v) => setForm(p => ({
    ...p, examples: p.examples.map((ex, j) => j === i ? { ...ex, [k]: v } : ex)
  }))
  const addEx  = () => setForm(p => ({ ...p, examples: [...p.examples, { input: '', output: '', explanation: '' }] }))
  const remEx  = (i) => setForm(p => ({ ...p, examples: p.examples.filter((_, j) => j !== i) }))

  const handleSave = async () => {
    if (!form.title.trim())       return notify.warn('Title is required')
    if (!form.description.trim()) return notify.warn('Description is required')
    setSaving(true)
    try {
      if (editing) {
        await dispatch(updateProblem({ id: editing._id, body: form })).unwrap()
        notify.success('Problem updated!')
      } else {
        await dispatch(createProblem(form)).unwrap()
        notify.success('Problem created!')
      }
      setFormOpen(false)
    } catch (e) { notify.error(typeof e === 'string' ? e : 'Save failed') }
    finally { setSaving(false) }
  }

  const handleSearch = useCallback((e) => {
    const v = e.target.value
    setSearchVal(v)
    const timer = setTimeout(() => dispatch(setFilters({ search: v })), 400)
    return () => clearTimeout(timer)
  }, [dispatch])

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        title="Problems"
        subtitle={`${total} total`}
        actions={
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={15} /> New Problem
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={searchVal} onChange={handleSearch} placeholder="Search…" className="input pl-8" />
        </div>
        <select value={filters.difficulty} onChange={e => dispatch(setFilters({ difficulty: e.target.value }))} className="select w-44">
          <option value="">All difficulties</option>
          {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
        </select>
        {(filters.difficulty || filters.search) && (
          <button onClick={() => { dispatch(setFilters({ difficulty:'', search:'' })); setSearchVal('') }} className="btn btn-ghost btn-sm text-red-500">
            <X size={13}/> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : list.length === 0 ? (
        <EmptyState icon={FileText} title="No problems yet" action={<button onClick={openCreate} className="btn btn-primary"><Plus size={14}/>Create Problem</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Title</th>
                <th className="w-28">Difficulty</th>
                <th className="hidden md:table-cell">Topics</th>
                <th className="hidden lg:table-cell w-24">Acceptance</th>
                <th className="w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p._id}>
                  <td className="font-semibold text-slate-800 max-w-xs truncate">{p.title}</td>
                  <td><DiffBadge difficulty={p.difficulty} /></td>
                  <td className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0,3).map(t => <span key={t} className="tag capitalize text-xs">{t}</span>)}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell text-surface-400 text-xs font-mono">
                    {p.acceptanceRate != null ? `${Number(p.acceptanceRate).toFixed(1)}%` : '—'}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(p)} className="btn btn-ghost btn-sm p-1.5"><Pencil size={13}/></button>
                      <button onClick={() => confirmDelete(p)} className="btn btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={p => dispatch({ type: 'problems/setPage', payload: p })} />

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Problem"
        message={`Delete "${delTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />

      {/* Create / Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Problem' : 'New Problem'} size="xl">
        <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input className="input" value={form.title} onChange={f('title')} placeholder="Two Sum" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
              <select className="select" value={form.difficulty} onChange={f('difficulty')}>
                {['Easy','Medium','Hard'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (ms)</label>
              <input type="number" className="input" value={form.timeLimit} onChange={fNum('timeLimit')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Memory (MB)</label>
              <input type="number" className="input" value={form.memoryLimit} onChange={fNum('memoryLimit')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea className="input font-mono text-sm h-28 resize-y" value={form.description} onChange={f('description')} placeholder="Problem statement…" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Constraints</label>
            <textarea className="input font-mono text-sm h-20 resize-y" value={form.constraints} onChange={f('constraints')} placeholder="1 ≤ n ≤ 10^5" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Topics</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map(t => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all capitalize font-medium
                    ${form.tags.includes(t)
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-surface-50 border-surface-200 text-surface-500 hover:border-primary-200 hover:text-primary-600'
                    }`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Examples</label>
              <button type="button" onClick={addEx} className="btn btn-ghost btn-sm text-primary-600"><Plus size={12}/> Add</button>
            </div>
            {form.examples.map((ex, i) => (
              <div key={i} className="border border-surface-200 rounded-xl p-3 mb-2 space-y-2 bg-surface-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-surface-400">Case {i+1}</span>
                  {form.examples.length > 1 && (
                    <button type="button" onClick={() => remEx(i)} className="text-red-400 hover:text-red-600"><X size={13}/></button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-surface-400 mb-0.5 block">Input</label>
                    <textarea className="input text-xs font-mono h-14 resize-none" value={ex.input}
                      onChange={e => setEx(i,'input',e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-surface-400 mb-0.5 block">Output</label>
                    <textarea className="input text-xs font-mono h-14 resize-none" value={ex.output}
                      onChange={e => setEx(i,'output',e.target.value)} />
                  </div>
                </div>
                <input className="input text-xs" value={ex.explanation} placeholder="Explanation (optional)"
                  onChange={e => setEx(i,'explanation',e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-surface-100 mt-4">
          <button onClick={() => setFormOpen(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : editing ? 'Update Problem' : 'Create Problem'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
