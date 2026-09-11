import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, Calendar } from 'lucide-react'
import StatusBadge from './StatusBadge'

export default function IssueCard({ issue, index, onSelect }) {
  const navigate = useNavigate()

  const progressConfig = {
    Pending: { value: 0, color: 'bg-orange-500' },
    'Complaint Submitted': { value: 0, color: 'bg-orange-500' },
    Assigned: { value: 20, color: 'bg-blue-500' },
    'Assigned to Department': { value: 20, color: 'bg-blue-500' },
    'Engineer Assigned': { value: 30, color: 'bg-blue-500' },
    Inspection: { value: 40, color: 'bg-blue-500' },
    'Inspection Scheduled': { value: 40, color: 'bg-blue-500' },
    'In Progress': { value: 60, color: 'bg-blue-500' },
    'Work Started': { value: 60, color: 'bg-blue-500' },
    'Work Completed': { value: 75, color: 'bg-teal-500' },
    'Citizen Verification': { value: 75, color: 'bg-blue-500' },
    'Citizen Verification Pending': { value: 75, color: 'bg-cyan-500' },
    Completed: { value: 100, color: 'bg-green-500' },
    Resolved: { value: 100, color: 'bg-green-500' },
    Rejected: { value: 100, color: 'bg-red-500' },
    Reopened: { value: 10, color: 'bg-orange-500' },
    REOPENED: { value: 10, color: 'bg-orange-500' },
  }

  const progress = progressConfig[issue.status] || { value: 0, color: 'bg-orange-500' }
  const progressVal = typeof issue.progress === 'number' ? issue.progress : progress.value
  const categoryName = typeof issue.category === 'object' ? issue.category?.name : issue.category || 'General'
  const issueId = issue._id || issue.id
  const complaintCode = issue.complaintId || `NGP-${String(issueId).slice(-4).toUpperCase()}`
  const areaName = issue.area || issue.location?.address || 'Nagpur'
  const departmentName = issue.department || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.department : null) || 'NMC Civic Services'
  const reportedFormatted = issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent')
  const photoUrl = issue.image || (Array.isArray(issue.photos) && issue.photos[0]?.url ? issue.photos[0].url : null)

  const handleClick = () => {
    if (onSelect) {
      onSelect(issueId)
    } else {
      navigate(`/issues/${issueId}`)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      onClick={handleClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-slate-700/40 bg-slate-900/70 transition-all duration-200 hover:border-slate-600/60 hover:bg-slate-900"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden bg-slate-800 sm:h-44">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={issue.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-800/80">
            <span className="text-3xl font-bold tracking-tight text-slate-700">
              {categoryName.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/85 to-transparent p-3 pb-3.5">
          <h3 className="text-base font-semibold leading-snug text-white sm:text-lg">
            {issue.title}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2.5 p-4">
        {/* Department • Location • Date */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Building2 size={11} />
            {departmentName}
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} />
            {areaName}
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} />
            {reportedFormatted}
          </span>
        </div>

        {/* Category • Complaint ID */}
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {categoryName}
          </span>
          <span className="font-mono text-[11px] text-slate-500">#{complaintCode}</span>
        </div>

        {/* Status badge */}
        <div>
          <StatusBadge status={issue.status} />
        </div>

        {/* Current Stage or Remarks */}
        {(issue.currentStage || issue.adminRemarks) && (
          <p className="text-xs leading-relaxed text-slate-400">
            <span className="font-medium text-slate-500">Update:</span>{' '}
            {issue.adminRemarks || issue.currentStage}
          </p>
        )}

        {/* Progress bar + percentage */}
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressVal}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className={`h-full rounded-full ${progressVal >= 100 ? 'bg-emerald-500' : progressVal >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
            />
          </div>
          <span className="w-8 text-right text-xs font-medium text-slate-400">
            {progressVal}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}