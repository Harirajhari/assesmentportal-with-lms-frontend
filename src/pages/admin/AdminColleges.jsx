import { useEffect, useState, useCallback } from 'react'
import { useNotify } from '../../hooks'
import { PageLoader, EmptyState, Modal, ConfirmModal, PageHeader } from '../../components/ui'
import { collegeService } from '../../services/collegeService'
import { Plus, Pencil, Trash2, Search, Building2, X, Users } from 'lucide-react'
import { fmtDate } from '../../utils/helpers'

const BLANK = { name: '', code: '', city: '', state: '', email: '' }

export default function AdminColleges() {
  const notify = useNotify()
  const [colleges,   setColleges]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [formOpen,   setFormOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)
  const [form,       setForm]       = useState(BLANK)
  const [saving,     setSaving]     = useState(false)
  const [search,     setSearch]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await collegeService.getAll({ limit: 100 })
      setColleges(r.data?.data?.colleges ?? r.data?.data ?? r.data ?? [])
    } catch { notify.error('Failed to load colleges') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(BLANK); setFormOpen(true) }
  const openEdit   = (c) => { setEditing(c); setForm({ name: c.name ?? '', code: c.code ?? '', city: c.city ?? '', state: c.state ?? '', email: c.email ?? '' }); setFormOpen(true) }
  const confirmDel = (c) => { setDelTarget(c); setDeleteOpen(true) }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) return notify.warn('College name required')
    setSaving(true)
    try {
      if (editing) {
        await collegeService.update(editing._id, form)
        notify.success('College updated!')
      } else {
        await collegeService.create(form)
        notify.success('College added!')
      }
      setFormOpen(false)
      load()
    } catch (e) {
      notify.error(e?.response?.data?.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await collegeService.remove(delTarget._id)
      notify.success('College removed')
      load()
    } catch { notify.error('Delete failed') }
    setDeleteOpen(false)
    setDelTarget(null)
  }

  const filtered = colleges.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.code?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Colleges"
        subtitle={`${colleges.length} institutions`}
        actions={<button onClick={openCreate} className="btn btn-primary"><Plus size={15}/>Add College</button>}
      />

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search colleges…" className="input pl-8" />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="btn btn-ghost btn-sm text-red-500"><X size={13}/>Clear</button>
        )}
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title="No colleges yet" action={<button onClick={openCreate} className="btn btn-primary"><Plus size={14}/>Add College</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => (
            <div key={c._id} className="card p-5 hover:border-primary-200 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{c.name}</h3>
                    {c.code && <p className="text-xs font-mono text-surface-400 mt-0.5">{c.code}</p>}
                    {(c.city || c.state) && (
                      <p className="text-xs text-surface-400 mt-1">📍 {[c.city, c.state].filter(Boolean).join(', ')}</p>
                    )}
                    {c.email && <p className="text-xs text-surface-400">✉ {c.email}</p>}
                    <div className="flex items-center gap-1 mt-2 text-xs text-surface-300">
                      <Users size={11} />
                      <span>{c.studentCount ?? 0} students</span>
                      <span className="mx-1">·</span>
                      <span>Added {fmtDate(c.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="btn btn-ghost btn-sm p-1.5"><Pencil size={13}/></button>
                  <button onClick={() => confirmDel(c)} className="btn btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={13}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Remove College" message={`Remove "${delTarget?.name}"? This affects all associated students.`} confirmLabel="Remove" danger />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit College' : 'Add College'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College Name *</label>
            <input className="input" value={form.name} onChange={f('name')} placeholder="IIT Madras" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input className="input" value={form.code} onChange={f('code')} placeholder="IITM" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
              <input type="email" className="input" value={form.email} onChange={f('email')} placeholder="admin@iitm.ac.in" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input className="input" value={form.city} onChange={f('city')} placeholder="Chennai" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input className="input" value={form.state} onChange={f('state')} placeholder="Tamil Nadu" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-surface-100 mt-4">
          <button onClick={() => setFormOpen(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : editing ? 'Update College' : 'Add College'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
