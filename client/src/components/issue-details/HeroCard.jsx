import { motion } from 'framer-motion'
import { Building2, MapPin, Calendar, Download, Share2, Tag } from 'lucide-react'
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
    Pending: 0, Assigned: 20, 'Engineer Assigned': 30, Inspection: 40,
    'In Progress': 60, 'Citizen Verification': 75, Completed: 100,
    Resolved: 100, Rejected: 100, Reopened: 10,
  }
  const progress = progressConfig[issue.status] || 0

  const barColor =
    progress === 100 ? 'bg-green-500' : progress > 50 ? 'bg-blue-500' : progress > 0 ? 'bg-amber-500' : 'bg-slate-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/70 backdrop-blur-sm"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-800 sm:h-56">
        {issue.image ? (
          <img src={issue.image} alt={issue.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800/80">
            <Tag size={40} className="text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold leading-tight text-white sm:text-2xl">{issue.title}</h1>
              <p className="mt-1 text-xs text-slate-400">
                #{issue.complaintId} &middot; Reported {issue.reportedDate}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => downloadTextFile(`NGP_Civics_${issue.complaintId}.pdf`, `NGP Civics - Issue Report\n\nComplaint ID: ${issue.complaintId}\nTitle: ${issue.title}\nStatus: ${issue.status}\nDepartment: ${issue.department}\n\nGenerated: ${new Date().toISOString()}`)}
                className="rounded-lg border border-slate-700/50 bg-slate-900/80 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                title="Download Report PDF"
              >
                <Download size={16} />
              </button>
              <button
                onClick={async () => {
                  const url = window.location.href
                  await safeShare(url)
                }}
                className="rounded-lg border border-slate-700/50 bg-slate-900/80 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                title="Share Complaint"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} size="lg" />
          <span className="text-xs text-slate-500">
            Estimated resolution: {issue.estimatedResolution || 'Within 7 days'}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-400">Progress</span>
            <span className="font-medium text-slate-300">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <MetaItem icon={Building2} label="Department" value={issue.department} />
          <MetaItem icon={MapPin} label="Area" value={issue.area} />
          <MetaItem icon={Calendar} label="Reported" value={issue.reportedDate} />
          <MetaItem icon={Tag} label="Category" value={issue.category} />
        </div>
      </div>
    </motion.div>
  )
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-2.5">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Icon size={11} />
        <span>{label}</span>
      </div>
      <p className="mt-0.5 font-medium text-slate-200">{value}</p>
    </div>
  )
}