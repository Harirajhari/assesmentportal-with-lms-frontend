import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { dismissNotif } from '../../features/ui/uiSlice'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const CFG = {
  success: { icon: CheckCircle, cls: 'bg-green-50 border-green-200 text-green-800', iCls: 'text-green-500' },
  error:   { icon: XCircle,     cls: 'bg-red-50   border-red-200   text-red-800',   iCls: 'text-red-500'   },
  warning: { icon: AlertCircle, cls: 'bg-amber-50  border-amber-200 text-amber-800', iCls: 'text-amber-500' },
  info:    { icon: Info,        cls: 'bg-blue-50   border-blue-200  text-blue-800',  iCls: 'text-blue-500'  },
}

function Toast({ n }) {
  const dispatch = useDispatch()
  const cfg = CFG[n.type] ?? CFG.info
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(() => dispatch(dismissNotif(n.id)), n.duration)
    return () => clearTimeout(t)
  }, [n.id, n.duration, dispatch])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card-md max-w-sm animate-slide-up ${cfg.cls}`}>
      <Icon size={16} className={`flex-shrink-0 mt-0.5 ${cfg.iCls}`} />
      <span className="flex-1 text-sm font-medium">{n.message}</span>
      <button onClick={() => dispatch(dismissNotif(n.id))} className="opacity-50 hover:opacity-100 flex-shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

export default function NotificationCenter() {
  const notifs = useSelector(s => s.ui.notifications)
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifs.map(n => <Toast key={n.id} n={n} />)}
    </div>
  )
}
