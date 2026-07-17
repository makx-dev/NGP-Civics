import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Building2, Calendar, ClipboardList, Clock3, HardHat, Layers, ShieldCheck, UsersRound, X } from 'lucide-react'

import api from '../lib/api'
import { getStoredIssues } from '../lib/issuesStore'
import { clearAuth, getAuth } from '../lib/auth'
import AdminSidebar from '../components/admin/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'


import SummaryPanel from '../components/admin-dashboard/SummaryPanel'
import StatsCard from '../components/admin-dashboard/StatsCard'
import PriorityQueue from '../components/admin-dashboard/PriorityQueue'
import AssignedIssues from '../components/admin-dashboard/AssignedIssues'
import LoadingSkeleton from '../components/admin-dashboard/LoadingSkeleton'

const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1,
}

function safeDateValue(d) {
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : 0
}

export default function AdminDashboard({ role }) {
  const navigate = useNavigate()
  const name = getAuth()?.account?.name || 'Admin'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [isLoading, setIsLoading] = useState(true)
  const [issues, setIssues] = useState([])
  const [activeFilter, setActiveFilter] = useState({
    type: 'All',
  })

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  useEffect(() => {
    let mounted = true

    ;(async () => {
      setIsLoading(true)
      try {
        const stored = getStoredIssues()
        if (stored?.length) {
          if (!mounted) return
          setIssues(stored)
        }

        // Best-effort API fetch (UI works with stored data too)
        try {
          const res = await api.get('/issues')
          const data = res?.data
          if (mounted && Array.isArray(data)) {
            setIssues(data)
          } else if (mounted && data) {
            // If backend returns a non-array payload, don't break the dashboard
            setIssues((prev) => (Array.isArray(prev) ? prev : []))
          }
        } catch {
          // ignore
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => {
    const now = Date.now()
    const msDay = 24 * 60 * 60 * 1000

    const pending = issues.filter((i) => i.status === 'Pending').length
    const assigned = issues.filter((i) => i.status === 'Assigned').length
    const inProgress = issues.filter((i) => ['Inspection', 'In Progress', 'Engineer Assigned'].includes(i.status)).length

    const citizenVerification = issues.filter((i) => i.status === 'Citizen Verification').length

    const resolvedToday = issues.filter((i) => {
      const t = safeDateValue(i.lastUpdated || i.resolvedDate || i.updatedAt || i.reportedDate)
      return now - t <= msDay
    }).filter((i) => ['Completed', 'Resolved'].includes(i.status)).length

    const overdue = issues.filter((i) => {
      const est = i.estimatedResolution
      // Heuristic only: if estimatedResolution includes a number of days and status is not completed.
      const days = typeof est === 'string' ? parseInt(est.replace(/[^0-9]/g, ''), 10) : NaN
      if (!Number.isFinite(days)) return false
      const reported = safeDateValue(i.reportedDate)
      if (!reported) return false
      const deadline = reported + days * msDay
      return now > deadline && !['Completed', 'Resolved'].includes(i.status)
    }).length

    return [
      {
        key: 'pending',
        label: 'Pending',
        value: pending,
        tone: 'slate',
        icon: ClipboardList,
        trend: pending ? '+2' : '0',
        trendDirection: pending ? 'up' : 'flat',
        filter: { type: 'Pending' },
      },
      {
        key: 'assigned',
        label: 'Assigned',
        value: assigned,
        tone: 'blue',
        icon: HardHat,
        trend: assigned ? '+1' : '0',
        trendDirection: assigned ? 'up' : 'flat',
        filter: { type: 'Assigned' },
      },
      {
        key: 'inProgress',
        label: 'In Progress',
        value: inProgress,
        tone: 'amber',
        icon: Clock3,
        trend: inProgress ? '-1' : '0',
        trendDirection: inProgress ? 'down' : 'flat',
        filter: { type: 'In Progress' },
      },
      {
        key: 'citizenVerification',
        label: 'Citizen Verification',
        value: citizenVerification,
        tone: 'blue',
        icon: ShieldCheck,
        trend: citizenVerification ? '+3' : '0',
        trendDirection: citizenVerification ? 'up' : 'flat',
        filter: { type: 'Citizen Verification' },
      },
      {
        key: 'resolvedToday',
        label: 'Resolved Today',
        value: resolvedToday,
        tone: 'green',
        icon: UsersRound,
        trend: resolvedToday ? '+0' : '0',
        trendDirection: resolvedToday ? 'up' : 'flat',
        filter: { type: 'ResolvedToday' },
      },
      {
        key: 'overdue',
        label: 'Overdue',
        value: overdue,
        tone: 'red',
        icon: Bell,
        trend: overdue ? '+4' : '0',
        trendDirection: overdue ? 'up' : 'flat',
        filter: { type: 'Overdue' },
      },
    ]
  }, [issues])

  const filteredIssues = useMemo(() => {
    const base = [...issues]

    const now = Date.now()
    const msDay = 24 * 60 * 60 * 1000

    const isOverdue = (i) => {
      const est = i.estimatedResolution
      const days = typeof est === 'string' ? parseInt(est.replace(/[^0-9]/g, ''), 10) : NaN
      if (!Number.isFinite(days)) return false
      const reported = safeDateValue(i.reportedDate)
      if (!reported) return false
      const deadline = reported + days * msDay
      return now > deadline && !['Completed', 'Resolved'].includes(i.status)
    }

    const match = (i) => {
      const t = activeFilter.type
      if (t === 'All') return true
      if (t === 'ResolvedToday') {
        const tt = safeDateValue(i.lastUpdated || i.resolvedDate || i.updatedAt || i.reportedDate)
        return ['Completed', 'Resolved'].includes(i.status) && now - tt <= msDay
      }
      if (t === 'Overdue') return isOverdue(i)
      if (t === 'In Progress') return ['Inspection', 'In Progress', 'Engineer Assigned'].includes(i.status)
      if (t === 'Pending') return i.status === 'Pending'
      if (t === 'Assigned') return i.status === 'Assigned'
      if (t === 'Citizen Verification') return i.status === 'Citizen Verification'
      return true
    }

    return base.filter(match)
  }, [issues, activeFilter])

  const prioritySorted = useMemo(() => {
    const now = Date.now()
    const msDay = 24 * 60 * 60 * 1000

    const overdue = (i) => {
      const est = i.estimatedResolution
      const days = typeof est === 'string' ? parseInt(est.replace(/[^0-9]/g, ''), 10) : NaN
      if (!Number.isFinite(days)) return false
      const reported = safeDateValue(i.reportedDate)
      if (!reported) return false
      const deadline = reported + days * msDay
      return now > deadline && !['Completed', 'Resolved'].includes(i.status)
    }

    const reopened = (i) => i.status === 'Reopened'

    const oldestPending = (i) => {
      if (i.status !== 'Pending') return false
      return safeDateValue(i.reportedDate)
    }

    const score = (i) => {
      // Higher score = earlier in list
      const pr = priorityRank[i.priority] ?? 0
      const overdueBoost = overdue(i) ? 1000 : 0
      const reopenedBoost = reopened(i) ? 900 : 0
      const pendingBoost = i.status === 'Pending' ? 200 : 0
      return overdueBoost + reopenedBoost + pendingBoost + pr
    }

    const sorted = [...filteredIssues]
    sorted.sort((a, b) => {
      const sa = score(a)
      const sb = score(b)
      if (sb !== sa) return sb - sa

      // Tie-breakers: overdue first, then priority, then oldest pending, then oldest reported
      const ob = overdue(b)
      const oa = overdue(a)
      if (oa !== ob) return oa ? -1 : 1

      const ap = priorityRank[a.priority] ?? 0
      const bp = priorityRank[b.priority] ?? 0
      if (bp !== ap) return bp - ap

      const aOld = a.status === 'Pending' ? safeDateValue(a.reportedDate) : safeDateValue(a.lastUpdated || a.reportedDate)
      const bOld = b.status === 'Pending' ? safeDateValue(b.reportedDate) : safeDateValue(b.lastUpdated || b.reportedDate)
      return aOld - bOld
    })

    return sorted
  }, [filteredIssues])

  const assignedToDepartments = useMemo(() => {
    // Assigned issues: status != Pending and has department/department name
    return [...issues].filter((i) => i.department && !['Pending', 'Completed', 'Resolved'].includes(i.status))
  }, [issues])

  const handleStatClick = (filter) => {
    setActiveFilter(filter)
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
        roleLabel={getAuth()?.role === 'admin' ? 'Municipal Administrator' : 'Authority'}
      />


      <div
        className="flex min-w-0 flex-1 flex-col"
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
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {/* Sticky Navbar already handled by Navbar */}

                <section aria-label="Statistics" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                  {stats.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleStatClick(s.filter)}
                      className="text-left"
                      aria-label={`Filter by ${s.label}`}
                    >
                      <StatsCard {...s} />
                    </button>
                  ))}
                </section>

                <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
                  <section className="min-w-0 space-y-6">
                    <PriorityQueue
                      issues={prioritySorted}
                      activeFilter={activeFilter}
                      onFilter={(filter) => setActiveFilter(filter)}
                      onOpenIssue={(id) => navigate(`/issues/${id}`)}
                    />

                    <AssignedIssues
                      issues={assignedToDepartments}
                      onOpenIssue={(id) => navigate(`/issues/${id}`)}
                    />
                  </section>

                  <aside className="hidden lg:block">
                    <SummaryPanel
                      counts={{
                        Pending: stats.find((x) => x.key === 'pending')?.value ?? 0,
                        Overdue: stats.find((x) => x.key === 'overdue')?.value ?? 0,
                        CitizenVerificationPending: stats.find((x) => x.key === 'citizenVerification')?.value ?? 0,
                        ResolvedToday: stats.find((x) => x.key === 'resolvedToday')?.value ?? 0,
                      }}
                      onQuickAction={(action) => {
                        // placeholder routing hooks
                        if (action === 'ManageDepartments') navigate('/admin/departments')
                        if (action === 'ManageUsers') navigate('/admin/users')
                        if (action === 'GenerateReports') navigate('/admin/reports')
                        if (action === 'ViewAllIssues') navigate('/admin/issues')
                      }}
                      onSelectFilter={(filter) => setActiveFilter(filter)}
                    />
                  </aside>
                </div>
              </>
            )}
          </div>
        </main>

        <AnimatePresence />
      </div>
    </div>
  )
}

