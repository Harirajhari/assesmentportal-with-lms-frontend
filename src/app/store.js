import { configureStore } from '@reduxjs/toolkit'
import authReducer        from '../features/auth/authSlice'
import problemReducer     from '../features/problems/problemSlice'
import submissionReducer  from '../features/submissions/submissionSlice'
import leaderboardReducer from '../features/leaderboard/leaderboardSlice'
import uiReducer          from '../features/ui/uiSlice'
import contestReducer     from '../features/contest/contestSlice'

export const store = configureStore({
  reducer: {
    auth:        authReducer,
    problems:    problemReducer,
    submissions: submissionReducer,
    leaderboard: leaderboardReducer,
    ui:          uiReducer,
    contest:     contestReducer,
  },
})

export default store