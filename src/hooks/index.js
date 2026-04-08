import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { logoutUser } from '../features/auth/authSlice'
import { notify } from '../features/ui/uiSlice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { user, token, role, loading, error } = useSelector(s => s.auth)
  const isAdmin     = role === 'admin'
  const isStudent   = role === 'student'
  const isLoggedIn  = !!token

  const handleLogout = useCallback(() => dispatch(logoutUser()), [dispatch])

  return { user, token, role, loading, error, isAdmin, isStudent, isLoggedIn, logout: handleLogout }
}

export const useNotify = () => {
  const dispatch = useDispatch()
  return {
    success: (message) => dispatch(notify({ message, type: 'success' })),
    error:   (message) => dispatch(notify({ message, type: 'error'   })),
    info:    (message) => dispatch(notify({ message, type: 'info'    })),
    warn:    (message) => dispatch(notify({ message, type: 'warning' })),
  }
}

export const useAppSelector = useSelector
