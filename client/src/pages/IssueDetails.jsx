import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/dashboard/Navbar'
import Sidebar from '../components/dashboard/Sidebar'
import Accordion from '../components/issue-details/Accordion'
import CitizenVerification from '../components/issue-details/CitizenVerification'
import HeroCard from '../components/issue-details/HeroCard'
import TimelineContent from '../components/issue-details/TimelineContent'
import DepartmentUpdatesContent from '../components/issue-details/DepartmentUpdatesContent'
import ComplaintInfoContent from '../components/issue-details/ComplaintInfoContent'
import StatusHistoryContent from '../components/issue-details/StatusHistoryContent'
import NearbyIssuesContent from '../components/issue-details/NearbyIssuesContent'
import PhotosContent from '../components/issue-details/PhotosContent'

import api from '../lib/api'
import { getAuth, clearAuth } from '../lib/auth'

const progressConfig = {
  'Complaint Submitted': 10,
  Pending: 10,
  'Assigned to Department': 25,
  Assigned: 25,
  'Engineer Assigned': 40,
  Inspection: 55,
  'Inspection Scheduled': 55,
  'In Progress': 70,
  'Work Started': 70,
  'Work Completed': 85,
  'Citizen Verification Pending': 90,
  'Citizen Verification': 90,
  Completed: 100,
  Resolved: 100,
  Rejected: 100,
  Reopened: 30,
  REOPENED: 30,
}

function StatusProgress({ status, progressValue }) {
  const p = typeof progressValue === 'number' ? progressValue : (progressConfig[status] ?? 20)
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-blue-500"
        />
      </div>
      <span className="text-xs font-semibold text-slate-200">{p}%</span>
    </div>
  )
}

