import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { executionService, submissionService } from '../../services/submissionService'

/* ── Thunks ── */
export const runCode = createAsyncThunk('submissions/run', async (body, { rejectWithValue }) => {
  try {
    const res = await executionService.run(body)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Execution failed')
  }
})

export const submitCode = createAsyncThunk('submissions/submit', async (body, { rejectWithValue }) => {
  try {
    const res = await executionService.submit(body)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Submission failed')
  }
})

export const fetchSubmissions = createAsyncThunk('submissions/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await submissionService.getAll(params)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load submissions')
  }
})

/* ── Slice ── */
const submissionSlice = createSlice({
  name: 'submissions',
  initialState: {
    list: [],
    total: 0,
    runResult: null,  // from /execute
    submitResult: null,  // from /submit
    running: false,
    submitting: false,
    loading: false,
    error: null,
    consoleTab: 'cases', // 'cases' | 'output'
  },
  reducers: {
    clearResults: (s) => { s.runResult = null; s.submitResult = null; s.error = null },
    setConsoleTab: (s, { payload }) => { s.consoleTab = payload },
    clearError: (s) => { s.error = null },
  },
  extraReducers: (b) => {
    b
      /* run */
      .addCase(runCode.pending, (s) => { s.running = true; s.runResult = null; s.error = null; s.consoleTab = 'output' })
      .addCase(runCode.fulfilled, (s, { payload }) => { s.running = false; s.runResult = payload })
      .addCase(runCode.rejected, (s, { payload }) => { s.running = false; s.error = payload })

      /* submit */
      .addCase(submitCode.pending, (s) => { s.submitting = true; s.submitResult = null; s.error = null; s.consoleTab = 'output' })
      .addCase(submitCode.fulfilled, (s, { payload }) => {
        s.submitting = false
        s.submitResult = {
          ...payload,
          verdict: payload.verdict ?? payload.overallStatus ?? payload.status,
          passedCount: payload.passedCount ?? payload.testCasesPassed,
        }
      })
      .addCase(submitCode.rejected, (s, { payload }) => { s.submitting = false; s.error = payload })

      /* fetch list */
      .addCase(fetchSubmissions.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchSubmissions.fulfilled, (s, { payload }) => {
        s.loading = false
        if (Array.isArray(payload)) {
          s.list = payload; s.total = payload.length
        } else {
          s.list = payload.submissions ?? payload.data ?? []
          s.total = payload.total ?? 0
        }
      })
      .addCase(fetchSubmissions.rejected, (s, { payload }) => { s.loading = false; s.error = payload })
  },
})

export const { clearResults, setConsoleTab, clearError } = submissionSlice.actions
export default submissionSlice.reducer
