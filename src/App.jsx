import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import Login from './pages/Login'
import Agenda from './pages/Agenda'
import NuevaCita from './pages/NuevaCita'
import EditarCita from './pages/EditarCita'
import Semana from './pages/Semana'
import Historial from './pages/Historial'
import Usuarios from './pages/Usuarios'
import Presidentes from './pages/Presidentes'
import Perfil from './pages/Perfil'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nueva-cita"
        element={
          <ProtectedRoute>
            <NuevaCita />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citas/:id/editar"
        element={
          <ProtectedRoute>
            <EditarCita />
          </ProtectedRoute>
        }
      />
      <Route
        path="/semana"
        element={
          <ProtectedRoute>
            <Semana />
          </ProtectedRoute>
        }
      />
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <Historial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/presidentes"
        element={
          <ProtectedRoute adminOnly>
            <Presidentes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute adminOnly>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/agenda" replace />} />
      <Route path="*" element={<Navigate to="/agenda" replace />} />
    </Routes>
  )
}
