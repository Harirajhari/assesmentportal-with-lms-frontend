import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { leaderboardService } from '../../services/collegeService'

export const fetchLeaderboard = createAsyncThunk('leaderboard/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await leaderboardService.get(params)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load leaderboard')
  }
})

export const fetchCollegeLeaderboard = createAsyncThunk('leaderboard/fetchCollege', async (collegeId, { rejectWithValue }) => {
  try {
    const res = await leaderboardService.getByCollege(collegeId)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load leaderboard')
  }
})

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    entries:  [],  // [{ rank, name, totalSolved, streak, score }]
    myRank:   null, // { rank, score }
    total:    0,
    loading:  false,
    error:    null,
  },
  reducers: {
    clearError: (s) => { s.error = null },
  },
  extraReducers: (b) => {
    const handle = (s, { payload }) => {
      s.loading = false
      // Backend: { data: [...], total, myRank: { rank, score } }
      if (Array.isArray(payload)) {
        s.entries = payload; s.total = payload.length
      } else {
        s.entries = payload.data    ?? []
        s.total   = payload.total   ?? 0
        s.myRank  = payload.myRank  ?? null
      }
    }
    b
      .addCase(fetchLeaderboard.pending,          (s) => { s.loading = true; s.error = null })
      .addCase(fetchLeaderboard.fulfilled,        handle)
      .addCase(fetchLeaderboard.rejected,         (s, { payload }) => { s.loading = false; s.error = payload })
      .addCase(fetchCollegeLeaderboard.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(fetchCollegeLeaderboard.fulfilled, handle)
      .addCase(fetchCollegeLeaderboard.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })
  },
})

export const { clearError } = leaderboardSlice.actions
export default leaderboardSlice.reducer
