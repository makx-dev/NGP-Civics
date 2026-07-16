import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import Navbar from '../components/dashboard/Navbar'
import Hero from '../components/issues/Hero'
import SearchBar from '../components/issues/SearchBar'
import FilterBar from '../components/issues/FilterBar'
import ViewModeToggle from '../components/issues/ViewModeToggle'
import IssueCard from '../components/issues/IssueCard'
import CompactIssueCard from '../components/issues/CompactIssueCard'
import IssueTable from '../components/issues/IssueTable'
import EmptyState from '../components/issues/EmptyState'
import LoadingSkeleton from '../components/issues/LoadingSkeleton'
import Pagination from '../components/issues/Pagination'
import { clearAuth, getAuth } from '../lib/auth'
import { getStoredIssues } from '../lib/issuesStore'

// ──────────────────────────────────────────────
// Sample data — replace with real API call later
// ──────────────────────────────────────────────
const sampleIssues = [
  {
    id: '1',
    complaintId: 'NGP-2026-0421',
    title: 'Deep pothole near Gandhi Square causing accidents',
    category: 'Road',
    department: 'NMC Road Department',
    area: 'Gandhi Square',
    priority: 'High',
    status: 'In Progress',
    reportedDate: '12 Jul 2026',
    lastUpdated: '15 Jul 2026',
    image: null,
    currentStage: 'Repair work has started and is expected to complete in 3 days.',
  },
  {
    id: '2',
    complaintId: 'NGP-2026-0422',
    title: 'Garbage not collected in Dhantoli Layout',
    category: 'Garbage',
    department: 'NMC Sanitation',
    area: 'Dhantoli',
    priority: 'Medium',
    status: 'Assigned',
    reportedDate: '10 Jul 2026',
    lastUpdated: '14 Jul 2026',
    image: null,
    currentStage: 'Engineer has been assigned for site inspection.',
  },
  {
    id: '3',
    complaintId: 'NGP-2026-0423',
    title: 'Water pipeline burst on Central Avenue',
    category: 'Water',
    department: 'NMC Water Supply',
    area: 'Central Avenue',
    priority: 'High',
    status: 'Completed',
    reportedDate: '05 Jul 2026',
    lastUpdated: '13 Jul 2026',
    image: null,
    currentStage: 'Pipeline repair completed and water supply restored.',
  },
  {
    id: '4',
    complaintId: 'NGP-2026-0424',
    title: 'Street light not working on Jhansi Rani Road',
    category: 'Street Light',
    department: 'NMC Electrical',
    area: 'Jhansi Rani Road',
    priority: 'Low',
    status: 'Pending',
    reportedDate: '14 Jul 2026',
    lastUpdated: '14 Jul 2026',
    image: null,
    currentStage: 'Awaiting initial review by the electrical department.',
  },
  {
    id: '5',
    complaintId: 'NGP-2026-0425',
    title: 'Traffic signal malfunction at Itwari Chowk',
    category: 'Traffic',
    department: 'NMC Traffic Control',
    area: 'Itwari Chowk',
    priority: 'High',
    status: 'Inspection',
    reportedDate: '09 Jul 2026',
    lastUpdated: '12 Jul 2026',
    image: null,
    currentStage: 'Inspection scheduled for tomorrow morning.',
  },
  {
    id: '6',
    complaintId: 'NGP-2026-0426',
    title: 'Illegal encroachment on footpath near Sitabuldi',
    category: 'Encroachment',
    department: 'NMC Enforcement',
    area: 'Sitabuldi',
    priority: 'Medium',
    status: 'Citizen Verification',
    reportedDate: '01 Jul 2026',
    lastUpdated: '11 Jul 2026',
    image: null,
    currentStage: 'Waiting for citizen verification before proceeding.',
  },
  {
    id: '7',
    complaintId: 'NGP-2026-0427',
    title: 'Manhole cover missing near Railway Station',
    category: 'Road',
    department: 'NMC Road Department',
    area: 'Railway Station',
    priority: 'High',
    status: 'Resolved',
    reportedDate: '20 Jun 2026',
    lastUpdated: '10 Jul 2026',
    image: null,
    currentStage: 'Manhole cover replaced and area secured.',
  },
  {
    id: '8',
    complaintId: 'NGP-2026-0428',
    title: 'Garbage dump attracting stray dogs',
    category: 'Garbage',
    department: 'NMC Sanitation',
    area: 'Lakadganj',
    priority: 'Medium',
    status: 'Pending',
    reportedDate: '15 Jul 2026',
    lastUpdated: '15 Jul 2026',
    image: null,
    currentStage: 'Awaiting initial review by the sanitation department.',
  },
  {
    id: '9',
    complaintId: 'NGP-2026-0429',
    title: 'Water contamination in Dharampeth area',
    category: 'Water',
    department: 'NMC Water Supply',
    area: 'Dharampeth',
    priority: 'High',
    status: 'Reopened',
    reportedDate: '28 Jun 2026',
    lastUpdated: '14 Jul 2026',
    image: null,
    currentStage: 'Issue was reopened — re-inspection requested by citizen.',
  },
  {
    id: '10',
    complaintId: 'NGP-2026-0430',
    title: 'Broken street light near Mayo Hospital',
    category: 'Street Light',
    department: 'NMC Electrical',
    area: 'Mayo Hospital',
    priority: 'Low',
    status: 'Assigned',
    reportedDate: '13 Jul 2026',
    lastUpdated: '13 Jul 2026',
    image: null,
    currentStage: 'Engineer has been assigned for site inspection.',
  },
]

