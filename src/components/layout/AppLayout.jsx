import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function AppLayout({ isAdmin = false }) {
  const open = useSelector(s => s.ui.sidebarOpen)
  const ml   = open ? 240 : 64

  return (
    <div className="flex h-screen bg-surface-50 overflow-hidden">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300" style={{ marginLeft: ml }}>
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
