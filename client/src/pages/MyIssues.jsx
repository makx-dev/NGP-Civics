import { useEffect, useMemo, useState, useCallback } from 'react'
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
import api from '../lib/api'

const ITEMS_PER_PAGE = 6

export default function MyIssues() {
  const navigate = useNavigate()

  // ── Sidebar state ──
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  // ── Data & loading ──
  const [issues, setIssues] = useState([])
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

  const name = getAuth()?.account?.name || 'Citizen'
  const sidebarOffset = isMobile ? 0 : sidebarExpanded ? 260 : 72

  // ── Real-time backend fetching from MongoDB with cross-role polling ──
  const fetchMyIssues = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    try {
      const res = await api.get('/issues/mine')
      if (Array.isArray(res.data)) {
        setIssues(res.data)
      } else {
        setIssues([])
      }
    } catch (err) {
      console.warn('Could not fetch issues from MongoDB:', err.message)
      setIssues([])
    } finally {
      if (!isBackground) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMyIssues()
  }, [fetchMyIssues])

  // Live polling (every 10s) and window focus refetch
  // so any status update made in the Admin panel automatically updates the citizen's screen
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMyIssues(true)
      }
    }, 10000)

    const onFocus = () => fetchMyIssues(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
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
      result = result.filter((i) => {
        const cId = i.complaintId || String(i._id || '')
        const title = i.title || ''
        const area = i.area || i.ward || i.location?.address || ''
        const cat = typeof i.category === 'object' ? (i.category?.name || '') : (i.category || '')
        return (
          cId.toLowerCase().includes(q) ||
          title.toLowerCase().includes(q) ||
          area.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        )
      })
    }

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter((i) => i.status === filters.status)
    }

    // Category filter
    if (filters.category !== 'All') {
      result = result.filter((i) => {
        const cat = typeof i.category === 'object' ? (i.category?.name || '') : (i.category || '')
        return cat.toLowerCase() === filters.category.toLowerCase()
      })
    }

    // Priority filter
    if (filters.priority !== 'All') {
      result = result.filter((i) => i.priority === filters.priority)
    }

    // Sort
    const sortFn = {
      newest: (a, b) => new Date(b.createdAt || b.reportedDate || 0) - new Date(a.createdAt || a.reportedDate || 0),
      oldest: (a, b) => new Date(a.createdAt || a.reportedDate || 0) - new Date(b.createdAt || b.reportedDate || 0),
      priority: (a, b) => {
        const rank = { High: 3, Medium: 2, Low: 1 }
        return (rank[b.priority] || 2) - (rank[a.priority] || 2)
      },
      status: (a, b) => (a.status || '').localeCompare(b.status || ''),
      area: (a, b) => {
        const areaA = a.area || a.location?.address || ''
        const areaB = b.area || b.location?.address || ''
        return areaA.localeCompare(areaB)
      },
      date: (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0),
    }

    const sorter = sortFn[filters.sort] || sortFn.newest
    result.sort(sorter)

    return result
  }, [issues, search, filters])

  // ── Table sorted issues (independent sort) ──
  const tableIssues = useMemo(() => {
    const result = [...filteredIssues]
    result.sort((a, b) => {
      const aVal = a[sortField] || a.createdAt || ''
      const bVal = b[sortField] || b.createdAt || ''
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [filteredIssues, sortField, sortDir])

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE))
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // ── Stats ──
  const stats = useMemo(() => {
    const pending = issues.filter((i) => ['Pending', 'Complaint Submitted'].includes(i.status)).length
    const inProgress = issues.filter((i) =>
      ['Assigned to Department', 'Engineer Assigned', 'Inspection Scheduled', 'Work Started', 'Assigned', 'Inspection', 'In Progress', 'Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(i.status)
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
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* offset handled by wrapper below */}
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
        <Navbar name={name} onMenu={toggleSidebar} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
                        <IssueCard
                          key={issue._id || issue.id}
                          issue={issue}
                          index={idx}
                          onSelect={(id) => navigate(`/issues/${id}`)}
                        />
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
                        <CompactIssueCard
                          key={issue._id || issue.id}
                          issue={issue}
                          index={idx}
                          onSelect={(id) => navigate(`/issues/${id}`)}
                        />
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
                        onSelect={(id) => navigate(`/issues/${id}`)}
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
          </div>
        </main>
      </div>
    </div>
  )
}