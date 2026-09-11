import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  HardHat,
  History,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Star,
  Tag,
  User,
  UserCheck,
  UsersRound,
  X,
} from 'lucide-react'

import AdminSidebar from '../components/admin/AdminSidebar'
import CitizenProfileModal from '../components/admin/CitizenProfileModal'
import Navbar from '../components/dashboard/Navbar'
import StatusBadge from '../components/issues/StatusBadge'
import PriorityBadge from '../components/issues/PriorityBadge'

import api from '../lib/api'
import { clearAuth, getAuth, getDepartment } from '../lib/auth'

const statusOrder = [
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

const allowedStatusTransitions = {
  'Complaint Submitted': ['Assigned to Department'],
  'Assigned to Department': ['Engineer Assigned'],
  'Engineer Assigned': ['Inspection Scheduled'],
  'Inspection Scheduled': ['Work Started'],
  'Work Started': ['Work Completed'],
  'Work Completed': ['Citizen Verification Pending'],
  'Citizen Verification Pending': [], // Verified by citizen
  Resolved: [],
  REOPENED: ['Work Started'],
}

const nmcDepartments = [
  'Road Maintenance & Bridges Division',
  'Electrical & Streetlights Division',
  'Solid Waste Management & Sanitation',
  'Water Supply & Sewerage Board',
  'Health & Vector Control Department',
  'Public Works & Infrastructure',
  'Animal Welfare & Stray Control',
  'Traffic Management & Signals',
  'Garden & Parks Department',
  'Town Planning & Encroachment Cell',
]

const officerPresets = [
  { name: 'Er. Rajesh Kulkarni', role: 'Executive Engineer (Roads)', phone: '+91 98230 45612', dept: 'Road Maintenance & Bridges Division' },
  { name: 'Er. Amit Deshmukh', role: 'Assistant Municipal Engineer', phone: '+91 98221 78901', dept: 'Electrical & Streetlights Division' },
  { name: 'Sunita Rao', role: 'Sanitation Chief Inspector', phone: '+91 97654 32190', dept: 'Solid Waste Management & Sanitation' },
  { name: 'Er. Pradeep Sharma', role: 'Sewerage & Water Works Supervisor', phone: '+91 98901 23456', dept: 'Water Supply & Sewerage Board' },
  { name: 'Dr. Vivek Naik', role: 'Chief Health & Vector Officer', phone: '+91 98233 65432', dept: 'Health & Vector Control Department' },
  { name: 'Er. Anand Patil', role: 'Civil Works Contractor Liaison', phone: '+91 98229 11223', dept: 'Public Works & Infrastructure' },
]

export default function AdminIssueDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const auth = getAuth()
  const name = auth?.account?.name || 'Administrator'
  const department = getDepartment()

  // Sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  // Data states
  const [issue, setIssue] = useState(null)
  const [comparison, setComparison] = useState({ before: [], after: null })
  const [history, setHistory] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState(null)
  const [showCitizenModal, setShowCitizenModal] = useState(false)

  // Form controls for Admin Action Center
  const [selectedNextStatus, setSelectedNextStatus] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [assignedOfficer, setAssignedOfficer] = useState('')
  const [assignedOfficerRole, setAssignedOfficerRole] = useState('')
  const [assignedOfficerPhone, setAssignedOfficerPhone] = useState('')
  const [progressValue, setProgressValue] = useState(0)
  const [scheduledInspectionDate, setScheduledInspectionDate] = useState('')
  const [estimatedResolutionDate, setEstimatedResolutionDate] = useState('')
  const [ward, setWard] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('Medium')
  const [adminRemarks, setAdminRemarks] = useState('')
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('')

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  // Handle responsive layout
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // Populate form controls from issue data
  const populateForm = (current) => {
    setIssue(current)
    setSelectedCategory(current.category?._id || current.category || '')
    setSelectedDepartment(current.department || 'Road Maintenance & Bridges Division')
    setAssignedOfficer(current.assignedOfficer || '')
    setAssignedOfficerRole(current.assignedOfficerRole || 'Field Engineer')
    setAssignedOfficerPhone(current.assignedOfficerPhone || '')
    setProgressValue(typeof current.progress === 'number' ? current.progress : 15)
    setWard(current.ward || 'Ward 12 (Dharampeth / Central Nagpur)')
    setSelectedPriority(current.priority || 'Medium')
    setAdminRemarks(current.adminRemarks || '')
    setCompletionPhotoUrl(current.completionPhoto || '')

    if (current.scheduledInspectionDate) {
      setScheduledInspectionDate(new Date(current.scheduledInspectionDate).toISOString().slice(0, 10))
    }
    if (current.estimatedResolutionDate) {
      setEstimatedResolutionDate(new Date(current.estimatedResolutionDate).toISOString().slice(0, 10))
    }

    const nextPossible = allowedStatusTransitions[current.status] || []
    setSelectedNextStatus(nextPossible[0] || '')
  }

  // Fetch all issue details, categories, history, and comparison
  const fetchAllData = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)

    try {
      // 1. Categories
      try {
        const catRes = await api.get('/categories')
        if (Array.isArray(catRes.data)) setCategories(catRes.data)
      } catch (e) {
        console.warn('Could not load categories:', e.message)
      }

      // 2. Issue
      try {
        const issueRes = await api.get(`/issues/${id}`)
        if (issueRes.data) {
          populateForm(issueRes.data)
        }
      } catch (e) {
        console.warn('Could not load issue:', e.message)
      }

      // 3. Photo Comparison
      try {
        const compRes = await api.get(`/issues/${id}/photo-comparison`)
        if (compRes.data) {
          setComparison({
            before: Array.isArray(compRes.data.before) ? compRes.data.before : [],
            after: compRes.data.after || null,
          })
        }
      } catch (e) {
        console.warn('Could not fetch photo comparison:', e.message)
      }

      // 4. Status History
      try {
        const histRes = await api.get(`/issues/${id}/history`)
        if (Array.isArray(histRes.data)) {
          setHistory(histRes.data)
        }
      } catch (e) {
        console.warn('Could not fetch history timeline:', e.message)
      }
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Polling (12s) and window focus refetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchAllData(true)
      }
    }, 12000)

    const onFocus = () => fetchAllData(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchAllData])

  // Quick officer selection preset
  const handleSelectOfficerPreset = (officer) => {
    setAssignedOfficer(officer.name)
    setAssignedOfficerRole(officer.role)
    setAssignedOfficerPhone(officer.phone)
    if (officer.dept) setSelectedDepartment(officer.dept)
  }

  // Submit status update and full admin actions
  const handleAdminUpdate = async (e) => {
    e.preventDefault()
    if (!issue) return

    setIsSubmitting(true)
    setNotice(null)

    try {
      const payload = {
        department: selectedDepartment,
        assignedOfficer: assignedOfficer.trim(),
        assignedOfficerRole: assignedOfficerRole.trim(),
        assignedOfficerPhone: assignedOfficerPhone.trim(),
        progress: Number(progressValue),
        ward: ward.trim(),
      }

      if (selectedNextStatus && selectedNextStatus !== issue.status) {
        payload.status = selectedNextStatus
      }

      if (selectedCategory && selectedCategory !== (issue.category?._id || issue.category)) {
        payload.category = selectedCategory
      }

      if (selectedPriority && selectedPriority !== issue.priority) {
        payload.priority = selectedPriority
      }

      if (adminRemarks.trim()) {
        payload.adminRemarks = adminRemarks.trim()
      }

      if (scheduledInspectionDate) {
        payload.scheduledInspectionDate = scheduledInspectionDate
      }

      if (estimatedResolutionDate) {
        payload.estimatedResolutionDate = estimatedResolutionDate
      }

      if (completionPhotoUrl.trim()) {
        payload.completionPhoto = completionPhotoUrl.trim()
      }

      // If transitioning to Citizen Verification Pending, check completion photo requirement
      if (payload.status === 'Citizen Verification Pending' && !payload.completionPhoto && !issue.completionPhoto) {
        throw new Error('A valid completion photo URL is required before advancing to Citizen Verification Pending.')
      }

      const res = await api.patch(`/admin/issues/${issue._id || id}`, payload)
      if (res.data) {
        populateForm(res.data)
        setNotice({ type: 'success', message: 'Issue assigned and progress updated successfully in real-time!' })
        fetchAllData(true)
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err.response?.data?.message || err.message || 'Failed to update issue. Please check all required fields.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryName = typeof issue?.category === 'object' ? issue.category?.name : issue?.category || 'General'
  const complaintCode = issue?.complaintId || `NGP-${String(issue?._id || id).slice(-6).toUpperCase()}`
  const nextAllowedOptions = issue ? (allowedStatusTransitions[issue.status] || []) : []
  const isFinalState = issue?.status === 'Resolved'

  const locationUrl = issue?.location?.lat && issue?.location?.lng
    ? `https://www.google.com/maps?q=${issue.location.lat},${issue.location.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue?.area || issue?.location?.address || 'Nagpur')}`

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
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Top Bar Navigation */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => navigate('/admin/issues')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft size={16} /> Back to Issue Registry
              </button>

              <div className="flex items-center gap-3">
                <a
                  href={locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-blue-400 transition-colors hover:bg-slate-800"
                >
                  <MapPin size={14} /> Open in Google Maps <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => fetchAllData(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>
            </div>

            {/* Notification Alert Banner */}
            {notice && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-lg ${
                  notice.type === 'success'
                    ? 'border-blue-500/40 bg-blue-950/90 text-blue-100'
                    : notice.type === 'error'
                    ? 'border-slate-700 bg-slate-900/90 text-slate-100'
                    : 'border-blue-500/40 bg-blue-950/90 text-blue-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {notice.type === 'success' ? (
                    <CheckCircle2 size={20} className="shrink-0 text-blue-400" />
                  ) : notice.type === 'error' ? (
                    <AlertCircle size={20} className="shrink-0 text-blue-400" />
                  ) : (
                    <ShieldCheck size={20} className="shrink-0 text-blue-400" />
                  )}
                  <p className="text-sm font-medium">{notice.message}</p>
                </div>
                <button onClick={() => setNotice(null)} className="text-current opacity-70 hover:opacity-100">
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {isLoading || !issue ? (
              <div className="space-y-6">
                <div className="h-44 w-full animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
                <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
              </div>
            ) : (
              <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
                {/* Left Column: Rich Overview, Evidence & Audit Trail */}
                <div className="min-w-0 space-y-6">
                  {/* Hero Summary Card */}
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-black/20 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">#{complaintCode}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          Reported {new Date(issue.createdAt || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} size="lg" />
                      </div>
                    </div>

                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {issue.title}
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {issue.description}
                    </p>

                    {/* Live Progress Bar Indicator */}
                    <div className="mt-6 space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400">Resolution Progress (Synced with Citizen)</span>
                        <span className="font-mono text-blue-400">{issue.progress || progressValue || 0}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${issue.progress || progressValue || 0}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full bg-blue-500"
                        />
                      </div>
                    </div>

                    {/* Key Attributes Meta Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-slate-500">Category</p>
                        <p className="mt-1 font-semibold text-slate-200">{categoryName}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-slate-500">Department</p>
                        <p className="mt-1 font-semibold text-slate-200">{issue.department || selectedDepartment}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-slate-500">Ward / Zone</p>
                        <p className="mt-1 font-semibold text-slate-200">{issue.ward || 'Ward 12 (Central)'}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                        <p className="text-slate-500">Location</p>
                        <p className="mt-1 truncate font-semibold text-slate-200">{issue.area || issue.location?.address || 'Nagpur'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Reporter Profile Card */}
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/20 text-base font-bold text-blue-300 shadow-inner">
                          {issue.reporter?.avatar ? (
                            <img
                              src={issue.reporter.avatar}
                              alt={issue.reporter.name}
                              className="h-full w-full rounded-2xl object-cover"
                            />
                          ) : (
                            (issue.reporter?.name || 'Citizen').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">
                              {issue.reporter?.name || 'Registered Citizen'}
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                              <ShieldCheck size={12} /> Citizen Reporter
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Registered citizen who reported this civic issue
                          </p>
                        </div>
                      </div>

                      {issue.reporter && (
                        <button
                          type="button"
                          onClick={() => setShowCitizenModal(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-600/20 px-3.5 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-600/30 hover:text-white shadow-sm"
                        >
                          <User size={14} /> View Citizen Profile <ExternalLink size={12} />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <Mail size={13} className="text-blue-400" /> Registered Email
                        </p>
                        <p className="mt-1.5 truncate font-mono font-medium text-slate-200">
                          {issue.reporter?.email || 'Not provided'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <Phone size={13} className="text-blue-400" /> Citizen Contact
                        </p>
                        <p className="mt-1.5 truncate font-mono font-medium text-slate-200">
                          {issue.reporter?.phone ? (
                            <a
                              href={`tel:${issue.reporter.phone}`}
                              className="text-blue-400 hover:underline"
                            >
                              {issue.reporter.phone}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                        <p className="flex items-center gap-1.5 text-slate-400">
                          <Calendar size={13} className="text-blue-400" /> Citizen Since
                        </p>
                        <p className="mt-1.5 font-medium text-slate-200">
                          {issue.reporter?.createdAt
                            ? new Date(issue.reporter.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Registered Citizen'}
                        </p>
                      </div>

                      {issue.reporter?.address && (
                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 sm:col-span-3">
                          <p className="flex items-center gap-1.5 text-slate-400">
                            <MapPin size={13} className="text-blue-400" /> Resident Address / Area
                          </p>
                          <p className="mt-1.5 font-medium text-slate-200">
                            {issue.reporter.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assigned Personnel & Dispatch Card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Personnel & Operations</p>
                        <h2 className="mt-1 text-base font-semibold text-white">Assigned Field Engineer & Dates</h2>
                      </div>
                      <HardHat size={22} className="text-blue-400" />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <p className="text-xs font-medium text-slate-400">Assigned Officer / Engineer</p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {issue.assignedOfficer || 'Not yet assigned to an individual'}
                        </p>
                        {issue.assignedOfficerRole && (
                          <p className="text-xs text-blue-300">{issue.assignedOfficerRole}</p>
                        )}
                        {issue.assignedOfficerPhone && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <Phone size={13} className="text-slate-500" /> {issue.assignedOfficerPhone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs">
                        <div>
                          <span className="text-slate-500">Scheduled On-Site Inspection:</span>
                          <p className="font-medium text-slate-200">
                            {issue.scheduledInspectionDate
                              ? new Date(issue.scheduledInspectionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Pending scheduling'}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-slate-500">Estimated Target Completion:</span>
                          <p className="font-medium text-slate-200">
                            {issue.estimatedResolutionDate
                              ? new Date(issue.estimatedResolutionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'Within standard SLA (7 days)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Feedback Card (If Verified/Rated) */}
                  {(issue.citizenFeedback || issue.citizenRating) && (
                    <div className="rounded-2xl border border-blue-500/30 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Citizen Verification Review</p>
                          <h2 className="mt-1 text-base font-semibold text-white">Resident Feedback & Rating</h2>
                        </div>
                        <UserCheck size={22} className="text-blue-400" />
                      </div>

                      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                        {issue.citizenRating && (
                          <div className="mb-2 flex items-center gap-1.5 text-blue-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={16}
                                className={star <= issue.citizenRating ? 'fill-blue-400 text-blue-400' : 'text-slate-700'}
                              />
                            ))}
                            <span className="ml-2 text-xs font-bold text-slate-200">{issue.citizenRating}/5 Stars</span>
                          </div>
                        )}
                        {issue.citizenFeedback && (
                          <p className="text-sm text-slate-300 italic">"{issue.citizenFeedback}"</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Before vs After Photo Comparison Section */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Visual Evidence</p>
                        <h2 className="mt-1 text-base font-semibold text-white">Before & After Photo Comparison</h2>
                      </div>
                      <ImageIcon size={20} className="text-slate-400" />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {/* Before Photos (Submitted by Citizen) */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1 text-blue-400">
                            <Camera size={14} /> Initial Citizen Photo (Before)
                          </span>
                          <span>{issue.photos?.length || 0} photo(s)</span>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {Array.isArray(issue.photos) && issue.photos.length > 0 ? (
                            issue.photos.map((photo, pIdx) => (
                              <div key={pIdx} className="relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                                <img
                                  src={photo.url}
                                  alt={photo.caption || `Issue photo ${pIdx + 1}`}
                                  className="h-full w-full object-cover"
                                />
                                {photo.caption && (
                                  <span className="absolute bottom-0 inset-x-0 bg-black/70 p-1.5 text-[11px] text-slate-300">
                                    {photo.caption}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-xs text-slate-500">
                              No citizen photo uploaded
                            </div>
                          )}
                        </div>
                      </div>

                      {/* After Photo (Uploaded by Municipal Authority) */}
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                          <span className="flex items-center gap-1 text-blue-400">
                            <CheckCircle2 size={14} /> Official Resolution Evidence (After)
                          </span>
                          <span>{issue.completionPhoto ? 'Attached' : 'Pending'}</span>
                        </div>

                        <div className="mt-3">
                          {issue.completionPhoto ? (
                            <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
                              <img
                                src={issue.completionPhoto}
                                alt="Completed work"
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2 text-[11px] text-blue-300">
                                Uploaded: {issue.completionPhotoUploadedAt ? new Date(issue.completionPhotoUploadedAt).toLocaleString() : 'Recently'}
                              </div>
                            </div>
                          ) : (
                            <div className="flex aspect-video flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
                              <Camera size={24} className="mb-2 text-slate-600" />
                              <p className="font-medium text-slate-400">Completion photo not yet attached.</p>
                              <p className="mt-1 text-[11px] text-slate-500">Attach the completion photo URL in the Action Center before sending for citizen verification.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status History Audit Trail Section */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Audit Trail</p>
                        <h2 className="mt-1 text-base font-semibold text-white">Status & Activity History</h2>
                      </div>
                      <History size={20} className="text-slate-400" />
                    </div>

                    <div className="mt-5 space-y-3">
                      {history.length === 0 ? (
                        <p className="text-xs text-slate-500">No status audit records found.</p>
                      ) : (
                        history.map((record, rIdx) => (
                          <div
                            key={record._id || rIdx}
                            className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 text-xs text-slate-300"
                          >
                            <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-600/20 text-blue-400">
                              <History size={13} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="font-semibold text-white">
                                  {record.fromStatus} → <span className="text-blue-400">{record.toStatus}</span>
                                </p>
                                <span className="text-[11px] text-slate-500">
                                  {new Date(record.changedAt || Date.now()).toLocaleString()}
                                </span>
                              </div>
                              <p className="mt-1 text-slate-400">
                                Actor: <strong className="text-slate-200">{record.changedByAdmin?.name ? `Admin (${record.changedByAdmin.name})` : record.changedByUser?.name ? `Citizen (${record.changedByUser.name})` : 'System'}</strong>
                              </p>
                              {record.remark && (
                                <p className="mt-1.5 rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-slate-300 italic">
                                  "{record.remark}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Citizen Reporter Details Card */}
                  {issue.reporter && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Citizen Reporter Profile</p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-800 font-semibold text-slate-200">
                          {typeof issue.reporter === 'object' ? (issue.reporter.name || 'C')[0] : 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {typeof issue.reporter === 'object' ? issue.reporter.name : 'Registered Resident'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {typeof issue.reporter === 'object' ? issue.reporter.email : 'Citizen'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Comprehensive Admin Operations & Dispatch Command Center */}
                <aside className="space-y-6">
                  <div className="sticky top-[72px] space-y-6">
                    <form
                      onSubmit={handleAdminUpdate}
                      className="rounded-2xl border border-blue-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Operations Command</p>
                          <h3 className="mt-1 text-lg font-bold text-white">Task Assignment & Control</h3>
                        </div>
                        <ShieldCheck size={22} className="text-blue-400" />
                      </div>

                      <div className="mt-5 space-y-4">
                        {/* 1. Status Transition Selector */}
                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-400">
                            Current Stage: <span className="text-white">{issue.status}</span>
                          </label>

                          {isFinalState ? (
                            <div className="mt-2 rounded-xl border border-blue-500/30 bg-blue-950/30 p-3 text-xs text-blue-300">
                              ✓ This issue is fully resolved and verified.
                            </div>
                          ) : nextAllowedOptions.length > 0 ? (
                            <div className="mt-2 space-y-1.5">
                              <label className="text-xs font-medium text-slate-300">Advance Stage</label>
                              <select
                                value={selectedNextStatus}
                                onChange={(e) => setSelectedNextStatus(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-sm font-medium text-white outline-none focus:border-blue-500"
                              >
                                {nextAllowedOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : issue.status === 'Citizen Verification Pending' ? (
                            <div className="mt-2 rounded-xl border border-blue-500/30 bg-blue-950/30 p-3 text-xs text-blue-200">
                              Work completed. Awaiting citizen confirmation to close or reopen.
                            </div>
                          ) : null}
                        </div>

                        {/* 2. Department Assignment */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300">Responsible Municipal Department</label>
                          <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-medium text-white outline-none focus:border-blue-500"
                          >
                            {nmcDepartments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 3. Specific Personnel Assignment */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-blue-400">Assign Field Personnel</label>
                            <span className="text-[10px] text-slate-500">Quick Presets:</span>
                          </div>

                          {/* Quick Officer Chips */}
                          <div className="flex flex-wrap gap-1.5">
                            {officerPresets.slice(0, 3).map((off) => (
                              <button
                                key={off.name}
                                type="button"
                                onClick={() => handleSelectOfficerPreset(off)}
                                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-slate-300 hover:border-blue-500 hover:text-white"
                              >
                                + {off.name.split(' ')[1]}
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400">Officer / Engineer Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Er. Rajesh Kulkarni"
                              value={assignedOfficer}
                              onChange={(e) => setAssignedOfficer(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-slate-400">Designation / Role</label>
                              <input
                                type="text"
                                placeholder="e.g. Field Engineer"
                                value={assignedOfficerRole}
                                onChange={(e) => setAssignedOfficerRole(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400">Contact Phone</label>
                              <input
                                type="tel"
                                placeholder="+91 98230 12345"
                                value={assignedOfficerPhone}
                                onChange={(e) => setAssignedOfficerPhone(e.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 4. Live Progress Slider */}
                        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300">Set Progress Percentage</span>
                            <span className="font-mono font-bold text-blue-400">{progressValue}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={progressValue}
                            onChange={(e) => setProgressValue(Number(e.target.value))}
                            className="w-full accent-blue-500 cursor-pointer"
                          />
                          <div className="flex justify-between gap-1 pt-1">
                            {[0, 25, 50, 75, 90, 100].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setProgressValue(val)}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold transition-colors ${
                                  progressValue === val
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. Date Scheduling */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-400">Inspection Date</label>
                            <input
                              type="date"
                              value={scheduledInspectionDate}
                              onChange={(e) => setScheduledInspectionDate(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400">Target Resolution</label>
                            <input
                              type="date"
                              value={estimatedResolutionDate}
                              onChange={(e) => setEstimatedResolutionDate(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* 6. Priority & Category */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[11px] text-slate-400">Priority Level</label>
                            <select
                              value={selectedPriority}
                              onChange={(e) => setSelectedPriority(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-medium text-white outline-none focus:border-blue-500"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400">Category</label>
                            <select
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs font-medium text-white outline-none focus:border-blue-500"
                            >
                              {categories.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 7. Completion Photo URL Input */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300">
                            Completion Proof Photo URL {selectedNextStatus === 'Citizen Verification Pending' && <span className="text-red-400">* (Required)</span>}
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/... or image link"
                            value={completionPhotoUrl}
                            onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Proof of completed repair</span>
                            <div className="flex items-center gap-2.5">
                              <label className="cursor-pointer text-blue-400 hover:underline">
                                <span>Upload Photo File</span>
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    try {
                                      const formData = new FormData()
                                      formData.append('photo', file)
                                      const res = await api.post('/upload/single', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' },
                                      })
                                      if (res.data?.url) {
                                        setCompletionPhotoUrl(res.data.url)
                                      }
                                    } catch (err) {
                                      setNotice({
                                        type: 'error',
                                        message: 'Failed to upload photo: ' + (err.response?.data?.message || err.message),
                                      })
                                    }
                                  }}
                                />
                              </label>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setCompletionPhotoUrl('https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80')}
                                className="text-blue-400 hover:underline"
                              >
                                Sample Photo URL
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 8. Admin Remarks */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300">Official Municipal Remarks</label>
                          <textarea
                            rows={3}
                            placeholder="Enter official remarks, field instructions, or action notes (visible to citizen)..."
                            value={adminRemarks}
                            onChange={(e) => setAdminRemarks(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Save Changes Button */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/50 transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-wait disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={17} className="animate-spin" /> Saving & Dispatching...
                            </>
                          ) : (
                            <>
                              <Send size={17} /> Save & Apply Updates
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Citizen Profile Detail Modal */}
      {showCitizenModal && issue?.reporter && (
        <CitizenProfileModal
          citizenId={issue.reporter._id || issue.reporter.id || issue.reporter}
          citizenInitial={typeof issue.reporter === 'object' ? issue.reporter : null}
          onClose={() => setShowCitizenModal(false)}
          onSelectIssue={(newIssueId) => {
            setShowCitizenModal(false)
            navigate(`/admin/issues/${newIssueId}`)
          }}
        />
      )}
    </div>
  )
}
