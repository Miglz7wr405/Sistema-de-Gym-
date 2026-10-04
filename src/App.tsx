import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { Spinner } from '@/components/ui'

import Login from '@/pages/auth/Login'

import MemberHome from '@/pages/member/Home'
import MemberMembership from '@/pages/member/Membership'
import MemberQR from '@/pages/member/QRCode'
import MemberAttendance from '@/pages/member/Attendance'
import MemberProfile from '@/pages/member/Profile'
import ComingSoon from '@/pages/shared/ComingSoon'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMembers from '@/pages/admin/Members'
import AdminMemberDetail from '@/pages/admin/MemberDetail'
import AdminPayments from '@/pages/admin/Payments'
import AdminAttendance from '@/pages/admin/Attendance'
import AdminPlans from '@/pages/admin/Plans'
import AdminMore from '@/pages/admin/More'

export default function App() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) return <Login />

  const isAdmin = profile?.role === 'admin'

  return (
    <AppShell>
      <Routes>
        {isAdmin ? (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/membros" element={<AdminMembers />} />
            <Route path="/admin/membros/:id" element={<AdminMemberDetail />} />
            <Route path="/admin/pagamentos" element={<AdminPayments />} />
            <Route path="/admin/presencas" element={<AdminAttendance />} />
            <Route path="/admin/planos" element={<AdminPlans />} />
            <Route path="/admin/mais" element={<AdminMore />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<MemberHome />} />
            <Route path="/aulas" element={<ComingSoon title="Aulas" />} />
            <Route path="/presencas" element={<MemberAttendance />} />
            <Route path="/qr" element={<MemberQR />} />
            <Route path="/perfil" element={<MemberProfile />} />
            <Route path="/minha-mensalidade" element={<MemberMembership />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </AppShell>
  )
}
