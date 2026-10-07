import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from '../components/layout/LoadingScreen'

export default function ProtectedRoute({ children, adminOnly = false, editorOnly = false }) {
  const { session, isAdmin, canEdit, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!session) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/agenda" replace />
  if (editorOnly && !canEdit) return <Navigate to="/agenda" replace />

  return children
}
