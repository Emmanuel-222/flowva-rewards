import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthPage from './pages/AuthPage'
import RewardsHub from './pages/RewardsHub'
import Layout from './components/layout/Layout'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/rewards" replace /> : <AuthPage />} 
      />
      <Route
        path="/*"
        element={
          user ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/rewards" replace />} />
                <Route path="/rewards" element={<RewardsHub />} />
                {/* Placeholder routes for sidebar navigation */}
                <Route path="/home" element={<Navigate to="/rewards" replace />} />
                <Route path="/discover" element={<Navigate to="/rewards" replace />} />
                <Route path="/library" element={<Navigate to="/rewards" replace />} />
                <Route path="/tech-stack" element={<Navigate to="/rewards" replace />} />
                <Route path="/subscriptions" element={<Navigate to="/rewards" replace />} />
                <Route path="/settings" element={<Navigate to="/rewards" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
