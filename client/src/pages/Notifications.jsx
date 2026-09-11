import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

import Navbar from '../components/dashboard/Navbar'
import Sidebar from '../components/dashboard/Sidebar'
import FilterBar from '../components/notifications/FilterBar'
import SearchBar from '../components/notifications/SearchBar'
import NotificationGroup from '../components/notifications/NotificationGroup'
import SummaryPanel from '../components/notifications/SummaryPanel'
import EmptyState from '../components/notifications/EmptyState'
import LoadingSkeleton from '../components/notifications/LoadingSkeleton'

import { getAuth, clearAuth } from '../lib/auth'
import api from '../lib/api'

// ─── Helpers ────────────────────────────────────────────────────

function getGroupKey(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d

  // Same calendar day
  if (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return 'Today'
  }

  // Yesterday
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday'
  }

  // This week (within 7 days)
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  if (d > weekAgo) return 'This Week'

  return 'Older'
}

function groupByTime(notifications) {
  const order = ['Today', 'Yesterday', 'This Week', 'Older']
  const groups = {}
  notifications.forEach((n) => {
    const key = getGroupKey(n.createdAt)
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })
  // Sort groups by the order above
  const result = []
  order.forEach((key) => {
    if (groups[key] && groups[key].length > 0) {
      result.push({ label: key, items: groups[key] })
    }
  })
  return result
}

function applyFilter(notifications, filter, search) {
  let filtered = notifications

  if (filter !== 'all') {
    const filterMap = {
      unread: (n) => !n.isRead,
      updates: (n) => ['Status Changed', 'Work Started', 'Inspection Scheduled'].includes(n.type),
      verification: (n) => n.type === 'Verification Requested',
      resolved: (n) => n.type === 'Issue Resolved',
      reopened: (n) => n.type === 'Issue Reopened',
      rejected: (n) => n.type === 'Issue Rejected',
      department: (n) =>
        ['Engineer Assigned', 'Issue Submitted', 'Work Completed', 'Work Started'].includes(n.type),
    }
    const fn = filterMap[filter]
    if (fn) filtered = filtered.filter(fn)
  }

  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        (n.issue?.complaintId || '').toLowerCase().includes(q) ||
        (n.issue?.title || '').toLowerCase().includes(q) ||
        (n.issue?.department || '').toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q),
    )
  }

  return filtered
}

// ─── Page ───────────────────────────────────────────────────────

export default function Notifications() {
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const name = getAuth()?.account?.name || 'Citizen'
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

  // ── Real-time notifications fetch with live polling ────────
  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    try {
      const res = await api.get('/issues/notifications/me')
      if (Array.isArray(res.data)) {
        setNotifications(res.data)
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.warn('Could not load live notifications:', err.message)
      setNotifications([])
    } finally {
      if (!isBackground) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling every 12s & window focus refetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true)
      }
    }, 12000)

    const onFocus = () => fetchNotifications(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchNotifications])

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  // ── Filter counts ──────────────────────────────────────────
  const counts = useMemo(() => {
    const c = {}
    c.all = notifications.length
    c.unread = notifications.filter((n) => !n.isRead).length
    c.updates = notifications.filter((n) =>
      ['Status Changed', 'Work Started', 'Inspection Scheduled'].includes(n.type),
    ).length
    c.verification = notifications.filter((n) => n.type === 'Verification Requested').length
    c.resolved = notifications.filter((n) => n.type === 'Issue Resolved').length
    c.reopened = notifications.filter((n) => n.type === 'Issue Reopened').length
    c.rejected = notifications.filter((n) => n.type === 'Issue Rejected').length
    c.department = notifications.filter((n) =>
      ['Engineer Assigned', 'Issue Submitted', 'Work Completed', 'Work Started'].includes(n.type),
    ).length
    return c
  }, [notifications])

  // ── Apply filters & search ────────────────────────────────
  const visible = useMemo(
    () => applyFilter(notifications, activeFilter, searchQuery),
    [notifications, activeFilter, searchQuery],
  )

  const groups = useMemo(() => groupByTime(visible), [visible])

  // ── Summary stats ──────────────────────────────────────────
  const summary = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return {
      unreadCount: notifications.filter((n) => !n.isRead).length,
      todayCount: notifications.filter((n) => new Date(n.createdAt) >= todayStart).length,
      verificationPending: notifications.filter((n) => n.type === 'Verification Requested' && !n.isRead).length,
      resolvedToday: notifications.filter(
        (n) => n.type === 'Issue Resolved' && new Date(n.createdAt) >= todayStart,
      ).length,
    }
  }, [notifications])

  // ── Actions ────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    try {
      await api.patch('/issues/notifications/read-all')
    } catch (e) {
      console.warn('Failed to sync mark all read:', e.message)
    }
  }, [])

  const handleRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    )
    try {
      await api.patch(`/issues/notifications/${id}/read`)
    } catch (e) {
      console.warn('Failed to sync mark read:', e.message)
    }
  }, [])

  const handleSettings = useCallback(() => {
    navigate('/citizen/settings')
  }, [navigate])

  const hasFilters = activeFilter !== 'all' || searchQuery.length > 0

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        expanded={sidebarExpanded}
        isMobile={isMobile}
        name={name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={signOut}
      />

      <div
        className="flex min-w-0 flex-1 flex-col"
        style={{ marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72) }}
      >
        <Navbar
          name={name}
          onMenu={() =>
            isMobile
              ? setMobileMenuOpen((o) => !o)
              : setSidebarExpanded((o) => !o)
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            {/* ── Feed ────────────────────────────────────────── */}
            <div className="min-w-0">
              {/* Filter bar */}
              <div className="mb-4">
                <FilterBar active={activeFilter} counts={counts} onChange={setActiveFilter} />
              </div>

              {/* Search */}
              <div className="mb-6">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                />
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <LoadingSkeleton key="skeleton" />
                ) : groups.length === 0 ? (
                  <EmptyState key="empty" hasFilters={hasFilters} />
                ) : (
                  <motion.div
                    key="feed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {groups.map((g) => (
                      <NotificationGroup
                        key={g.label}
                        label={g.label}
                        notifications={g.items}
                        onRead={handleRead}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Summary Panel (desktop only) ─────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-[90px]">
                <SummaryPanel
                  unreadCount={summary.unreadCount}
                  todayCount={summary.todayCount}
                  verificationPending={summary.verificationPending}
                  resolvedToday={summary.resolvedToday}
                  onMarkAllRead={handleMarkAllRead}
                  onSettings={handleSettings}
                />
              </div>
            </aside>
          </div>
          </div>
        </main>
      </div>
    </div>
  )
}