import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HardHat,
  Layers,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  AlertTriangle,
} from 'lucide-react'

import api from '../lib/api'
import { clearAuth, getAuth, getDepartment } from '../lib/auth'
import AdminSidebar from '../components/admin/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'

import SummaryPanel from '../components/admin-dashboard/SummaryPanel'
import StatsCard from '../components/admin-dashboard/StatsCard'
import PriorityQueue from '../components/admin-dashboard/PriorityQueue'
import AssignedIssues from '../components/admin-dashboard/AssignedIssues'
import LoadingSkeleton from '../components/admin-dashboard/LoadingSkeleton'

function safeDateValue(d) {
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : 0
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const auth = getAuth()
  const name = auth?.account?.name || 'Administrator'
  const department = getDepartment()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [issues, setIssues] = useState([])
  const [analytics, setAnalytics] = useState({
    byStatus: [],
    byCategory: [],
    resolutionTrends: [],
  })

  const [activeFilter, setActiveFilter] = useState({
    type: 'All',
  })

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  // Responsive sidebar handling
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // Data fetching logic with error resilience
  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      // 1. Fetch Analytics overview
      try {
        const analyticsRes = await api.get('/admin/analytics/overview')
        if (analyticsRes?.data) {
          setAnalytics({
            byStatus: Array.isArray(analyticsRes.data.byStatus) ? analyticsRes.data.byStatus : [],
            byCategory: Array.isArray(analyticsRes.data.byCategory) ? analyticsRes.data.byCategory : [],
            resolutionTrends: Array.isArray(analyticsRes.data.resolutionTrends) ? analyticsRes.data.resolutionTrends : [],
          })
        }
      } catch (err) {
        console.warn('Could not load analytics overview:', err.message)
      }

      // 2. Fetch Issues
      try {
        const issuesRes = await api.get('/admin/issues')
        if (Array.isArray(issuesRes.data)) {
          setIssues(issuesRes.data)
        } else {
          // fallback to /issues
          const fallbackRes = await api.get('/issues')
          const list = Array.isArray(fallbackRes.data) ? fallbackRes.data : fallbackRes.data?.data
          if (Array.isArray(list)) setIssues(list)
        }
      } catch (err) {
        console.warn('Could not load admin issues:', err.message)
        setIssues([])
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling (every 12 seconds) & Window Focus refetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData(true)
      }
    }, 12000)

    const onFocus = () => {
      fetchData(true)
    }

    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchData])

  // Formatted & normalized stats
  const stats = useMemo(() => {
    const now = Date.now()
    const msDay = 24 * 60 * 60 * 1000

    // Compute from real issues array or analytics payload
    const totalCount = issues.length || analytics.byStatus.reduce((acc, curr) => acc + (curr.count || 0), 0)

    const pending = issues.filter((i) =>
      ['Pending', 'Complaint Submitted'].includes(i.status)
    ).length || (analytics.byStatus.find((s) => ['Pending', 'Complaint Submitted'].includes(s.status))?.count ?? 0)

    const inProgress = issues.filter((i) =>
      ['Assigned to Department', 'Engineer Assigned', 'Inspection Scheduled', 'Work Started', 'Inspection', 'In Progress', 'Assigned'].includes(i.status)
    ).length

    const verification = issues.filter((i) =>
      ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(i.status)
    ).length

    const resolved = issues.filter((i) =>
      ['Resolved', 'Completed'].includes(i.status)
    ).length || (analytics.byStatus.find((s) => ['Resolved', 'Completed'].includes(s.status))?.count ?? 0)

    const overdue = issues.filter((i) => {
      const est = i.estimatedResolution
      const days = typeof est === 'string' ? parseInt(est.replace(/[^0-9]/g, ''), 10) : NaN
      if (!Number.isFinite(days)) return false
      const reported = safeDateValue(i.reportedDate || i.createdAt)
      if (!reported) return false
      const deadline = reported + days * msDay
      return now > deadline && !['Completed', 'Resolved'].includes(i.status)
    }).length

    return [
      {
        key: 'total',
        label: 'Total Issues',
        value: totalCount,
        icon: Layers,
        trend: `${totalCount} registered`,
        trendDirection: 'up',
        filter: { type: 'All' },
      },
      {
        key: 'pending',
        label: 'New Submitted',
        value: pending,
        icon: ClipboardList,
        trend: pending ? `${pending} pending` : 'All assigned',
        trendDirection: pending ? 'up' : 'flat',
        filter: { type: 'Pending' },
      },
      {
        key: 'inProgress',
        label: 'In Progress',
        value: inProgress,
        icon: Clock3,
        trend: inProgress ? `${inProgress} active` : '0 active',
        trendDirection: inProgress ? 'down' : 'flat',
        filter: { type: 'In Progress' },
      },
      {
        key: 'verification',
        label: 'Verification Pending',
        value: verification,
        icon: ShieldCheck,
        trend: verification ? `${verification} awaiting` : '0 awaiting',
        trendDirection: verification ? 'up' : 'flat',
        filter: { type: 'Citizen Verification' },
      },
      {
        key: 'resolved',
        label: 'Resolved',
        value: resolved,
        icon: CheckCircle2,
        trend: resolved ? `${resolved} closed` : '0 closed',
        trendDirection: 'up',
        filter: { type: 'Resolved' },
      },
      {
        key: 'overdue',
        label: 'Overdue Work',
        value: overdue,
        icon: AlertTriangle,
        trend: overdue ? `${overdue} delayed` : '0 delayed',
        trendDirection: overdue ? 'down' : 'flat',
        filter: { type: 'Overdue' },
      },
    ]
  }, [issues, analytics])

  // Filtered issues based on stat card click
  const filteredIssues = useMemo(() => {
    const base = [...issues]
    const now = Date.now()
    const msDay = 24 * 60 * 60 * 1000

    const isOverdue = (i) => {
      const est = i.estimatedResolution
      const days = typeof est === 'string' ? parseInt(est.replace(/[^0-9]/g, ''), 10) : NaN
      if (!Number.isFinite(days)) return false
      const reported = safeDateValue(i.reportedDate || i.createdAt)
      if (!reported) return false
      const deadline = reported + days * msDay
      return now > deadline && !['Completed', 'Resolved'].includes(i.status)
    }

    const match = (i) => {
      const t = activeFilter.type
      if (t === 'All') return true
      if (t === 'Overdue') return isOverdue(i)
      if (t === 'Pending') return ['Pending', 'Complaint Submitted'].includes(i.status)
      if (t === 'In Progress') return ['Assigned to Department', 'Engineer Assigned', 'Inspection Scheduled', 'Work Started', 'Inspection', 'In Progress', 'Assigned'].includes(i.status)
      if (t === 'Citizen Verification') return ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(i.status)
      if (t === 'Resolved') return ['Resolved', 'Completed'].includes(i.status)
      return true
    }

    return base.filter(match)
  }, [issues, activeFilter])

  // Priority sorted issues
  const prioritySorted = useMemo(() => {
    const list = [...filteredIssues]
    const priorityRank = { High: 3, Medium: 2, Low: 1 }

    list.sort((a, b) => {
      const prA = priorityRank[a.priority] || 2
      const prB = priorityRank[b.priority] || 2
      if (prB !== prA) return prB - prA
      return safeDateValue(b.createdAt || b.reportedDate) - safeDateValue(a.createdAt || a.reportedDate)
    })
    return list
  }, [filteredIssues])

  // Assigned issues
  const assignedIssues = useMemo(() => {
    return issues.filter((i) =>
      i.assignedAdmin ||
      (i.category && !['Pending', 'Complaint Submitted', 'Completed', 'Resolved'].includes(i.status))
    )
  }, [issues])

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
          onSearch={(query) => {
            if (query.trim()) navigate(`/admin/issues?search=${encodeURIComponent(query)}`)
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Hero / Header Card */}
                <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/20 sm:p-8">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                          <ShieldCheck size={14} /> Municipal Operations Hub
                        </span>
                        {isRefreshing && (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <RefreshCw size={12} className="animate-spin text-blue-400" /> Syncing...
                          </span>
                        )}
                      </div>
                      <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        Welcome back, {name.split(' ')[0]}.
                      </h1>
                      <p className="mt-2 text-sm text-slate-400 sm:text-base">
                        Department: <strong className="text-slate-200">{department}</strong> • Real-time civic oversight across Nagpur.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => fetchData(false)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-900 hover:text-white"
                      >
                        <RefreshCw size={16} /> Refresh
                      </button>
                      <button
                        onClick={() => navigate('/admin/issues')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/50 transition-colors hover:bg-blue-500"
                      >
                        <ClipboardList size={16} /> Manage All Issues
                      </button>
                    </div>
                  </div>
                </section>

                {/* 6 Executive Metric Cards */}
                <section aria-label="Statistics" className="mt-6">
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {stats.map(({ key, ...s }) => {
                      const isCardActive = activeFilter.type === s.filter.type
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveFilter(s.filter)}
                          className="w-full text-left outline-none transition-transform active:scale-[0.98]"
                          aria-label={`Filter by ${s.label}`}
                        >
                          <StatsCard {...s} isActive={isCardActive} />
                        </button>
                      )
                    })}
                  </div>

                  {/* Active Filter Indicator Bar */}
                  {activeFilter.type !== 'All' && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-2.5 text-xs text-blue-300">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Filtered by:</span>
                        <span className="rounded-md bg-blue-500/20 px-2 py-0.5 font-semibold text-blue-200">
                          {stats.find((s) => s.filter.type === activeFilter.type)?.label || activeFilter.type}
                        </span>
                        <span className="text-slate-400">({filteredIssues.length} issues)</span>
                      </div>
                      <button
                        onClick={() => setActiveFilter({ type: 'All' })}
                        className="font-medium text-blue-400 hover:text-blue-200 underline"
                      >
                        Show All Issues
                      </button>
                    </div>
                  )}
                </section>

                {/* Analytics Row: Resolution Trends & Category Breakdown */}
                <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
                  {/* Resolution Trends Card */}
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Performance Metrics</p>
                        <h2 className="mt-1 text-base font-semibold text-white">Monthly Resolution Trends</h2>
                      </div>
                      <TrendingUp size={20} className="text-slate-400" />
                    </div>

                    <div className="mt-5 space-y-4">
                      {analytics.resolutionTrends.length === 0 ? (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-center text-sm text-slate-400">
                          <p>No historical resolution data available yet.</p>
                          <p className="mt-1 text-xs text-slate-500">Trends will populate as civic issues are resolved.</p>
                        </div>
                      ) : (
                        analytics.resolutionTrends.slice(-4).map((trend) => (
                          <div key={trend.month} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-white">{trend.month}</span>
                              <span className="text-xs font-mono text-slate-400">{trend.resolvedCount} Resolved</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                              <span>Avg Resolution Time</span>
                              <span className="font-mono font-medium text-blue-400">{trend.avgResolutionHours || 0} Hours</span>
                            </div>
                            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{ width: `${Math.min(100, Math.max(15, (trend.resolvedCount || 1) * 20))}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>

                  {/* Category Breakdown Card */}
                  <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Distribution</p>
                        <h2 className="mt-1 text-base font-semibold text-white">Issues by Category</h2>
                      </div>
                      <Building2 size={20} className="text-slate-400" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {analytics.byCategory.length === 0 ? (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-center text-sm text-slate-400">
                          <p>No category counts available.</p>
                        </div>
                      ) : (
                        analytics.byCategory.slice(0, 5).map((cat) => (
                          <div key={cat.category} className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/30 px-3.5 py-2.5 text-sm">
                            <span className="truncate font-medium text-slate-200">{cat.category}</span>
                            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                              {cat.count} {cat.count === 1 ? 'issue' : 'issues'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                {/* Priority Queue & Quick Action Command Panel */}
                <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
                  <section className="min-w-0 space-y-6">
                    <PriorityQueue
                      issues={prioritySorted}
                      activeFilter={activeFilter}
                      onFilter={(filter) => setActiveFilter(filter)}
                      onOpenIssue={(id) => navigate(`/admin/issues/${id}`)}
                    />

                    <AssignedIssues
                      issues={assignedIssues}
                      onOpenIssue={(id) => navigate(`/admin/issues/${id}`)}
                    />
                  </section>

                  <aside className="hidden lg:block">
                    <SummaryPanel
                      counts={{
                        Pending: stats.find((x) => x.key === 'pending')?.value ?? 0,
                        Overdue: stats.find((x) => x.key === 'overdue')?.value ?? 0,
                        CitizenVerificationPending: stats.find((x) => x.key === 'verification')?.value ?? 0,
                        ResolvedToday: stats.find((x) => x.key === 'resolved')?.value ?? 0,
                      }}
                      onQuickAction={(action) => {
                        if (action === 'ViewAllIssues') navigate('/admin/issues')
                        if (action === 'ManageDepartments') navigate('/admin/issues')
                        if (action === 'ManageUsers') navigate('/admin/issues')
                        if (action === 'GenerateReports') window.print()
                      }}
                      onSelectFilter={(filter) => setActiveFilter(filter)}
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
