import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { contestService } from '../../services/contestService'

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchContests = createAsyncThunk('contest/list', async (params, { rejectWithValue }) => {
  try {
    const res = await contestService.list(params)
    return res.data.data ?? res.data
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load contests') }
})

export const fetchContest = createAsyncThunk('contest/get', async (id, { rejectWithValue }) => {
  try {
    const res = await contestService.get(id)
    return res.data.data ?? res.data
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to load contest') }
})

export const joinContest = createAsyncThunk('contest/join', async (id, { rejectWithValue }) => {
  try {
    await contestService.join(id)
    return id
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to join') }
})

export const submitContestSolution = createAsyncThunk(
  'contest/submit',
  async ({ contestId, problemOrder, code, language, autoSubmitted }, { rejectWithValue }) => {
    try {
      const res = await contestService.submit(contestId, problemOrder, { code, language, autoSubmitted })
      return res.data.data ?? res.data
    } catch (err) { return rejectWithValue(err.response?.data?.message || 'Submission failed') }
  }
)

export const fetchContestLeaderboard = createAsyncThunk('contest/leaderboard', async (id, { rejectWithValue }) => {
  try {
    const res = await contestService.leaderboard(id)
    return res.data.data ?? res.data
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed') }
})

// ── Slice ─────────────────────────────────────────────────────────────────────
const contestSlice = createSlice({
  name: 'contest',
  initialState: {
    list:        [],
    current:     null,   // full contest detail
    leaderboard: null,   // { contest, leaderboard[] }
    lastResult:  null,   // last submission result
    loading:     false,
    submitting:  false,
    error:       null,
  },
  reducers: {
    clearError:  (s) => { s.error = null },
    clearResult: (s) => { s.lastResult = null },
    // Called by Socket.io listener to push live leaderboard updates
    setLiveLeaderboard: (s, { payload }) => {
      if (s.leaderboard) {
        s.leaderboard.leaderboard = payload.leaderboard
      } else {
        s.leaderboard = payload
      }
    },
    // Update myStats inside current contest after a solve
    updateMyStats: (s, { payload }) => {
      if (s.current) s.current.myStats = payload
    },
  },
  extraReducers: (b) => {
    b
      // list
      .addCase(fetchContests.pending,  (s) => { s.loading = true; s.error = null })
      .addCase(fetchContests.fulfilled,(s, { payload }) => {
        s.loading = false
        s.list = Array.isArray(payload) ? payload : (payload.data ?? [])
      })
      .addCase(fetchContests.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

      // get one
      .addCase(fetchContest.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(fetchContest.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload })
      .addCase(fetchContest.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

      // join (optimistic: nothing to update)
      .addCase(joinContest.rejected,   (s, { payload }) => { s.error = payload })

      // submit
      .addCase(submitContestSolution.pending,   (s) => { s.submitting = true; s.error = null; s.lastResult = null })
      .addCase(submitContestSolution.fulfilled, (s, { payload }) => {
        s.submitting = false
        s.lastResult = payload
      })
      .addCase(submitContestSolution.rejected,  (s, { payload }) => { s.submitting = false; s.error = payload })

      // leaderboard
      .addCase(fetchContestLeaderboard.pending,   (s) => { s.loading = true })
      .addCase(fetchContestLeaderboard.fulfilled, (s, { payload }) => { s.loading = false; s.leaderboard = payload })
      .addCase(fetchContestLeaderboard.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
  },
})

export const { clearError, clearResult, setLiveLeaderboard, updateMyStats } = contestSlice.actions
export default contestSlice.reducer