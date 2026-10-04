import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { Spinner } from '@/components/ui'
import Login from '@/pages/auth/Login'

import Dashboard from '@/pages/admin/Dashboard'
import Members from '@/pages/admin/Members'
import MemberDetail from '@/pages/admin/MemberDetail'
import Payments from '@/pages/admin/Payments'
import Attendance from '@/pages/admin/Attendance'
import Plans from '@/pages/admin/Plans'
import More from '@/pages/admin/More'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/membros" element={<Members />} />
        <Route path="/membros/:id" element={<MemberDetail />} />
        <Route path="/pagamentos" element={<Payments />} />
        <Route path="/presencas" element={<Attendance />} />
        <Route path="/planos" element={<Plans />} />
        <Route path="/mais" element={<More />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
