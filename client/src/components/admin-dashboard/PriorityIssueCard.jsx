import { ArrowUpRight, Clock3, Tag, Building2, MapPin, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'

const priorityBadge = {
  High: 'border-blue-500/40 bg-blue-500/15 text-blue-300 font-semibold',
  Medium: 'border-slate-700 bg-slate-800/80 text-slate-300',
  Low: 'border-slate-800 bg-slate-950/60 text-slate-400',
}

const statusTint = {
  'Complaint Submitted': 'border-slate-800 bg-slate-950/60 text-slate-300',
  Pending: 'border-slate-800 bg-slate-950/60 text-slate-300',
  'Assigned to Department': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  Assigned: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Engineer Assigned': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Inspection Scheduled': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  Inspection: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Work Started': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'In Progress': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Work Completed': 'border-slate-700 bg-slate-800/80 text-slate-200',
  'Citizen Verification Pending': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  'Citizen Verification': 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  REOPENED: 'border-blue-400/40 bg-blue-950/50 text-blue-200',
  Reopened: 'border-blue-400/40 bg-blue-950/50 text-blue-200',
  Completed: 'border-slate-700 bg-slate-800/80 text-slate-200',
  Resolved: 'border-slate-700 bg-slate-800/80 text-slate-200',
}

function statusClass(status) {
  return statusTint[status] || 'border-slate-800 bg-slate-950/60 text-slate-300'
}

export default function PriorityIssueCard({ issue, onOpenIssue, onQuickAction }) {
  const issueId = issue._id || issue.id
  const priority = issue.priority || 'Medium'
  const prClass = priorityBadge[priority] || priorityBadge.Medium
  const stClass = statusClass(issue.status)

  const categoryName = typeof issue.category === 'object' ? (issue.category?.name || 'General') : (issue.category || 'General')
  const categoryInitials = (categoryName || 'IS').slice(0, 2).toUpperCase()
  const complaintId = issue.complaintId || (issueId ? `#${String(issueId).slice(-6).toUpperCase()}` : 'CIVIC-REQ')
  const locationText = issue.ward || issue.area || issue.location?.address || 'Nagpur'
  const reportedDateText = issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recent')
  const imageSrc = issue.image || (Array.isArray(issue.photos) && issue.photos[0]?.url ? issue.photos[0].url : null) || (Array.isArray(issue.images) && issue.images[0]) || null
  const departmentText = issue.department || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.department : null)
  const reporterName = typeof issue.reporter === 'object' ? issue.reporter?.name : (typeof issue.reporter === 'string' ? 'Citizen' : 'Citizen')

  return (
    <motion.article
      onClick={() => onOpenIssue(issueId)}
      whileHover={{ y: -2 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg shadow-black/10 transition-colors hover:border-slate-700 hover:bg-slate-900/90"
    >
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          {imageSrc ? (
            <img src={imageSrc} alt={issue.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-blue-400">
              {categoryInitials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-mono font-semibold text-blue-400">{complaintId}</p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">{issue.title}</h3>
            </div>

            <span className={`rounded-xl border px-2.5 py-0.5 text-[11px] ${prClass}`}> {priority} </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 text-blue-300 font-medium">
              <UserRound size={13} className="text-blue-400" /> {reporterName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag size={13} className="text-slate-500" /> {categoryName}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} className="text-slate-500" /> {locationText}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={13} className="text-slate-500" /> {reportedDateText}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-xl border px-2.5 py-0.5 text-[11px] font-medium ${stClass}`}>
              {issue.status}
            </span>
            {departmentText ? (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/40 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Building2 size={13} className="text-blue-400" /> {departmentText}
              </span>
            ) : (
              <span className="rounded-xl border border-slate-800 bg-slate-950/40 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                Unassigned
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/60 pt-3">
            <p className="truncate text-xs text-slate-500">Stage: {issue.currentStage || issue.status || '—'}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickAction ? onQuickAction(issue) : onOpenIssue(issueId)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              {departmentText ? 'Continue' : 'Assign'}
              <ArrowUpRight size={14} className="text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

