import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, Calendar } from 'lucide-react'
import StatusBadge from './StatusBadge'

export default function CompactIssueCard({ issue, index }) {
  const navigate = useNavigate()

  const progressConfig = {
    Pending: { value: 0, color: 'bg-orange-500' },
    Assigned: { value: 20, color: 'bg-blue-500' },
    'Engineer Assigned': { value: 30, color: 'bg-blue-500' },
    Inspection: { value: 40, color: 'bg-blue-500' },
    'In Progress': { value: 60, color: 'bg-blue-500' },
    'Citizen Verification': { value: 75, color: 'bg-blue-500' },
    Completed: { value: 100, color: 'bg-green-500' },
    Resolved: { value: 100, color: 'bg-green-500' },
    Rejected: { value: 100, color: 'bg-red-500' },
    Reopened: { value: 10, color: 'bg-orange-500' },
  }

  const progress = progressConfig[issue.status] || { value: 0, color: 'bg-orange-500' }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      whileHover={{ x: 2 }}
      onClick={() => navigate(`/issues/${issue.id}`)}
      className="group flex cursor-pointer items-start gap-3.5 rounded-xl border border-slate-700/40 bg-slate-900/60 p-3 transition-all duration-200 hover:border-slate-600/50 hover:bg-slate-900/80"
    >
      {/* Thumbnail */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-800">
        {issue.image ? (
          <img src={issue.image} alt={issue.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-bold text-slate-600">
            {issue.category.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Title + Status */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="truncate text-sm font-medium text-white">{issue.title}</h4>
          <StatusBadge status={issue.status} />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Building2 size={10} />
            {issue.department}
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} />
            {issue.area}
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={10} />
            {issue.reportedDate}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500">{issue.category}</span>
          <span className="font-mono text-slate-600">#{issue.complaintId}</span>
        </div>

        {/* Current Stage */}
        {issue.currentStage && (
          <p className="truncate text-xs text-slate-500">
            <span className="font-medium text-slate-500">Stage:</span> {issue.currentStage}
          </p>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.value}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full rounded-full ${progress.color}`}
            />
          </div>
          <span className="text-xs font-medium text-slate-500">{progress.value}%</span>
        </div>
      </div>
    </motion.div>
  )
}