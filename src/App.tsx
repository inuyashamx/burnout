import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/auth'
import LoadingScreen from './components/LoadingScreen'
import AppShell from './components/AppShell'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'

// Onboarding
import OnboardingLayout from './pages/onboarding/OnboardingLayout'
import Step1Profile from './pages/onboarding/Step1Profile'
import Step2Car from './pages/onboarding/Step2Car'
import Step3Path from './pages/onboarding/Step3Path'
import CreateClub from './pages/onboarding/CreateClub'
import JoinClub from './pages/onboarding/JoinClub'

// App pages
import Inicio from './pages/app/Inicio'
import Calendario from './pages/app/Calendario'
import MiClub from './pages/app/MiClub'
import MemberList from './pages/app/MemberList'
import CreateEvent from './pages/app/CreateEvent'
import ClubSettings from './pages/app/ClubSettings'
import Perfil from './pages/app/Perfil'
import AddCar from './pages/app/AddCar'
import Notifications from './pages/app/Notifications'
import EditProfile from './pages/app/EditProfile'
import EditCar from './pages/app/EditCar'
import UserProfile from './pages/app/UserProfile'
import EditEvent from './pages/app/EditEvent'
import EventDetail from './pages/app/EventDetail'
import Birthdays from './pages/app/Birthdays'
import MerchStore from './pages/app/MerchStore'
import AddMerchItem from './pages/app/AddMerchItem'
import MerchRequests from './pages/app/MerchRequests'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, profile, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingGuard><OnboardingLayout /></OnboardingGuard>}>
            <Route index element={<Step1Profile />} />
            <Route path="carro" element={<Step2Car />} />
            <Route path="camino" element={<Step3Path />} />
            <Route path="create-club" element={<CreateClub />} />
            <Route path="join-club" element={<JoinClub />} />
          </Route>

          {/* App (protected) */}
          <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route index element={<Inicio />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="club" element={<MiClub />} />
            <Route path="club/members" element={<MemberList />} />
            <Route path="club/create-event" element={<CreateEvent />} />
            <Route path="club/settings" element={<ClubSettings />} />
            <Route path="club/events/:eventId" element={<EventDetail />} />
            <Route path="club/events/:eventId/edit" element={<EditEvent />} />
            <Route path="club/birthdays" element={<Birthdays />} />
            <Route path="club/merch" element={<MerchStore />} />
            <Route path="club/merch/add" element={<AddMerchItem />} />
            <Route path="club/merch/requests" element={<MerchRequests />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="perfil/edit" element={<EditProfile />} />
            <Route path="perfil/add-car" element={<AddCar />} />
            <Route path="perfil/cars/:carId/edit" element={<EditCar />} />
            <Route path="perfil/notifications" element={<Notifications />} />
            <Route path="user/:userId" element={<UserProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
