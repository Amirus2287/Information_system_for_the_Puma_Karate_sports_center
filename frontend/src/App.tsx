import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Competitions from './pages/Competitions'
import Trainings from './pages/Trainings'
import Journal from './pages/Journal'
import Profile from './pages/Profile'
import ProtectedRoute from './components/auth/ProtectedRoute'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/competitions" element={<Competitions />} />
              <Route path="/trainings" element={<Trainings />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}