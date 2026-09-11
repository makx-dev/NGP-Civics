import { motion } from 'framer-motion'
import { Building2, MapPin, Calendar, Download, Share2, Tag, HardHat, Phone, Clock } from 'lucide-react'
import StatusBadge from '../issues/StatusBadge'

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

export default function HeroCard({ issue }) {
  const progressConfig = {
    'Complaint Submitted': 10,
    Pending: 10,
    'Assigned to Department': 25,
    Assigned: 25,
    'Engineer Assigned': 40,
    Inspection: 55,
    'Inspection Scheduled': 55,
    'Work Started': 70,
    'In Progress': 70,
    'Work Completed': 85,
    'Citizen Verification Pending': 90,
    'Citizen Verification': 90,
    Resolved: 100,
    Completed: 100,
    Rejected: 100,
    Reopened: 30,
    REOPENED: 30,
  }

  const liveProgress = typeof issue.progress === 'number' ? issue.progress : (progressConfig[issue.status] || 15)

  const barColor =
    liveProgress >= 100 ? 'bg-emerald-500' : liveProgress >= 60 ? 'bg-blue-500' : 'bg-amber-500'

  const categoryName = typeof issue.category === 'object' ? issue.category?.name : (issue.category || 'General')
  const departmentName = issue.department || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.department : null) || 'NMC Civic Services'
  const areaName = issue.area || issue.ward || issue.location?.address || 'Nagpur'
  const complaintCode = issue.complaintId || (issue._id ? `NGP-${String(issue._id).slice(-6).toUpperCase()}` : 'CIVIC-REQ')
  const reportedDateText = issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent')
  const imageSrc = issue.image || (Array.isArray(issue.photos) && issue.photos[0]?.url) || (Array.isArray(issue.images) && issue.images[0]) || null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl backdrop-blur-sm"
    >
      {/* Image Banner */}
      <div className="relative h-48 overflow-hidden bg-slate-800 sm:h-64">
        {imageSrc ? (
          <img src={imageSrc} alt={issue.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800/80">
            <Tag size={44} className="text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-xs font-bold text-blue-400">#{complaintCode}</span>
              <h1 className="mt-1 text-xl font-bold leading-tight text-white sm:text-2xl">{issue.title}</h1>
              <p className="mt-1 text-xs text-slate-400">
                Reported {reportedDateText}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => downloadTextFile(`NGP_Civics_${complaintCode}.pdf`, `NGP Civics - Issue Report\n\nComplaint ID: ${complaintCode}\nTitle: ${issue.title}\nStatus: ${issue.status}\nDepartment: ${departmentName}\nAssigned Officer: ${issue.assignedOfficer || 'Pending'}\nProgress: ${liveProgress}%\n\nGenerated: ${new Date().toISOString()}`)}
                className="rounded-xl border border-slate-700/60 bg-slate-900/90 p-2.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                title="Download Report PDF"
              >
                <Download size={16} />
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href
                  await safeShare(url)
                }}
                className="rounded-xl border border-slate-700/60 bg-slate-900/90 p-2.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                title="Share Complaint"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Body */}
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} size="lg" />
            <span className="text-xs text-slate-400">
              {issue.status === 'Resolved' ? 'Completed & Verified' : 'Resolution in Progress'}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            SLA Target: {issue.estimatedResolutionDate ? new Date(issue.estimatedResolutionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (issue.estimatedResolution || 'Within 7 days')}
          </span>
        </div>

        {/* Live Synced Progress Bar */}
        <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Live Municipal Progress</span>
            <span className="font-mono text-blue-400">{liveProgress}% Completed</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${liveProgress}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        {/* Assigned Officer Spotlight (If assigned by Admin) */}
        {issue.assignedOfficer && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
                <HardHat size={16} />
              </div>
              <div>
                <p className="font-semibold text-white">Field Engineer: {issue.assignedOfficer}</p>
                <p className="text-slate-400">{issue.assignedOfficerRole || 'Municipal Engineer'} • {departmentName}</p>
              </div>
            </div>
            {issue.assignedOfficerPhone && (
              <span className="inline-flex items-center gap-1 font-mono text-blue-300">
                <Phone size={12} /> {issue.assignedOfficerPhone}
              </span>
            )}
          </div>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <MetaItem icon={Building2} label="Department" value={departmentName} />
          <MetaItem icon={MapPin} label="Location / Area" value={areaName} />
          <MetaItem icon={Calendar} label="Inspection Date" value={issue.scheduledInspectionDate ? new Date(issue.scheduledInspectionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'To be scheduled'} />
          <MetaItem icon={Tag} label="Category" value={categoryName} />
        </div>
      </div>
    </motion.div>
  )
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon size={13} />
        <span>{label}</span>
      </div>
      <p className="mt-1 font-medium text-slate-200">{value}</p>
    </div>
  )
}