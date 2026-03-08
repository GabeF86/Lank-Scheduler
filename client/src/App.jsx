import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import SchedulePage from './pages/SchedulePage'
import StaffPage from './pages/StaffPage'
import SettingsPage from './pages/SettingsPage'
import Layout from './components/Layout'
import OnboardingModal from './components/OnboardingModal'
import { staffApi } from './api/staff'
import { setAuthToken } from './api/client'

function OnboardingGate({ children }) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [checked, setChecked] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    async function check() {
      try {
        const token = await getToken()
        if (!token) return
        setAuthToken(token)
        await staffApi.me()
        setNeedsOnboarding(false)
      } catch (err) {
        if (err?.response?.status === 404) setNeedsOnboarding(true)
      } finally {
        setChecked(true)
      }
    }
    check()
  }, [isLoaded, isSignedIn])

  if (!checked) return null

  if (needsOnboarding) {
    return <OnboardingModal onComplete={() => setNeedsOnboarding(false)} />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <SignedIn>
        <OnboardingGate>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/schedule" replace />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        </OnboardingGate>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </BrowserRouter>
  )
}
