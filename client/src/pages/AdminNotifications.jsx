import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  HardHat,
  Info,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Wrench,
  X,
} from 'lucide-react'

import AdminSidebar from '../components/admin/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'
import SearchBar from '../components/notifications/SearchBar'

import api from '../lib/api'
import { clearAuth, getAuth, getDepartment } from '../lib/auth'

const typeIconMap = {
  'Issue Submitted': Layers,
  'Status Changed': Info,
  'Engineer Assigned': HardHat,
  'Inspection Scheduled': Calendar,
  'Work Started': Wrench,
  'Work Completed': CheckCircle2,
  'Verification Requested': ShieldCheck,
  'Issue Reopened': Clock3,
  'Issue Resolved': CheckCircle2,
}

const typeToneMap = {
  'Issue Submitted': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Status Changed': 'border-slate-800 bg-slate-900/80 text-slate-300',
  'Engineer Assigned': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Inspection Scheduled': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Work Started': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Work Completed': 'border-slate-800 bg-slate-900/80 text-slate-200',
  'Verification Requested': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Issue Reopened': 'border-blue-400/40 bg-blue-950/40 text-blue-200',
  'Issue Resolved': 'border-slate-800 bg-slate-900/80 text-slate-200',
}

export default function AdminNotifications() {
  const navigate = useNavigate()
  const auth = getAuth()
  const name = auth?.account?.name || 'Administrator'
  const department = getDepartment()

  // Sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  // Notifications data
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unread' | 'updates'

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  // Responsive mode
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // Fetch admin notifications from backend
  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    else setIsSyncing(true)

    try {
      const res = await api.get('/admin/notifications')
      if (Array.isArray(res.data)) {
        setNotifications(res.data)
      }
    } catch (err) {
      console.warn('Could not fetch notifications from /admin/notifications:', err.message)
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling (12s) + window focus
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

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let list = [...notifications]

    if (activeTab === 'unread') {
      list = list.filter((n) => !n.isRead)
    } else if (activeTab === 'updates') {
      list = list.filter((n) => ['Status Changed', 'Work Started', 'Work Completed', 'Verification Requested'].includes(n.type))
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((n) =>
        (n.message || '').toLowerCase().includes(q) ||
        (n.type || '').toLowerCase().includes(q) ||
        (typeof n.issue === 'object' && ((n.issue?.title || '').toLowerCase().includes(q) || (n.issue?.complaintId || '').toLowerCase().includes(q)))
      )
    }

    return list
  }, [notifications, activeTab, search])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.isRead).length, [notifications])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleNotificationClick = (n) => {
    const issueId = typeof n.issue === 'object' ? (n.issue?._id || n.issue?.id) : n.issue
    if (issueId) {
      navigate(`/admin/issues/${issueId}`)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <AdminSidebar
        mobileOpen={mobileMenuOpen}
        expanded={sidebarExpanded}
        isMobile={isMobile}
        name={name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={signOut}
        roleLabel={`Admin • ${department}`}
      />

      <div
        className="flex min-w-0 flex-1 flex-col transition-[margin] duration-250 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : sidebarExpanded ? 260 : 72 }}
      >
        <Navbar
          name={name}
          onMenu={() => {
            if (isMobile) setMobileMenuOpen((o) => !o)
            else setSidebarExpanded((o) => !o)
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                    <ShieldCheck size={13} /> Authority Dispatch
                  </span>
                  {isSyncing && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <RefreshCw size={11} className="animate-spin" /> Live Syncing
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Admin Notifications
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Real-time activity logs, civic status changes, and incoming citizen complaints.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => fetchNotifications(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800"
                >
                  <RefreshCw size={14} /> Refresh
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'unread' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('updates')}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    activeTab === 'updates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Status Updates
                </button>
              </div>

              <div className="w-full sm:max-w-xs">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Filter notifications..."
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="mt-6 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 w-full animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
                  <Bell size={32} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-200">No notifications found</p>
                  <p className="mt-1 text-xs text-slate-500">You're all caught up with municipal activity.</p>
                </div>
              ) : (
                filteredNotifications.map((notification, idx) => {
                  const Icon = typeIconMap[notification.type] || Info
                  const tone = typeToneMap[notification.type] || 'border-slate-700 bg-slate-800/60 text-slate-300'
                  const issueId = typeof notification.issue === 'object' ? (notification.issue?._id || notification.issue?.id) : notification.issue

                  return (
                    <motion.div
                      key={notification._id || idx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition-all hover:border-slate-600/80 hover:bg-slate-900 ${
                        notification.isRead
                          ? 'border-slate-800/80 bg-slate-950/40'
                          : 'border-blue-500/30 bg-blue-950/20'
                      }`}
                    >
                      <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${tone}`}>
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                            {notification.type}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {new Date(notification.createdAt || Date.now()).toLocaleString()}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium leading-relaxed text-slate-200">
                          {notification.message}
                        </p>

                        {notification.issue && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            {typeof notification.issue === 'object' && notification.issue.title && (
                              <span className="truncate font-semibold text-slate-300">
                                {notification.issue.title}
                              </span>
                            )}
                            {issueId && (
                              <span className="inline-flex items-center gap-1 font-semibold text-blue-400 group-hover:underline">
                                View issue details <ExternalLink size={12} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {!notification.isRead && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
