import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NotificationCenter from './components/ui/NotificationCenter'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'
import AppLayout from './components/layout/AppLayout'

import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import ProblemSolvePage from './pages/ProblemSolvePage'
import SubmissionsPage from './pages/SubmissionsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProblems from './pages/admin/AdminProblems'
import AdminStudents from './pages/admin/AdminStudents'
import AdminColleges from './pages/admin/AdminColleges'
import AdminSubmissions from './pages/admin/AdminSubmissions'
import AdminLeaderboard from './pages/admin/AdminLeaderboard'

import ContestListPage from './pages/contest/ContestListPage'
import ContestArenaPage from './pages/contest/ContestArenaPage'
import ContestLeaderboardPage from './pages/contest/ContestLeaderboardPage'
import AdminContestListPage from './pages/admin/AdminContestListPage'
import AdminContestFormPage from './pages/admin/AdminContestFormPage'

import DailyChallengePage from './pages/DailyChallengePage'
import AdminDailySchedulePage from './pages/admin/AdminDailySchedulePage'

export default function App() {
  return (
    <BrowserRouter>
      <NotificationCenter />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/problem/:id" element={<ProblemSolvePage />} />
            <Route path="/submissions" element={<SubmissionsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/contests" element={<ContestListPage />} />
            <Route path="/contests/:id" element={<ContestArenaPage />} />
            <Route path="/contests/:id/leaderboard" element={<ContestLeaderboardPage />} />
            <Route path="/daily" element={<DailyChallengePage />} />
          </Route>
        </Route>

        {/* Admin protected */}
        <Route element={<AdminRoute />}>
          <Route element={<AppLayout isAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/problems" element={<AdminProblems />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/colleges" element={<AdminColleges />} />
            <Route path="/admin/submissions" element={<AdminSubmissions />} />
            <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />


            <Route path="/admin/contests" element={<AdminContestListPage />} />
            <Route path="/admin/contests/new" element={<AdminContestFormPage />} />
            <Route path="/admin/contests/:id/edit" element={<AdminContestFormPage />} />
            <Route path="/admin/daily" element={<AdminDailySchedulePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
