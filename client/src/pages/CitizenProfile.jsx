import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

import Navbar from '../components/dashboard/Navbar'
import Sidebar from '../components/dashboard/Sidebar'
import ProfileCard from '../components/profile/ProfileCard'
import AccountInfoCard from '../components/profile/AccountInfoCard'
import ActionCard from '../components/profile/ActionCard'
import EditProfileModal from '../components/profile/EditProfileModal'
import ChangePasswordModal from '../components/profile/ChangePasswordModal'
import NotificationSettingsModal from '../components/profile/NotificationSettingsModal'
import LoadingSkeleton from '../components/profile/LoadingSkeleton'

import { getAuth, clearAuth } from '../lib/auth'

// ─── Mock data ─────────────────────────────────────────────────
const mockProfile = {
  name: 'Manthan Khotele',
  email: 'manthankhotele7@gmail.com',
  phone: '+91 9270343807',
  address: '42, Shradha Park, Nagpur, Maharashtra 440001',
  memberSince: '2024-09-15T00:00:00.000Z',
  language: 'English, Hindi, Marathi',
  image: null,
}

const mockNotificationSettings = {
  email: true,
  push: true,
  verification: true,
  status: true,
}

// ─── Page ───────────────────────────────────────────────────────

export default function CitizenProfile() {
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [profile, setProfile] = useState(null)
  const [notificationSettings, setNotificationSettings] = useState(mockNotificationSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const [activeModal, setActiveModal] = useState(null) // 'edit' | 'password' | 'notifications' | null

  const name = getAuth()?.account?.name || profile?.name || 'Citizen'
  const sidebarOffset = isMobile ? 0 : sidebarExpanded ? 260 : 72

  // ── Responsive ──────────────────────────────────────────────
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // ── Simulated load ─────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    const timer = setTimeout(() => {
      if (mounted) {
        setProfile(mockProfile)
        setIsLoading(false)
      }
    }, 800)
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const signOut = useCallback(() => {
    setIsSigningOut(true)
    setTimeout(() => {
      clearAuth()
      navigate('/auth')
    }, 300)
  }, [navigate])

  // ── Modal handlers ─────────────────────────────────────────
  const handleAction = useCallback((key) => {
    if (key === 'signout') {
      signOut()
      return
    }
    setActiveModal(key)
  }, [signOut])

  const handleEditSave = useCallback((updated) => {
    setProfile((prev) => ({ ...prev, ...updated }))
  }, [])

  const handlePasswordChange = useCallback(({ currentPassword, newPassword }) => {
    // API call would go here
    console.log('Password changed')
  }, [])

  const handleNotificationSave = useCallback((settings) => {
    setNotificationSettings(settings)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        expanded={sidebarExpanded}
        isMobile={isMobile}
        name={name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={signOut}
      />

      <motion.div
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="min-w-0"
        style={{ transform: 'none' }}
      >
        <Navbar
          name={name}
          onMenu={() =>
            isMobile
              ? setMobileMenuOpen((o) => !o)
              : setSidebarExpanded((o) => !o)
          }
        />

        <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="mx-auto w-full max-w-[700px] space-y-6">
              <ProfileCard
                name={profile?.name}
                email={profile?.email}
                image={profile?.image}
              />

              <AccountInfoCard data={profile} />

              <ActionCard
                onAction={handleAction}
                isSigningOut={isSigningOut}
              />
            </div>
          )}
        </main>
      </motion.div>

      {/* Modals */}
      <EditProfileModal
        isOpen={activeModal === 'edit'}
        onClose={() => setActiveModal(null)}
        data={profile}
        onSave={handleEditSave}
      />

      <ChangePasswordModal
        isOpen={activeModal === 'password'}
        onClose={() => setActiveModal(null)}
        onSubmit={handlePasswordChange}
      />

      <NotificationSettingsModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        settings={notificationSettings}
        onSave={handleNotificationSave}
      />
    </div>
  )
}