function downloadTextFile(filename, contents) {
  const blob = new Blob([contents], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function safeShare(url) {
  if (navigator.share) {
    return navigator.share({ title: 'NGP Civics', text: 'Complaint details', url })
  }
  return navigator.clipboard.writeText(url)
}

function StickyTopBar({ issue, onCitizenAction, showCitizenCTA }) {
  if (!issue) return null
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative z-40 border-b border-slate-700/40 bg-slate-950/70 px-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-0 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{issue.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">#{issue.complaintId || issue._id}</span>
            <StatusProgress status={issue.status} progressValue={issue.progress} />
          </div>
        </div>

        {showCitizenCTA && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={onCitizenAction}
              className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
            >
              Verify Resolution
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function IssueDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  const [issue, setIssue] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  // Cross-role live sync: Fetch issue and history from MongoDB
  const fetchIssue = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true)
    try {
      const [res, histRes] = await Promise.all([
        api.get(`/issues/${id}`).catch(() => null),
        api.get(`/issues/${id}/history`).catch(() => null),
      ])

      if (res?.data) {
        setIssue(res.data)
      } else {
        setIssue(null)
      }

      if (Array.isArray(histRes?.data)) {
        setHistory(histRes.data)
      }
    } finally {
      if (!isBackground) setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchIssue()
  }, [fetchIssue])

  // Polling (12s) and window focus refetch
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchIssue(true)
      }
    }, 12000)

    const onFocus = () => fetchIssue(true)
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [fetchIssue])

  const name = getAuth()?.account?.name || 'Citizen'
  const sidebarOffset = isMobile ? 0 : sidebarExpanded ? 260 : 72

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  const liveProgress = issue
    ? typeof issue.progress === 'number'
      ? issue.progress
      : progressConfig[issue.status] ?? 20
    : 0

  const showCitizenCTA = issue
    ? ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(issue.status)
    : false

  const onCitizenAction = () => {
    const el = document.getElementById('citizen-verification-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const estimatedCompletion = issue?.estimatedResolutionDate
    ? new Date(issue.estimatedResolutionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : (issue?.estimatedResolution || 'Within 7 days')

  const layout = (content) => (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
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
        className="flex min-w-0 flex-1 flex-col"
      >
        <Navbar name={name} onMenu={() => (isMobile ? setMobileMenuOpen((o) => !o) : setSidebarExpanded((o) => !o))} />
        {content}
      </motion.div>
    </div>
  )

  if (isLoading) {
    return layout(
      <main className="flex-1">
        <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
          <div className="h-44 w-full animate-pulse rounded-2xl border border-slate-700/40 bg-slate-900/60" />
          <div className="h-64 w-full animate-pulse rounded-2xl border border-slate-700/40 bg-slate-900/60" />
        </div>
      </main>
    )
  }

  if (!issue) {
    return layout(
      <main className="flex-1">
        <div className="mx-auto w-full min-w-0 max-w-xl px-4 py-16 text-center">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white">Report Not Found</h2>
            <p className="mt-2 text-xs text-slate-400">
              The requested civic issue could not be loaded from the database. It may have been removed or the ID is invalid.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate('/issues')}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-blue-500"
              >
                Back to My Reports
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return layout(
    <>
      <StickyTopBar issue={issue} onCitizenAction={onCitizenAction} showCitizenCTA={showCitizenCTA} />
      <main className="flex-1">
        <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Main Column */}
            <div className="min-w-0 space-y-6">
              <HeroCard issue={issue} />

              {showCitizenCTA && (
                <div id="citizen-verification-section">
                  <CitizenVerification
                    issue={issue}
                    onVerified={(updated) => {
                      if (updated) setIssue((prev) => ({ ...prev, ...updated }))
                      fetchIssue(true)
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <Accordion
                  title="Live Progress Timeline"
                  summary={`Latest milestone: ${showCitizenCTA ? 'Awaiting your confirmation.' : issue.adminRemarks || issue.currentStage || 'In progress.'}`}
                  badge={liveProgress ? `${liveProgress}%` : undefined}
                >
                  <TimelineContent currentStatus={issue.status} history={history} />
                </Accordion>

                <Accordion title="Before & After Photo Comparison" summary="Visual Proof of Repair" defaultOpen={true} badge="Photos">
                  <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                        <p className="text-xs font-semibold text-amber-300">Before (Your Report)</p>
                        {Array.isArray(issue.photos) && issue.photos[0]?.url ? (
                          <img src={issue.photos[0].url} alt="Before" className="mt-2 h-44 w-full rounded-lg object-cover" />
                        ) : issue.image ? (
                          <img src={issue.image} alt="Before" className="mt-2 h-44 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="mt-2 flex h-44 items-center justify-center rounded-lg bg-slate-900 text-xs text-slate-500">
                            No initial photo
                          </div>
                        )}
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                        <p className="text-xs font-semibold text-emerald-400">After (Official Resolution Proof)</p>
                        {issue.completionPhoto ? (
                          <img src={issue.completionPhoto} alt="After" className="mt-2 h-44 w-full rounded-lg object-cover" />
                        ) : (
                          <div className="mt-2 flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-500">
                            <p className="font-medium text-slate-400">Completion photo being uploaded</p>
                            <p className="mt-1 text-[11px] text-slate-600">The field team will attach verified after photos once ground work finishes.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Accordion>

                <Accordion title="Location & Map" summary={issue.area || issue.location?.address || 'Nagpur Location'} badge="Map">
                  <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4">
                    <PhotosContent
                      lat={issue.lat || issue.location?.lat}
                      lng={issue.lng || issue.location?.lng}
                      address={issue.area || issue.location?.address}
                      area={issue.area || issue.location?.address}
                      ward={issue.ward}
                    />
                  </div>
                </Accordion>

                <Accordion title="Department Updates & Notes" summary="Official Engineering Remarks" badge="Updates">
                  <DepartmentUpdatesContent
                    history={history}
                    department={issue.department}
                    assignedOfficer={issue.assignedOfficer}
                    adminRemarks={issue.adminRemarks}
                  />
                </Accordion>

                <Accordion title="Complaint Information" summary="Category and metadata" badge="Info">
                  <ComplaintInfoContent issue={issue} />
                </Accordion>

                <Accordion title="Status Audit Trail" summary="Log of all workflow actions" badge="History" defaultOpen={false}>
                  <StatusHistoryContent history={history} />
                </Accordion>

                <Accordion title="Nearby Related Issues" summary="Similar Issues in Your Ward" badge="Nearby">
                  <NearbyIssuesContent currentIssueId={issue._id || issue.id} />
                </Accordion>
              </div>
            </div>

            {/* Right Side Sticky Panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-[72px] space-y-4">
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Current Status</p>
                    <p className="mt-1 text-sm font-bold text-white">{issue.status}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-400">Resolution Progress</p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${liveProgress}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className={`h-full rounded-full ${liveProgress >= 100 ? 'bg-emerald-500' : liveProgress >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                      />
                    </div>
                    <p className="flex items-center justify-between text-xs text-slate-500">
                      <span>Completion</span>
                      <span className="font-semibold text-slate-200">{liveProgress}%</span>
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Complaint ID</p>
                      <p className="mt-0.5 text-sm font-bold text-white">#{issue.complaintId || issue._id}</p>
                    </div>
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Department</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-200">{issue.department || 'NMC Civic Services'}</p>
                    </div>
                    {issue.assignedOfficer && (
                      <div className="rounded-xl border border-slate-700/30 bg-slate-950/40 p-3">
                        <p className="text-[11px] font-semibold text-blue-400">Field Engineer</p>
                        <p className="mt-0.5 text-xs font-medium text-white">{issue.assignedOfficer}</p>
                        {issue.assignedOfficerRole && (
                          <p className="text-[10px] text-slate-400">{issue.assignedOfficerRole}</p>
                        )}
                      </div>
                    )}
                    <div className="rounded-xl border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Target Resolution</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-200">{estimatedCompletion}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400">Quick Actions</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => downloadTextFile(`NGP_Civics_${issue.complaintId || id}.pdf`, `NGP Civics - Issue Report\n\nComplaint ID: ${issue.complaintId || id}\nTitle: ${issue.title}\nStatus: ${issue.status}\nDepartment: ${issue.department}\nField Officer: ${issue.assignedOfficer || 'Pending'}\nProgress: ${liveProgress}%\n\nGenerated: ${new Date().toISOString()}`)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/40"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={async () => {
                          const url = window.location.href
                          await safeShare(url)
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/40"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <button
                    onClick={() => navigate('/citizen/issues')}
                    className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Back to My Issues
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  )
}