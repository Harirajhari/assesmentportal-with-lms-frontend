import { useEffect, useState, useCallback } from 'react'
import { useNotify } from '../../hooks'
import { PageLoader, EmptyState, Modal, ConfirmModal, PageHeader } from '../../components/ui'
import { studentService, collegeService } from '../../services/collegeService'
import { Plus, Pencil, Trash2, Search, Users, X, GraduationCap } from 'lucide-react'
import { fmtDate } from '../../utils/helpers'

const BLANK = { name: '', email: '', password: '', collegeId: '', rollNo: '' }

export default function AdminStudents() {
  const notify = useNotify()
  const [students,   setStudents]   = useState([])
  const [colleges,   setColleges]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [formOpen,   setFormOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [delTarget,  setDelTarget]  = useState(null)
  const [form,       setForm]       = useState(BLANK)
  const [saving,     setSaving]     = useState(false)
  const [search,     setSearch]     = useState('')
  const [college,    setCollege]    = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [s, c] = await Promise.all([
        studentService.getAll({ limit: 200 }),
        collegeService.getAll({ limit: 100 }),
      ])
      setStudents(s.data?.data?.students ?? s.data?.data ?? s.data ?? [])
      setColleges(c.data?.data?.colleges ?? c.data?.data ?? c.data ?? [])
    } catch { notify.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(BLANK); setFormOpen(true) }
  const openEdit   = (s) => { setEditing(s); setForm({ name: s.name, email: s.email, password: '', collegeId: s.collegeId ?? '', rollNo: s.rollNo ?? '' }); setFormOpen(true) }
  const confirmDel = (s) => { setDelTarget(s); setDeleteOpen(true) }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return notify.warn('Name and email required')
    if (!editing && !form.password.trim()) return notify.warn('Password required for new student')
    setSaving(true)
    try {
      if (editing) {
        const body = { name: form.name, email: form.email, collegeId: form.collegeId, rollNo: form.rollNo }
        if (form.password) body.password = form.password
        await studentService.update(editing._id, body)
        notify.success('Student updated!')
      } else {
        await studentService.create(form)
        notify.success('Student created!')
      }
      setFormOpen(false)
      load()
    } catch (e) {
      notify.error(e?.response?.data?.message ?? 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await studentService.remove(delTarget._id)
      notify.success('Student removed')
      load()
    } catch { notify.error('Delete failed') }
    setDeleteOpen(false)
    setDelTarget(null)
  }

  const collegeMap = Object.fromEntries(colleges.map(c => [c._id, c.name]))

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (
      (s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)) &&
      (!college || s.collegeId === college)
    )
  })

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        title="Students"
        subtitle={`${students.length} registered`}
        actions={<button onClick={openCreate} className="btn btn-primary"><Plus size={15}/>Add Student</button>}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" className="input pl-8" />
        </div>
        <select value={college} onChange={e => setCollege(e.target.value)} className="select w-52">
          <option value="">All colleges</option>
          {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {(search || college) && (
          <button onClick={() => { setSearch(''); setCollege('') }} className="btn btn-ghost btn-sm text-red-500"><X size={13}/>Clear</button>
        )}
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" action={<button onClick={openCreate} className="btn btn-primary"><Plus size={14}/>Add Student</button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden sm:table-cell">Email</th>
                <th className="hidden md:table-cell">College</th>
                <th className="hidden lg:table-cell w-24">Roll No</th>
                <th className="hidden lg:table-cell w-28">Joined</th>
                <th className="w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold flex-shrink-0">
                        {s.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-surface-400 text-xs font-mono">{s.email}</td>
                  <td className="hidden md:table-cell text-surface-400 text-xs">{collegeMap[s.collegeId] ?? '—'}</td>
                  <td className="hidden lg:table-cell text-surface-400 text-xs font-mono">{s.rollNo ?? '—'}</td>
                  <td className="hidden lg:table-cell text-surface-300 text-xs">{fmtDate(s.createdAt)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="btn btn-ghost btn-sm p-1.5"><Pencil size={13}/></button>
                      <button onClick={() => confirmDel(s)} className="btn btn-ghost btn-sm p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Remove Student" message={`Remove "${delTarget?.name}"?`} confirmLabel="Remove" danger />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Student' : 'Add Student'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input className="input" value={form.name} onChange={f('name')} placeholder="Rahul Kumar" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input type="email" className="input" value={form.email} onChange={f('email')} placeholder="rahul@iitm.ac.in" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {editing ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input type="password" className="input" value={form.password} onChange={f('password')} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
            <select className="select" value={form.collegeId} onChange={f('collegeId')}>
              <option value="">Select college…</option>
              {colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
            <input className="input" value={form.rollNo} onChange={f('rollNo')} placeholder="21CS001" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-surface-100 mt-4">
          <button onClick={() => setFormOpen(false)} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving…' : editing ? 'Update Student' : 'Create Student'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
