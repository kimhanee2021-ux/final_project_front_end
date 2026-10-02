import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import HomePage from './pages/home/HomePage'
export default function App() {
  return <Routes><Route element={<DashboardLayout />}>
    <Route index element={<HomePage />} />
    <Route path="analysis" element={<HomePage view="analysis" />} />
    <Route path="library" element={<HomePage view="library" />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>
}
