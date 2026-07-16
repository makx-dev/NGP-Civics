import { motion } from 'framer-motion'
import { Check, Circle, Loader2 } from 'lucide-react'

const timelineSteps = [
  { key: 'submitted', label: 'Complaint Submitted', icon: Check },
  { key: 'assigned', label: 'Assigned to Department', icon: Check },
  { key: 'engineer', label: 'Engineer Assigned', icon: Check },
  { key: 'inspection', label: 'Inspection Scheduled', icon: Check },
  { key: 'work_started', label: 'Work Started', icon: Loader2 },
  { key: 'repair_completed', label: 'Repair Completed', icon: Circle },
  { key: 'citizen_verification', label: 'Waiting for Citizen Verification', icon: Circle },
  { key: 'resolved', label: 'Resolved', icon: Circle },
]

const stepData = [
  { key: 'submitted', timestamp: '12 Jul 2026, 09:15 AM', officer: 'You', dept: 'Citizen', remarks: 'Complaint submitted successfully.' },
  { key: 'assigned', timestamp: '12 Jul 2026, 11:30 AM', officer: 'Rahul Sharma', dept: 'NMC Control Room', remarks: 'Assigned to Road Department.' },
  { key: 'engineer', timestamp: '13 Jul 2026, 08:00 AM', officer: 'Amit Verma', dept: 'NMC Road Department', remarks: 'Engineer assigned for inspection.' },
  { key: 'inspection', timestamp: '14 Jul 2026, 10:15 AM', officer: 'Amit Verma', dept: 'NMC Road Department', remarks: 'Inspection completed. Work order issued.' },
  { key: 'work_started', timestamp: '15 Jul 2026, 07:30 AM', officer: 'Suresh Patil', dept: 'Contractor Team', remarks: 'Repair work has started.' },
  { key: 'repair_completed', timestamp: '16 Jul 2026, 04:00 PM', officer: 'Suresh Patil', dept: 'Contractor Team', remarks: 'Repair completed 2 hours ago.' },
  { key: 'citizen_verification', timestamp: null, officer: null, dept: null, remarks: 'Awaiting your confirmation.' },
  { key: 'resolved', timestamp: null, officer: null, dept: null, remarks: null },
]

export default function TimelineContent({ currentStatus }) {
  const statusOrder = ['Pending', 'Assigned', 'Engineer Assigned', 'Inspection', 'In Progress', 'Citizen Verification', 'Completed', 'Resolved', 'Rejected', 'Reopened']
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className="space-y-0">
      {timelineSteps.map((step, idx) => {
        const stepKey = step.key
        const data = stepData.find((d) => d.key === stepKey)
        const stepStatusOrder = ['submitted', 'assigned', 'engineer', 'inspection', 'work_started', 'repair_completed', 'citizen_verification', 'resolved']
        const stepIdx = stepStatusOrder.indexOf(stepKey)
        const isCompleted = stepIdx < currentIndex
        const isCurrent = stepIdx === currentIndex
        const isUpcoming = stepIdx > currentIndex

        const Icon = step.icon

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Vertical line */}
            {idx < timelineSteps.length - 1 && (
              <div className={`absolute left-[11px] top-6 w-0.5 ${
                isCompleted ? 'bg-green-500/60' : isCurrent ? 'bg-blue-500/40' : 'bg-slate-700'
              }`}
                style={{ height: 'calc(100% - 24px)' }}
              />
            )}

            {/* Icon */}
            <div className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
              isCompleted ? 'border-green-500 bg-green-500/20' :
              isCurrent ? 'border-blue-500 bg-blue-500/20' :
              'border-slate-700 bg-slate-800'
            }`}>
              {isCompleted ? (
                <Check size={12} className="text-green-400" />
              ) : isCurrent ? (
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${
                isCompleted ? 'text-green-300' :
                isCurrent ? 'text-blue-300' :
                'text-slate-500'
              }`}>
                {step.label}
              </p>
              {data?.timestamp && (
                <p className="mt-0.5 text-xs text-slate-500">{data.timestamp}</p>
              )}
              {data?.officer && data?.dept && (
                <p className="text-xs text-slate-500">
                  {data.officer} &middot; {data.dept}
                </p>
              )}
              {data?.remarks && (
                <p className="mt-1 text-xs text-slate-400">{data.remarks}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}