import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useSelector } from 'react-redux'

// Routes where the sidebar should be hidden (full-screen pages like the coding arena)
const SIDEBAR_HIDDEN_PATTERNS = [
  /^\/contests\/[^/]+$/,  // /contests/:id  (contest arena)
  /^\/problem\/[^/]+$/,   // /problem/:id   (practice solve page)
]

export default function AppLayout({ isAdmin = false }) {
  const open     = useSelector(s => s.ui.sidebarOpen)
  const location = useLocation()

  const hideSidebar = SIDEBAR_HIDDEN_PATTERNS.some(pattern => pattern.test(location.pathname))

  return (
    <div className="flex h-screen overflow-hidden">
      {!hideSidebar && <Sidebar isAdmin={isAdmin} />}

      <main
        className="flex-1 overflow-auto transition-all duration-300"
        style={!hideSidebar ? { marginLeft: open ? 240 : 64 } : undefined}
      >
        <Outlet />
      </main>
    </div>
  )
}