import { FilePlus2, RefreshCw, Layers, Clock3, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CommunityImpact from '../components/dashboard/CommunityImpact'
import EmptyState from '../components/dashboard/EmptyState'
import IssueCard from '../components/dashboard/IssueCard'
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton'
import Navbar from '../components/dashboard/Navbar'
import NotificationCard from '../components/dashboard/NotificationCard'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivity from '../components/dashboard/RecentActivity'
import Sidebar from '../components/dashboard/Sidebar'
import StatCard from '../components/dashboard/StatCard'

import api from '../lib/api'
import { clearAuth, getAuth } from '../lib/auth'

export default function CitizenDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [issues, setIssues] = useState([])
  const [notifications, setNotifications] = useState([])

  const navigate = useNavigate()
  const name = getAuth()?.account?.name || 'Citizen'
  const signOut = () => { clearAuth(); navigate('/auth') }

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) setMobileMenuOpen((isOpen) => !isOpen)
    else setSidebarExpanded((isExpanded) => !isExpanded)
  }

  // Fetch citizen data from MongoDB
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    else setIsSyncing(true)

    try {
      // 1. Fetch citizen's issues from MongoDB
      try {
        const issuesRes = await api.get('/issues/mine')
        if (Array.isArray(issuesRes.data)) {
          setIssues(issuesRes.data)
        } else {
          setIssues([])
        }
      } catch (err) {
        console.warn('Could not fetch issues/mine from MongoDB:', err.message)
        setIssues([])
      }

      // 2. Fetch citizen's notifications from MongoDB
      try {
        const notifRes = await api.get('/issues/notifications/me')
        if (Array.isArray(notifRes.data)) {
          setNotifications(notifRes.data)
        }
      } catch (err) {
        console.warn('Could not fetch notifications/me from MongoDB:', err.message)
      }
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Cross-role polling: syncs every 12s and on window focus
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true)
      }
    }, 12000)

    const onFocus = () => fetchData(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchData])

  // Compute live stats from backend issues
  const stats = useMemo(() => {
    const total = issues.length
    const pending = issues.filter((i) => ['Pending', 'Complaint Submitted'].includes(i.status)).length
    const inProgress = issues.filter((i) =>
      ['Assigned to Department', 'Engineer Assigned', 'Inspection Scheduled', 'Work Started', 'In Progress', 'Assigned'].includes(i.status)
    ).length
    const verification = issues.filter((i) =>
      ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(i.status)
    ).length
    const resolved = issues.filter((i) => ['Resolved', 'Completed'].includes(i.status)).length

    return [
      {
        label: 'Total Reported',
        value: total,
        detail: total === 1 ? '1 issue filed' : `${total} issues filed`,
        tone: 'blue',
      },
      {
        label: 'Under Action',
        value: inProgress,
        detail: inProgress === 1 ? '1 in progress' : `${inProgress} in progress`,
        tone: 'slate',
      },
      {
        label: 'Verification Pending',
        value: verification,
        detail: verification ? 'Confirmation needed' : 'All clear',
        tone: verification ? 'amber' : 'slate',
      },
      {
        label: 'Resolved Issues',
        value: resolved,
        detail: resolved === 1 ? '1 issue resolved' : `${resolved} resolved`,
        tone: 'green',
      },
    ]
  }, [issues])

  // Formatted active issues list
  const activeIssues = useMemo(() => {
    return issues.filter((i) => !['Resolved', 'Completed'].includes(i.status)).slice(0, 5)
  }, [issues])

  // Formatted notifications
  const formattedNotifications = useMemo(() => {
    if (notifications.length > 0) {
      return notifications.slice(0, 4).map((n) => ({
        title: n.type || 'Notification',
        desc: n.message,
        time: new Date(n.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        tone: n.type === 'Verification Requested' ? 'amber' : n.type === 'Issue Resolved' ? 'green' : 'blue',
      }))
    }
    return [
      {
        title: 'Welcome to NGP Civics',
        desc: 'Submit civic issues in your area for municipal review and tracking.',
        time: 'Just now',
        tone: 'blue',
      },
    ]
  }, [notifications])

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
        className="flex min-w-0 flex-1 flex-col transition-[margin] duration-250 ease-in-out"
        style={{ marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72) }}
      >
        <Navbar name={name} onMenu={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {isLoading ? <LoadingSkeleton /> : (
              <>
                <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/15 sm:p-8">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-blue-400">Citizen dashboard</p>
                        {isSyncing && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <RefreshCw size={11} className="animate-spin" /> Live
                          </span>
                        )}
                      </div>
                      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        Good Evening, {name.split(' ')[0]}.
                      </h1>
                      <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                        Every report helps improve Nagpur. Track municipal work in real time.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/citizen/report')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition-transform hover:scale-[1.02]"
                    >
                      <FilePlus2 size={18} /> Report New Issue
                    </button>
                  </div>
                </section>

                <section className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Report statistics">
                  {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                  ))}
                </section>

                <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
                  <section>
                    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold tracking-tight text-white">Active issues</h2>
                        <p className="mt-1 text-sm text-slate-400">Follow every step from submission to resolution.</p>
                      </div>
                      <button
                        onClick={() => navigate('/citizen/issues')}
                        className="text-sm font-semibold text-blue-400 hover:underline"
                      >
                        View all ({issues.length})
                      </button>
                    </div>
                    {activeIssues.length ? (
                      <div className="space-y-5">
                        {activeIssues.map((issue) => (
                          <div
                            key={issue._id || issue.id}
                            onClick={() => navigate(`/issues/${issue._id || issue.id}`)}
                            className="cursor-pointer"
                          >
                            <IssueCard
                              issue={{
                                ...issue,
                                id: issue._id || issue.id,
                                category: typeof issue.category === 'object' ? issue.category?.name : issue.category,
                                area: issue.area || issue.location?.address || 'Nagpur',
                                department: issue.department || 'NMC Department',
                                reportedDate: issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recent'),
                                currentStage: issue.adminRemarks || 'Work in progress by NMC authority.',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState onAction={() => navigate('/citizen/report')} />
                    )}
                  </section>

                  <aside className="space-y-5">
                    <section className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/10">
                      <div className="mb-5 flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-white">Notifications</p>
                          <p className="mt-1 text-sm text-slate-400">Your latest updates</p>
                        </div>
                        <button
                          onClick={() => navigate('/citizen/notifications')}
                          className="text-sm font-semibold text-blue-400 hover:underline"
                        >
                          View all
                        </button>
                      </div>
                      <div className="space-y-3">
                        {formattedNotifications.map((notification, idx) => (
                          <NotificationCard key={idx} notification={notification} />
                        ))}
                      </div>
                    </section>
                    <QuickActions />
                    <CommunityImpact
                      impact={{
                        resolved: stats.find((s) => s.label === 'Resolved Issues')?.value || 0,
                        areas: 14,
                        efficiency: '92%',
                      }}
                    />
                  </aside>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}