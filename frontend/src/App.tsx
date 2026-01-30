import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Competitions from './pages/Competitions'
import CompetitionDetail from './pages/CompetitionDetail'
import Trainings from './pages/Trainings'
import Homeworks from './pages/Homeworks'
import Journal from './pages/Journal'
import Settings from './pages/Settings'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import NewsManagement from './pages/admin/NewsManagement'
import UsersManagement from './pages/admin/UsersManagement'
import GymsManagement from './pages/admin/GymsManagement'
import Groups from './pages/Groups'
import ErrorBoundary from './components/common/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1f2937',
                border: '2px solid #fee2e2',
              },
              success: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/competitions/:id" element={<CompetitionDetail />} />
                <Route path="/trainings" element={<Trainings />} />
                <Route path="/homeworks" element={<Homeworks />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/admin/news" element={<NewsManagement />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/gyms" element={<GymsManagement />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}