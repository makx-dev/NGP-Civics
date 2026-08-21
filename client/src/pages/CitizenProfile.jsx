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

import api from '../lib/api'
import { getAuth, saveAuth, clearAuth, getToken } from '../lib/auth'

const defaultNotificationSettings = {
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
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings)
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

  // ── Load authenticated user profile ─────────────────────────
  useEffect(() => {
    let mounted = true
    const auth = getAuth()
    const account = auth?.account || {}
    const userId = account.id || account.email || 'guest'

    let localSaved = null
    try {
      const raw = localStorage.getItem(`ngp_civics_profile_${userId}`)
      if (raw) localSaved = JSON.parse(raw)
    } catch {}

    const baseProfile = {
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      address: account.address || '',
      memberSince: account.createdAt || '',
      language: account.language || '',
      image: null,
      ...localSaved,
    }

    if (!baseProfile.name && account.name) baseProfile.name = account.name
    if (!baseProfile.email && account.email) baseProfile.email = account.email

    setProfile(baseProfile)

    const token = getToken()
    if (token) {
      api.get('/auth/me')
        .then(({ data }) => {
          if (mounted && data?.user) {
            const user = data.user
            setProfile((prev) => ({
              ...prev,
              name: user.name || prev?.name || '',
              email: user.email || prev?.email || '',
              phone: user.phone || prev?.phone || '',
              address: user.address || prev?.address || '',
              language: user.language || prev?.language || '',
              image: user.avatar || prev?.image || null,
              memberSince: user.createdAt || prev?.memberSince || '',
            }))

            const currAuth = getAuth()
            if (currAuth) {
              saveAuth({
                token,
                role: currAuth.role,
                account: { ...currAuth.account, ...user },
                remember: !!localStorage.getItem('ngp_civics_token'),
              })
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }

    return () => {
      mounted = false
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

  const handleEditSave = useCallback(async (updated) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated }
      const auth = getAuth()
      const userId = auth?.account?.id || auth?.account?.email || 'guest'
      try {
        localStorage.setItem(`ngp_civics_profile_${userId}`, JSON.stringify(next))
      } catch {}

      if (auth) {
        saveAuth({
          token: getToken(),
          role: auth.role,
          account: {
            ...auth.account,
            name: next.name,
            phone: next.phone,
            address: next.address,
            language: next.language,
          },
          remember: !!localStorage.getItem('ngp_civics_token'),
        })
      }
      return next
    })

    try {
      await api.patch('/auth/profile', updated)
    } catch (e) {
      console.error('Failed to sync profile to server:', e)
    }
  }, [])

  const handlePasswordChange = useCallback(async ({ currentPassword, newPassword }) => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
    } catch (e) {
      console.error('Failed to change password:', e)
    }
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