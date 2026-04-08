import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { problemService } from '../../services/problemService'

/* ── Thunks ── */
export const fetchProblems = createAsyncThunk('problems/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await problemService.getAll(params)
    // Backend: { success, data: { problems:[], total, page, pages } } OR { data: [] }
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load problems')
  }
})

export const fetchProblem = createAsyncThunk('problems/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await problemService.getById(id)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load problem')
  }
})

export const createProblem = createAsyncThunk('problems/create', async (body, { rejectWithValue }) => {
  try {
    const res = await problemService.create(body)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create problem')
  }
})

export const updateProblem = createAsyncThunk('problems/update', async ({ id, body }, { rejectWithValue }) => {
  try {
    const res = await problemService.update(id, body)
    return res.data.data ?? res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update problem')
  }
})

export const deleteProblem = createAsyncThunk('problems/delete', async (id, { rejectWithValue }) => {
  try {
    await problemService.remove(id)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete problem')
  }
})

/* ── Slice ── */
const problemSlice = createSlice({
  name: 'problems',
  initialState: {
    list:     [],
    selected: null,
    total:    0,
    pages:    1,
    loading:  false,
    error:    null,
    filters: { search: '', difficulty: '', tag: '' },
    page:     1,
  },
  reducers: {
    setFilters: (s, { payload }) => { s.filters = { ...s.filters, ...payload }; s.page = 1 },
    setPage:    (s, { payload }) => { s.page = payload },
    clearSelected: (s) => { s.selected = null },
    clearError: (s) => { s.error = null },
  },
  extraReducers: (b) => {
    b
      .addCase(fetchProblems.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(fetchProblems.fulfilled, (s, { payload }) => {
        s.loading = false
        // Handle both { problems, total, pages } and plain array
        if (Array.isArray(payload)) {
          s.list = payload; s.total = payload.length; s.pages = 1
        } else {
          s.list  = payload.problems ?? []
          s.total = payload.total    ?? 0
          s.pages = payload.pages    ?? 1
        }
      })
      .addCase(fetchProblems.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(fetchProblem.pending,    (s) => { s.loading = true; s.selected = null })
      .addCase(fetchProblem.fulfilled,  (s, { payload }) => { s.loading = false; s.selected = payload })
      .addCase(fetchProblem.rejected,   (s, { payload }) => { s.loading = false; s.error = payload })

      .addCase(createProblem.fulfilled, (s, { payload }) => { s.list.unshift(payload); s.total += 1 })

      .addCase(updateProblem.fulfilled, (s, { payload }) => {
        const i = s.list.findIndex(p => p._id === payload._id)
        if (i !== -1) s.list[i] = payload
        if (s.selected?._id === payload._id) s.selected = payload
      })

      .addCase(deleteProblem.fulfilled, (s, { payload }) => {
        s.list  = s.list.filter(p => p._id !== payload)
        s.total = Math.max(0, s.total - 1)
      })
  },
})

export const { setFilters, setPage, clearSelected, clearError } = problemSlice.actions
export default problemSlice.reducer
