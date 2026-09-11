import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react'

import AdminSidebar from '../components/admin/AdminSidebar'
import Navbar from '../components/dashboard/Navbar'
import Hero from '../components/issues/Hero'
import SearchBar from '../components/issues/SearchBar'
import ViewModeToggle from '../components/issues/ViewModeToggle'
import IssueCard from '../components/issues/IssueCard'
import CompactIssueCard from '../components/issues/CompactIssueCard'
import IssueTable from '../components/issues/IssueTable'
import EmptyState from '../components/issues/EmptyState'
import LoadingSkeleton from '../components/issues/LoadingSkeleton'
import Pagination from '../components/issues/Pagination'

import api from '../lib/api'
import { clearAuth, getAuth, getDepartment } from '../lib/auth'

const ITEMS_PER_PAGE = 9

const backendStatusOptions = [
  'All',
  'Complaint Submitted',
  'Assigned to Department',
  'Engineer Assigned',
  'Inspection Scheduled',
  'Work Started',
  'Work Completed',
  'Citizen Verification Pending',
  'Resolved',
  'REOPENED',
]

const priorityOptions = ['All', 'Low', 'Medium', 'High']

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Priority', value: 'priority' },
  { label: 'Status', value: 'status' },
  { label: 'Area', value: 'area' },
]

function DropdownSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs font-medium text-slate-400">{label}</p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 180)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-700/60 bg-slate-900/80 px-3.5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-900"
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={15} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl backdrop-blur-md"
        >
          {options.map((opt) => {
            const optLabel = typeof opt === 'object' ? opt.label : opt
            const optVal = typeof opt === 'object' ? opt.value : opt
            const isSelected = value === optLabel || value === optVal

            return (
              <button
                key={optVal}
                type="button"
                onMouseDown={() => {
                  onChange(optVal)
                  setOpen(false)
                }}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                  isSelected ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {optLabel}
              </button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export default function AdminIssues() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const auth = getAuth()
  const name = auth?.account?.name || 'Administrator'
  const department = getDepartment()

  // Sidebar responsiveness
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  // Data & loading
  const [issues, setIssues] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  // View mode
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('ngp_admin_issues_view') || 'cards')

  // Search & Filters
  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [filters, setFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All',
    sort: 'newest',
  })

  // Table sorting
  const [sortField, setSortField] = useState('reportedDate')
  const [sortDir, setSortDir] = useState('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  // Responsive mode listener
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // Fetch categories
  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get('/categories')
        if (Array.isArray(res.data)) {
          setCategories(res.data)
        }
      } catch (err) {
        console.warn('Could not load categories:', err.message)
      }
    })()
  }, [])

  // Fetch issues
  const fetchIssues = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    else setIsSyncing(true)

    try {
      const res = await api.get('/admin/issues')
      if (Array.isArray(res.data)) {
        setIssues(res.data)
      } else {
        const fallback = await api.get('/issues')
        const list = Array.isArray(fallback.data) ? fallback.data : fallback.data?.data
        if (Array.isArray(list)) setIssues(list)
      }
    } catch (err) {
      console.warn('Admin issues fetch error:', err.message)
      setIssues([])
    } finally {
      setIsLoading(false)
      setIsSyncing(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  // Polling (12s) and Window Focus live sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchIssues(true)
      }
    }, 12000)

    const onFocus = () => fetchIssues(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchIssues])

  const handleViewModeChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem('ngp_admin_issues_view', mode)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleTableSort = (key) => {
    if (sortField === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(key)
      setSortDir('asc')
    }
  }

  const categoryFilterOptions = useMemo(() => {
    const list = ['All']
    categories.forEach((c) => {
      if (c.name && !list.includes(c.name)) list.push(c.name)
    })
    return list
  }, [categories])

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    let result = [...issues]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((i) => {
        const title = (i.title || '').toLowerCase()
        const desc = (i.description || '').toLowerCase()
        const compId = (i.complaintId || '').toLowerCase()
        const area = (i.area || i.location?.address || '').toLowerCase()
        const cat = (typeof i.category === 'object' ? i.category?.name : i.category || '').toLowerCase()
        const rep = (typeof i.reporter === 'object' ? i.reporter?.name : '').toLowerCase()

        return compId.includes(q) || title.includes(q) || desc.includes(q) || area.includes(q) || cat.includes(q) || rep.includes(q)
      })
    }

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter((i) => i.status === filters.status)
    }

    // Category filter
    if (filters.category !== 'All') {
      result = result.filter((i) => {
        const catName = typeof i.category === 'object' ? i.category?.name : i.category
        return catName === filters.category
      })
    }

    // Priority filter
    if (filters.priority !== 'All') {
      result = result.filter((i) => (i.priority || '').toLowerCase() === filters.priority.toLowerCase())
    }

    // Sorting
    const priorityRank = { High: 3, Medium: 2, Low: 1 }

    result.sort((a, b) => {
      const aDate = new Date(a.createdAt || a.reportedDate || 0).getTime()
      const bDate = new Date(b.createdAt || b.reportedDate || 0).getTime()

      if (filters.sort === 'newest') return bDate - aDate
      if (filters.sort === 'oldest') return aDate - bDate
      if (filters.sort === 'priority') {
        const pA = priorityRank[a.priority] || 2
        const pB = priorityRank[b.priority] || 2
        return pB - pA || bDate - aDate
      }
      if (filters.sort === 'status') return (a.status || '').localeCompare(b.status || '')
      if (filters.sort === 'area') {
        const areaA = a.area || a.location?.address || ''
        const areaB = b.area || b.location?.address || ''
        return areaA.localeCompare(areaB)
      }
      return bDate - aDate
    })

    return result
  }, [issues, search, filters])

  // Table sorted issues
  const tableIssues = useMemo(() => {
    const result = [...filteredIssues]
    result.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (sortField === 'category') {
        aVal = typeof a.category === 'object' ? a.category?.name : a.category
        bVal = typeof b.category === 'object' ? b.category?.name : b.category
      }
      if (sortField === 'area') {
        aVal = a.area || a.location?.address || ''
        bVal = b.area || b.location?.address || ''
      }

      if (!aVal || !bVal) return 0
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortDir === 'asc' ? cmp : -cmp
    })
    return result
  }, [filteredIssues, sortField, sortDir])

  // Pagination calculation
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE)
  const paginatedIssues = filteredIssues.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Quick stats summary
  const stats = useMemo(() => {
    const pending = issues.filter((i) => ['Pending', 'Complaint Submitted'].includes(i.status)).length
    const inProgress = issues.filter((i) =>
      ['Assigned to Department', 'Engineer Assigned', 'Inspection Scheduled', 'Work Started', 'In Progress', 'Assigned'].includes(i.status)
    ).length
    const resolved = issues.filter((i) => ['Completed', 'Resolved'].includes(i.status)).length

    return {
      total: issues.length,
      pending,
      inProgress,
      resolved,
    }
  }, [issues])

  const effectiveView = isMobile && viewMode === 'table' ? 'cards' : viewMode

  const handleIssueSelect = (id) => {
    navigate(`/admin/issues/${id}`)
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
          onSearch={(v) => {
            setSearch(v)
            setCurrentPage(1)
          }}
          searchPlaceholder="Search all civic complaints across Nagpur..."
        />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Hero / Stats Banner */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                    <ShieldCheck size={13} /> Authority Registry
                  </span>
                  {isSyncing && (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <RefreshCw size={11} className="animate-spin" /> Live Syncing
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  All Civic Issues
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Comprehensive register of municipal complaints, work orders, and field resolutions.
                </p>
              </div>

              <button
                onClick={() => fetchIssues(false)}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800 sm:self-auto"
              >
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Registered</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending Review</p>
                <p className="mt-1 font-mono text-2xl font-bold text-slate-200">{stats.pending}</p>
              </div>
              <div className="rounded-xl border border-blue-500/40 bg-blue-950/20 p-4 shadow-sm ring-1 ring-blue-500/20">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Active / In Progress</p>
                <p className="mt-1 font-mono text-2xl font-bold text-blue-400">{stats.inProgress}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resolved</p>
                <p className="mt-1 font-mono text-2xl font-bold text-white">{stats.resolved}</p>
              </div>
            </div>

            {/* Search + View Toggle row */}
            <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="w-full flex-1">
                <SearchBar
                  value={search}
                  onChange={(v) => {
                    setSearch(v)
                    setCurrentPage(1)
                  }}
                  placeholder="Search by Complaint ID, Title, Area, Category, Description..."
                />
              </div>
              <div className="flex shrink-0 items-center gap-3 self-start sm:self-auto">
                {!isMobile && (
                  <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
                )}
              </div>
            </div>

            {/* Filters Row */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <DropdownSelect
                label="Status Filter"
                value={filters.status}
                options={backendStatusOptions}
                onChange={(v) => handleFilterChange('status', v)}
              />
              <DropdownSelect
                label="Category Filter"
                value={filters.category}
                options={categoryFilterOptions}
                onChange={(v) => handleFilterChange('category', v)}
              />
              <DropdownSelect
                label="Priority Filter"
                value={filters.priority}
                options={priorityOptions}
                onChange={(v) => handleFilterChange('priority', v)}
              />
              <DropdownSelect
                label="Sort Order"
                value={sortOptions.find((o) => o.value === filters.sort)?.label || 'Newest'}
                options={sortOptions}
                onChange={(v) => handleFilterChange('sort', v)}
              />
            </div>

            {/* Issues Content Area */}
            <div className="mt-6">
              {isLoading ? (
                <LoadingSkeleton viewMode={effectiveView} />
              ) : filteredIssues.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
                    <p>
                      Showing <span className="font-semibold text-slate-200">{filteredIssues.length}</span> {filteredIssues.length === 1 ? 'issue' : 'issues'}
                    </p>
                    {search && (
                      <button
                        onClick={() => setSearch('')}
                        className="inline-flex items-center gap-1 text-blue-400 hover:underline"
                      >
                        <X size={13} /> Clear search "{search}"
                      </button>
                    )}
                  </div>

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
                            onSelect={handleIssueSelect}
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
                            onSelect={handleIssueSelect}
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
                          onSelect={handleIssueSelect}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pagination */}
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
