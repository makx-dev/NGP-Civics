import { ArrowUpRight, Clock3, Tag, Building2, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

const priorityBadge = {
  High: 'border-red-500/35 bg-red-500/10 text-red-300',
  Medium: 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  Low: 'border-green-500/35 bg-green-500/10 text-green-300',
}

const statusTint = {
  Pending: 'border-slate-700 bg-slate-900/60 text-slate-200',
  Assigned: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  'Engineer Assigned': 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  Inspection: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  'In Progress': 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  'Citizen Verification': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
  Reopened: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  Completed: 'border-green-500/30 bg-green-500/10 text-green-200',
  Resolved: 'border-green-500/30 bg-green-500/10 text-green-200',
}

function statusClass(status) {
  return statusTint[status] || 'border-slate-700 bg-slate-900/60 text-slate-200'
}

export default function PriorityIssueCard({ issue, onOpenIssue, onQuickAction }) {
  const priority = issue.priority || 'Medium'
  const prClass = priorityBadge[priority] || priorityBadge.Medium
  const stClass = statusClass(issue.status)

  return (
    <motion.article
      onClick={() => onOpenIssue(issue.id)}
      whileHover={{ y: -2 }}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4 shadow-lg shadow-black/10 transition-colors hover:border-slate-600/70"
    >
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/60">
          {issue.image ? (
            <img src={issue.image} alt={issue.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-500">
              {(issue.category || 'Issue').slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400">{issue.complaintId}</p>
              <h3 className="mt-1 truncate text-sm font-semibold text-white">{issue.title}</h3>
            </div>

            <span className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold ${prClass}`}> {priority} </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Tag size={14} /> {issue.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} /> {issue.ward || issue.area}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={14} /> {issue.reportedDate}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold ${stClass}`}>
              {issue.status}
            </span>
            {issue.department ? (
              <span className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/30 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                <Building2 size={14} /> {issue.department}
              </span>
            ) : (
              <span className="rounded-xl border border-slate-700 bg-slate-950/30 px-2.5 py-1 text-[11px] font-medium text-slate-400">
                Unassigned
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="truncate text-xs text-slate-500">Current stage: {issue.currentStage || '—'}</p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onQuickAction(issue)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-950/20 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-800/30"
            >
              {issue.department ? 'Continue' : 'Assign'}
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

