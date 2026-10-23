import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { AppShell } from '@/components/AppShell'
import { AdminShell } from '@/components/AdminShell'
import { Spinner } from '@/components/ui'

import PublicLanding from '@/pages/public/PublicLanding'
import Login from '@/pages/auth/Login'
import SignUp from '@/pages/auth/SignUp'

import AdminDashboard from '@/pages/admin/Dashboard'
import AdminMembers from '@/pages/admin/Members'
import AdminMemberDetail from '@/pages/admin/MemberDetail'
import AdminPayments from '@/pages/admin/Payments'
import AdminAttendance from '@/pages/admin/Attendance'
import AdminPlans from '@/pages/admin/Plans'
import AdminClasses from '@/pages/admin/Classes'
import AdminEvents from '@/pages/admin/Events'
import AdminInstructors from '@/pages/admin/Instructors'
import AdminNotices from '@/pages/admin/Notices'

import MemberHome from '@/pages/member/Home'
import MemberMembership from '@/pages/member/Membership'
import MemberQR from '@/pages/member/QRCode'
import MemberAttendance from '@/pages/member/Attendance'
import MemberClasses from '@/pages/member/Classes'
import MemberEvents from '@/pages/member/Events'
import MemberNotices from '@/pages/member/Notices'
import MemberInscription from '@/pages/member/Inscription'
import MemberProfile from '@/pages/member/Profile'

export default function App() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!session) {
    return (
      <Routes>
        <Route path="/entrar" element={<Login />} />
        <Route path="/criar-conta" element={<SignUp />} />
        <Route path="*" element={<PublicLanding />} />
      </Routes>
    )
  }

  if (!profile) {
    return <NoProfile />
  }

  if (profile.role === 'admin') {
    return (
      <AdminShell>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/membros" element={<AdminMembers />} />
          <Route path="/membros/:id" element={<AdminMemberDetail />} />
          <Route path="/mensalidades" element={<AdminPayments />} />
          <Route path="/pagamentos" element={<AdminPayments />} />
          <Route path="/presencas" element={<AdminAttendance />} />
          <Route path="/planos" element={<AdminPlans />} />
          <Route path="/aulas" element={<AdminClasses />} />
          <Route path="/eventos" element={<AdminEvents />} />
          <Route path="/instrutores" element={<AdminInstructors />} />
          <Route path="/avisos" element={<AdminNotices />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AdminShell>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MemberHome />} />
        <Route path="/aulas" element={<MemberClasses />} />
        <Route path="/eventos" element={<MemberEvents />} />
        <Route path="/avisos" element={<MemberNotices />} />
        <Route path="/inscricao" element={<MemberInscription />} />
        <Route path="/mensalidade" element={<MemberMembership />} />
        <Route path="/qr" element={<MemberQR />} />
        <Route path="/presencas" element={<MemberAttendance />} />
        <Route path="/perfil" element={<MemberProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

/** Sessao valida mas sem perfil (ex.: conta removida) — evita ecra preso. */
function NoProfile() {
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Spinner />
      <p className="text-sm text-slate-400">
        A carregar a tua conta… Se demorar, termina sessao e entra outra vez.
      </p>
      <button className="btn-ghost" onClick={signOut}>
        Terminar sessao
      </button>
    </div>
  )
}
