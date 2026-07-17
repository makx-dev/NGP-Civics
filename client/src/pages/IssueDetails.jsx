import { useEffect, useMemo, useState } from 'react'
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
import { getStoredIssues } from '../lib/issuesStore'
import { getAuth, clearAuth } from '../lib/auth'

const progressConfig = {
  Pending: 0,
  Assigned: 20,
  'Engineer Assigned': 30,
  Inspection: 40,
  'In Progress': 60,
  'Citizen Verification': 75,
  Completed: 100,
  Resolved: 100,
  Rejected: 100,
  Reopened: 10,
}

const defaultIssue = {
  id: '1',
  complaintId: 'NGP-2026-0421',
  title: 'Deep pothole near Gandhi Square causing accidents',
  category: 'Road',
  department: 'NMC Road Department',
  area: 'Gandhi Square',
  reportedDate: '12 Jul 2026',
  status: 'In Progress',
  estimatedResolution: '3 days',
  image: null,
  reporter: 'Manthan K.',
  ward: 'Ward 12',
  lat: 21.1458,
  lng: 79.0882,
}

function StatusProgress({ status }) {
  const p = progressConfig[status] ?? 0
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
  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="sticky top-0 z-40 -mx-4 border-b border-slate-700/40 bg-slate-950/70 px-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-0 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{issue.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">#{issue.complaintId}</span>
            <StatusProgress status={issue.status} />
          </div>
        </div>

        {showCitizenCTA && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              onClick={onCitizenAction}
              className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
            >
              Citizen Verification
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

  const [issue, setIssue] = useState(defaultIssue)
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

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setIsLoading(true)
      try {
        const stored = getStoredIssues()
        const match = stored.find((x) => String(x.id) === String(id) || String(x.complaintId) === String(id))
        if (match) {
          if (mounted) setIssue(match)
          return
        }

        try {
          const res = await api.get(`/issues/${id}`)
          if (mounted) setIssue((prev) => ({ ...prev, ...res.data }))
        } catch {
          if (mounted) setIssue((prev) => ({ ...prev, id: id || prev.id }))
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [id])

  const name = getAuth()?.account?.name || 'Citizen'
  const sidebarOffset = isMobile ? 0 : sidebarExpanded ? 260 : 72

  const signOut = () => {
    clearAuth()
    navigate('/auth')
  }

  const progress = useMemo(() => progressConfig[issue.status] ?? 0, [issue.status])

  const showCitizenCTA = issue.status === 'Citizen Verification'

  const onCitizenAction = () => {
    const el = document.getElementById('citizen-verification-section')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const estimatedCompletion = issue.estimatedResolution || 'Within 7 days'

  const layout = (content) => (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar mobileOpen={mobileMenuOpen} expanded={sidebarExpanded} isMobile={isMobile} name={name} onClose={() => setMobileMenuOpen(false)} onLogout={signOut} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar name={name} onMenu={() => (isMobile ? setMobileMenuOpen((o) => !o) : setSidebarExpanded((o) => !o))} />
        {content}
      </div>
    </div>
  )

  if (isLoading) {
    return layout(
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="h-28 w-full rounded-xl border border-slate-700/40 bg-slate-900/60" />
        </div>
      </main>
    )
  }

  return layout(
    <>
      <StickyTopBar issue={issue} onCitizenAction={onCitizenAction} showCitizenCTA={showCitizenCTA} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {/* Main */}
            <div className="min-w-0 space-y-6">
              <HeroCard issue={issue} />

              {issue.status === 'Citizen Verification' && (
                <div id="citizen-verification-section" className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-4 backdrop-blur-sm">
                  <CitizenVerification
                    issue={issue}
                    onReopen={() => {
                      setIssue((prev) => ({ ...prev, status: 'Reopened' }))
                      setTimeout(() => {
                        const updated = { ...issue, status: 'Reopened' }
                        setIssue(updated)
                      }, 100)
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <Accordion
                  title="Live Progress Timeline"
                  summary={`Latest update: ${issue.status === 'Citizen Verification' ? 'Awaiting your confirmation.' : issue.currentStage || 'In progress.'}`}
                  badge={progress ? `${progress}%` : undefined}
                >
                  <TimelineContent currentStatus={issue.status} />
                </Accordion>

                <Accordion title="Before & After Photos" summary="2 Photos Available" defaultOpen={false} badge="Photos">
                  <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="aspect-[4/3] rounded-lg bg-slate-800/50 p-3">
                        <p className="text-xs text-slate-500">Before</p>
                        <p className="mt-2 text-sm font-semibold">(Add image UI)</p>
                      </div>
                      <div className="aspect-[4/3] rounded-lg bg-slate-800/50 p-3">
                        <p className="text-xs text-slate-500">After</p>
                        <p className="mt-2 text-sm font-semibold">(Add image UI)</p>
                      </div>
                    </div>
                  </div>
                </Accordion>

                <Accordion title="Location" summary={issue.area ? `${issue.area}` : 'Location details'} badge="Map">
                  <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-3">
                    <PhotosContent
                      lat={issue.lat}
                      lng={issue.lng}
                      address={issue.area}
                      area={issue.area}
                      ward={issue.ward}
                    />
                  </div>
                </Accordion>

                <Accordion title="Department Updates" summary="Newest update first" badge="Updates">
                  <DepartmentUpdatesContent />
                </Accordion>

                <Accordion title="Complaint Information" summary="Category, Priority, and metadata" badge="Info">
                  <ComplaintInfoContent issue={issue} />
                </Accordion>

                <Accordion title="Status History" summary="Timeline table of all changes" badge="7 Changes" defaultOpen={false}>
                  <StatusHistoryContent />
                </Accordion>

                <Accordion title="Nearby Related Issues" summary="3 Similar Issues Nearby" badge="Nearby">
                  <NearbyIssuesContent />
                </Accordion>
              </div>
            </div>

            {/* Right side panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-[90px] space-y-4">
                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl shadow-black/10">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">Status</p>
                      <p className="mt-1 text-sm font-bold text-white">{issue.status}</p>
                    </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-400">Progress</p>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                    <p className="flex items-center justify-between text-xs text-slate-500">
                      <span>Completion</span>
                      <span className="font-semibold text-slate-200">{progress}%</span>
                    </p>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-lg border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Complaint ID</p>
                      <p className="mt-1 text-sm font-bold text-white">#{issue.complaintId}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Department</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">{issue.department}</p>
                    </div>
                    <div className="rounded-lg border border-slate-700/30 bg-slate-950/40 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">Estimated Completion</p>
                      <p className="mt-1 text-sm font-medium text-slate-200">{estimatedCompletion}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold text-slate-400">Quick Actions</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => downloadTextFile(`NGP_Civics_${issue.complaintId}.pdf`, `NGP Civics - Issue Report\n\nComplaint ID: ${issue.complaintId}\nTitle: ${issue.title}\nStatus: ${issue.status}\nDepartment: ${issue.department}\n\nGenerated: ${new Date().toISOString()}`)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                      >
                        Download PDF
                      </button>
                      <button
                        onClick={async () => {
                          const url = window.location.href
                          await safeShare(url)
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                      >
                        Print
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm">
                  <p className="text-xs font-semibold text-slate-400">Tip</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Only expand the sections you need. Everything here is designed for progressive disclosure.
                  </p>
                  <button
                    onClick={() => navigate('/citizen/issues')}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    Back to My Issues
                  </button>
                </div>
              </div>
            </aside>
          </div>

          {/* Mobile sticky-ish panel */}
          <div className="mt-6 lg:hidden">
            <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Status</p>
                  <p className="mt-1 text-sm font-bold text-white">{issue.status}</p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-1 text-[10px] font-semibold text-slate-300">{issue.priority}</span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-400">Progress</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full bg-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-700/30 bg-slate-950/40 p-3">
                  <p className="text-[11px] font-semibold text-slate-400">Complaint ID</p>
                  <p className="mt-1 text-sm font-bold text-white">#{issue.complaintId}</p>
                </div>
                <div className="rounded-lg border border-slate-700/30 bg-slate-950/40 p-3">
                  <p className="text-[11px] font-semibold text-slate-400">Estimated</p>
                  <p className="mt-1 text-sm font-medium text-slate-200">{estimatedCompletion}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadTextFile(`NGP_Civics_${issue.complaintId}.pdf`, `NGP Civics - Issue Report\n\nComplaint ID: ${issue.complaintId}\nTitle: ${issue.title}\nStatus: ${issue.status}\nDepartment: ${issue.department}\n\nGenerated: ${new Date().toISOString()}`)}
                  className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                >
                  Download PDF
                </button>
                <button
                  onClick={async () => {
                    const url = window.location.href
                    await safeShare(url)
                  }}
                  className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                >
                  Share
                </button>
                <button
                  onClick={() => window.print()}
                  className="col-span-2 flex items-center justify-center rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800/30"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}