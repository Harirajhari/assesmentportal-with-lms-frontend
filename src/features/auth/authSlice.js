import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// Rehydrate from localStorage
const storedUser  = (() => { try { return JSON.parse(localStorage.getItem('cp_user')) } catch { return null } })()
const storedToken = localStorage.getItem('cp_access_token') || null

/* ── Thunks ── */
export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const res = await authService.login(creds)
    // Backend: { success:true, data:{ accessToken, refreshToken, user } }
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.me()
    // Backend: { success:true, data: user }
    return res.data.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load profile')
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try { await authService.logout() } catch { /* ignore */ }
})

/* ── Slice ── */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    storedUser,
    token:   storedToken,
    role:    storedUser?.role || null,
    loading: false,
    error:   null,
  },
  reducers: {
    clearError: (state) => { state.error = null },
    patchUser:  (state, { payload }) => {
      state.user = { ...state.user, ...payload }
      localStorage.setItem('cp_user', JSON.stringify(state.user))
    },
  },
  extraReducers: (b) => {
    b
      /* login */
      .addCase(login.pending,    (s) => { s.loading = true; s.error = null })
      .addCase(login.fulfilled,  (s, { payload }) => {
        s.loading = false
        s.user    = payload.user
        s.token   = payload.accessToken
        s.role    = payload.user.role
        localStorage.setItem('cp_access_token',  payload.accessToken)
        localStorage.setItem('cp_refresh_token', payload.refreshToken)
        localStorage.setItem('cp_user',          JSON.stringify(payload.user))
      })
      .addCase(login.rejected,   (s, { payload }) => { s.loading = false; s.error = payload })

      /* fetchMe */
      .addCase(fetchMe.fulfilled, (s, { payload }) => {
        s.user = payload
        s.role = payload.role
        localStorage.setItem('cp_user', JSON.stringify(payload))
      })

      /* logout */
      .addCase(logoutUser.fulfilled, (s) => {
        s.user = null; s.token = null; s.role = null
        localStorage.removeItem('cp_access_token')
        localStorage.removeItem('cp_refresh_token')
        localStorage.removeItem('cp_user')
      })
  },
})

export const { clearError, patchUser } = authSlice.actions
export default authSlice.reducer
