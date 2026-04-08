// ── Date helpers ──────────────────────────────────────────────────────────────
export const fmtDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export const timeAgo = (d) => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days < 30 ? `${days}d ago` : fmtDate(d)
}

// ── Number helpers ────────────────────────────────────────────────────────────
export const fmtRuntime = (ms) => {
  if (ms == null) return '—'
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`
}

export const fmtMemory = (kb) => {
  if (kb == null) return '—'
  return kb < 1024 ? `${kb} KB` : `${(kb / 1024).toFixed(1)} MB`
}

// ── Leaderboard helpers ───────────────────────────────────────────────────────
export const rankLabel = (rank) => {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

// ── Verdict → display ─────────────────────────────────────────────────────────
export const VERDICT_MAP = {
  Accepted:              { label: 'Accepted',          cls: 'text-green-600  bg-green-50  border-green-200' },
  'Wrong Answer':        { label: 'Wrong Answer',       cls: 'text-red-600    bg-red-50    border-red-200'   },
  'Time Limit Exceeded': { label: 'TLE',                cls: 'text-amber-600  bg-amber-50  border-amber-200' },
  'Memory Limit Exceeded':{ label: 'MLE',               cls: 'text-orange-600 bg-orange-50 border-orange-200'},
  'Runtime Error':       { label: 'Runtime Error',      cls: 'text-rose-600   bg-rose-50   border-rose-200'  },
  'Compilation Error':   { label: 'Compile Error',      cls: 'text-pink-600   bg-pink-50   border-pink-200'  },
  Pending:               { label: 'Pending',            cls: 'text-slate-500  bg-slate-50  border-slate-200' },
}

export const getVerdict = (v) => VERDICT_MAP[v] ?? { label: v ?? '—', cls: 'text-slate-500 bg-slate-50 border-slate-200' }

// ── Difficulty ────────────────────────────────────────────────────────────────
export const DIFFICULTY_CLS = {
  Easy:   'badge-easy',
  Medium: 'badge-medium',
  Hard:   'badge-hard',
}

// ── Tags ──────────────────────────────────────────────────────────────────────
export const ALL_TAGS = [
  'array','hash-table','string','dynamic-programming','math','sorting','greedy',
  'binary-search','tree','graph','stack','queue','linked-list','two-pointers',
  'sliding-window','recursion','backtracking','bfs','dfs','bit-manipulation',
  'heap','trie','divide-and-conquer','number-theory',
]

// ── Debounce ─────────────────────────────────────────────────────────────────
export const debounce = (fn, ms = 300) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

// ── cn helper ────────────────────────────────────────────────────────────────
export const cn = (...args) => args.filter(Boolean).join(' ')
