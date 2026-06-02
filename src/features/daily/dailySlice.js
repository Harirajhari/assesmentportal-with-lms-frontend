import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchDailyChallenge = createAsyncThunk(
  'daily/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/daily')
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load daily challenge')
    }
  }
)

export const submitDailyChallenge = createAsyncThunk(
  'daily/submit',
  async ({ code, language }, { rejectWithValue }) => {
    try {
      const res = await api.post('/daily/submit', { code, language })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Submission failed')
    }
  }
)

export const fetchDailyStreak = createAsyncThunk(
  'daily/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/daily/streak')
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load streak')
    }
  }
)

export const fetchDailyCalendar = createAsyncThunk(
  'daily/fetchCalendar',
  async ({ month, year } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/daily/calendar', { params: { month, year } })
      return res.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load calendar')
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const dailySlice = createSlice({
  name: 'daily',
  initialState: {
    today:      null,   // { date, problem, completed, currentStreak, longestStreak }
    streak:     null,   // { currentStreak, longestStreak, history }
    calendar:   [],     // [{ date, problem, completed }]
    result:     null,   // last submission result
    loading:    false,
    submitting: false,
    error:      null,
  },
  reducers: {
    clearDailyResult: (state) => { state.result = null },
  },
  extraReducers: (builder) => {
    // Fetch today
    builder
      .addCase(fetchDailyChallenge.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(fetchDailyChallenge.fulfilled, (s, a) => { s.loading = false; s.today = a.payload })
      .addCase(fetchDailyChallenge.rejected,  (s, a) => { s.loading = false; s.error = a.payload })

    // Submit
    builder
      .addCase(submitDailyChallenge.pending,   (s) => { s.submitting = true })
      .addCase(submitDailyChallenge.fulfilled, (s, a) => {
        s.submitting = false
        s.result = a.payload
        // Update streak in today if accepted
        if (a.payload.streak && s.today) {
          s.today.currentStreak = a.payload.streak.currentStreak
          s.today.longestStreak = a.payload.streak.longestStreak
          s.today.completed     = true
        }
      })
      .addCase(submitDailyChallenge.rejected, (s, a) => { s.submitting = false; s.error = a.payload })

    // Streak
    builder
      .addCase(fetchDailyStreak.fulfilled, (s, a) => { s.streak = a.payload })

    // Calendar
    builder
      .addCase(fetchDailyCalendar.fulfilled, (s, a) => { s.calendar = a.payload })
  },
})

export const { clearDailyResult } = dailySlice.actions
export default dailySlice.reducer