const ITEMS_PER_PAGE = 6

export default function MyIssues() {
  const navigate = useNavigate()

  // ── Sidebar state ──
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  // ── Data & loading ──
  const [issues, setIssues] = useState(sampleIssues)
  const [isLoading, setIsLoading] = useState(true)

  // ── View mode ──
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('ngp_issues_view') || 'cards'
  })

  // ── Search & filters ──
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All',
    sort: 'newest',
  })

  // ── Table sorting ──
  const [sortField, setSortField] = useState('reportedDate')
  const [sortDir, setSortDir] = useState('desc')

  // ── Pagination ──
  const [currentPage, setCurrentPage] = useState(1)

  const name = getAuth()?.account?.name || 'Manthan'
  const sidebarOffset = isMobile ? 0 : sidebarExpanded ? 260 : 72

  // ── Simulate loading + read stored issues ──
  useEffect(() => {
    const stored = getStoredIssues()
    if (stored.length > 0) {
      setIssues((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        const newOnes = stored.filter((i) => !existingIds.has(i.id))
        return [...newOnes, ...prev]
      })
    }
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // ── Responsive ──
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // ── Persist view mode ──
  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('ngp_issues_view', mode)
  }

  // ── Auth ──
  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  const toggleSidebar = () => {
    if (isMobile) setMobileMenuOpen((o) => !o)
    else setSidebarExpanded((o) => !o)
  }

  // ── Filter change ──
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // ── Table sort ──
  const handleTableSort = (key) => {
    if (sortField === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(key)
      setSortDir('asc')
    }
  }

  // ── Filtered & sorted issues ──
  const filteredIssues = useMemo(() => {
    let result = [...issues]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.complaintId.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.area.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter((i) => i.status === filters.status)
    }

    // Category filter
    if (filters.category !== 'All') {
      result = result.filter((i) => i.category === filters.category)
    }

    // Priority filter
    if (filters.priority !== 'All') {
      result = result.filter((i) => i.priority === filters.priority)
    }

    // Sort
    const sortFn = {
      newest: (a, b) => new Date(b.reportedDate) - new Date(a.reportedDate),
      oldest: (a, b) => new Date(a.reportedDate) - new Date(b.reportedDate),
      priority: (a, b) => {
        const rank = { High: 3, Medium: 2, Low: 1 }
        return rank[b.priority] - rank[a.priority]
      },
      status: (a, b) => a.status.localeCompare(b.status),
      area: (a, b) => a.area.localeCompare(b.area),
      date: (a, b) => new Date(b.lastUpdated || b.reportedDate) - new Date(a.lastUpdated || a.reportedDate),
    }

    const sorter = sortFn[filters.sort] || sortFn.newest
    result.sort(sorter)

    return result
  }, [issues, search, filters])

  // ── Table sorted issues (independent sort) ──
  const tableIssues = useMemo(() => {
    const result = [...filteredIssues]
    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (!aVal || !bVal) return 0
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [filteredIssues, sortField, sortDir])

  // ── Pagination ──
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE)
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ── Stats ──
  const stats = useMemo(() => {
    const pending = issues.filter((i) => i.status === 'Pending').length
    const inProgress = issues.filter((i) =>
      ['Assigned', 'Inspection', 'In Progress', 'Citizen Verification', 'Engineer Assigned'].includes(i.status)
    ).length
    const resolved = issues.filter((i) =>
      ['Completed', 'Resolved'].includes(i.status)
    ).length
    return {
      total: issues.length,
      pending,
      inProgress,
      resolved,
    }
  }, [issues])

  // ── On mobile, hide table mode ──
  const effectiveView = isMobile && viewMode === 'table' ? 'cards' : viewMode

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-950 text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        expanded={sidebarExpanded}
        isMobile={isMobile}
        name={name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={signOut}
      />

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarOffset }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="min-w-0"
      >
        <Navbar name={name} onMenu={toggleSidebar} />

        <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Hero + Stats */}
          <Hero stats={stats} />

          {/* Search + View Toggle row */}
          <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="w-full flex-1">
              <SearchBar
                value={search}
                onChange={(v) => {
                  setSearch(v)
                  setCurrentPage(1)
                }}
                placeholder="Search by Complaint ID, Title, Location, Category..."
              />
            </div>
            <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
              {!isMobile && (
                <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Issues content */}
          <div className="mt-6">
            {isLoading ? (
              <LoadingSkeleton viewMode={effectiveView} />
            ) : filteredIssues.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Results count */}
                <p className="mb-4 text-xs font-medium text-slate-500">
                  Showing {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'}
                </p>

                <AnimatePresence mode="wait">
                  {effectiveView === 'cards' && (
                    <motion.div
                      key="cards"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {paginatedIssues.map((issue, idx) => (
                        <IssueCard key={issue.id} issue={issue} index={idx} />
                      ))}
                    </motion.div>
                  )}

                  {effectiveView === 'compact' && (
                    <motion.div
                      key="compact"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3"
                    >
                      {paginatedIssues.map((issue, idx) => (
                        <CompactIssueCard key={issue.id} issue={issue} index={idx} />
                      ))}
                    </motion.div>
                  )}

                  {effectiveView === 'table' && (
                    <motion.div
                      key="table"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      <IssueTable
                        issues={tableIssues}
                        sortField={sortField}
                        sortDir={sortDir}
                        onSort={handleTableSort}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination (not shown for table — table shows all) */}
                {effectiveView !== 'table' && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  )
}