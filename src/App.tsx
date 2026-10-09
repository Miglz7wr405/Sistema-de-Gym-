import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { Spinner } from '@/components/ui'

import Login from '@/pages/auth/Login'
import SignUp from '@/pages/auth/SignUp'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMembers from '@/pages/admin/Members'
import AdminMemberDetail from '@/pages/admin/MemberDetail'
import AdminPayments from '@/pages/admin/Payments'
import AdminAttendance from '@/pages/admin/Attendance'
import AdminPlans from '@/pages/admin/Plans'
import AdminMore from '@/pages/admin/More'

import MemberHome from '@/pages/member/Home'
import MemberMembership from '@/pages/member/Membership'
import MemberQR from '@/pages/member/QRCode'
import MemberAttendance from '@/pages/member/Attendance'
import MemberProfile from '@/pages/member/Profile'

export default function App() {
  const { session, profile, loading } = useAuth()
  const [showSignUp, setShowSignUp] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return showSignUp ? (
      <SignUp onBack={() => setShowSignUp(false)} />
    ) : (
      <Login onSignUp={() => setShowSignUp(true)} />
    )
  }

  // Sessão ativa mas perfil ainda a carregar
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const isAdmin = profile.role === 'admin'

  return (
    <AppShell>
      <Routes>
        {isAdmin ? (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/membros" element={<AdminMembers />} />
            <Route path="/membros/:id" element={<AdminMemberDetail />} />
            <Route path="/pagamentos" element={<AdminPayments />} />
            <Route path="/presencas" element={<AdminAttendance />} />
            <Route path="/planos" element={<AdminPlans />} />
            <Route path="/mais" element={<AdminMore />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<MemberHome />} />
            <Route path="/mensalidade" element={<MemberMembership />} />
            <Route path="/qr" element={<MemberQR />} />
            <Route path="/presencas" element={<MemberAttendance />} />
            <Route path="/perfil" element={<MemberProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </AppShell>
  )
}
