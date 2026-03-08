import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import SchedulePage from './pages/SchedulePage'
import StaffPage from './pages/StaffPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <SignedIn>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/schedule" replace />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </BrowserRouter>
  )
}
