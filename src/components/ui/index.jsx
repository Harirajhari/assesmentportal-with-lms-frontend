import { Loader2, AlertCircle, Inbox } from 'lucide-react'
import { DIFFICULTY_CLS, getVerdict } from '../../utils/helpers'

/* ── Spinner ── */
export function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 14, md: 20, lg: 32 }[size] ?? 20
  return <Loader2 size={sz} className={`animate-spin text-primary-500 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}

/* ── Badges ── */
export function DiffBadge({ difficulty }) {
  return <span className={DIFFICULTY_CLS[difficulty] ?? 'badge-gray'}>{difficulty ?? '—'}</span>
}

export function VerdictBadge({ verdict }) {
  const v = getVerdict(verdict)
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${v.cls}`}>
      {v.label}
    </span>
  )
}

/* ── Empty state ── */
export function EmptyState({ icon: Icon = Inbox, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-1">
        <Icon size={24} className="text-surface-400" />
      </div>
      <div className="text-slate-700 font-semibold">{title}</div>
      {desc && <div className="text-surface-400 text-sm max-w-xs">{desc}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/* ── Error banner ── */
export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
      <AlertCircle size={15} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/* ── Page header ── */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-surface-400 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}

/* ── Stat card ── */
export function StatCard({ label, value, icon: Icon, iconCls = 'text-primary-500', bgCls = 'bg-primary-50', sub }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgCls}`}>
          <Icon size={20} className={iconCls} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-900 font-mono leading-none">{value ?? '—'}</div>
        <div className="text-surface-400 text-xs mt-1">{label}</div>
        {sub && <div className="text-surface-300 text-xs">{sub}</div>}
      </div>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const maxW = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`w-full ${maxW} card-md animate-slide-up overflow-hidden`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-100 text-surface-400 hover:text-slate-700 transition-colors text-lg leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ── Confirm dialog ── */
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-5">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button onClick={onConfirm} className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

/* ── Simple table ── */
export function DataTable({ columns, rows, rowKey = '_id', onRowClick, emptyTitle = 'No data' }) {
  if (!rows?.length) return <EmptyState title={emptyTitle} />
  return (
    <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white">
      <table className="table-base">
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row[rowKey] ?? i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'cursor-pointer' : ''}>
              {columns.map(c => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Pagination ── */
export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
      <span className="text-sm text-surface-400">Page {page} of {pages}</span>
      <button className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
    </div>
  )
}
