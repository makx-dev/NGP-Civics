import { motion } from 'framer-motion'
import { Check, Circle, Clock, HardHat, Loader2, RotateCcw, ShieldCheck } from 'lucide-react'

const statusPipeline = [
  { key: 'Complaint Submitted', label: 'Complaint Submitted', icon: Check, desc: 'Registered on portal by resident.' },
  { key: 'Assigned to Department', label: 'Assigned to Department', icon: Check, desc: 'Routed to responsible municipal department.' },
  { key: 'Engineer Assigned', label: 'Engineer Assigned', icon: HardHat, desc: 'Field Engineer allocated for on-site work.' },
  { key: 'Inspection Scheduled', label: 'Inspection Scheduled', icon: Clock, desc: 'Site assessment and work plan.' },
  { key: 'Work Started', label: 'Work in Progress', icon: Loader2, desc: 'Ground repairs and material deployment.' },
  { key: 'Work Completed', label: 'Work Completed', icon: Check, desc: 'Maintenance finished and photo evidence uploaded.' },
  { key: 'Citizen Verification Pending', label: 'Citizen Verification', icon: ShieldCheck, desc: 'Resident review and confirmation.' },
  { key: 'Resolved', label: 'Resolved & Closed', icon: Check, desc: 'Case successfully completed.' },
]

export default function TimelineContent({ currentStatus, history = [] }) {
  const currentIndex = statusPipeline.findIndex((s) => s.key === currentStatus)
  const isReopened = currentStatus === 'REOPENED' || currentStatus === 'Reopened'

  return (
    <div className="space-y-0">
      {statusPipeline.map((step, idx) => {
        const isCompleted = currentIndex > idx || currentStatus === 'Resolved'
        const isCurrent = currentIndex === idx
        const isUpcoming = currentIndex < idx && currentStatus !== 'Resolved'

        // Match with history record if available
        const histMatch = history.find((h) => h.toStatus === step.key)

        return (
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Vertical connector line */}
            {idx < statusPipeline.length - 1 && (
              <div
                className={`absolute left-[11px] top-6 w-0.5 ${
                  isCompleted ? 'bg-emerald-500/60' : isCurrent ? 'bg-blue-500/50' : 'bg-slate-800'
                }`}
                style={{ height: 'calc(100% - 24px)' }}
              />
            )}

            {/* Stage Icon */}
            <div
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                isCompleted
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : isCurrent
                  ? 'border-blue-500 bg-blue-500/20 text-blue-400 animate-pulse'
                  : 'border-slate-700 bg-slate-800 text-slate-600'
              }`}
            >
              {isCompleted ? (
                <Check size={12} />
              ) : isCurrent ? (
                <div className="h-2 w-2 rounded-full bg-blue-400" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              )}
            </div>

            {/* Content description */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-xs font-semibold ${
                    isCompleted
                      ? 'text-emerald-300'
                      : isCurrent
                      ? 'text-blue-300'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </p>
                {histMatch?.changedAt && (
                  <span className="text-[10px] text-slate-500">
                    {new Date(histMatch.changedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-slate-400">{histMatch?.remark || step.desc}</p>
              {histMatch?.changedByAdmin?.name && (
                <p className="mt-0.5 text-[11px] text-blue-400">
                  Officer: {histMatch.changedByAdmin.name} ({histMatch.changedByAdmin.department || 'Authority'})
                </p>
              )}
            </div>
          </motion.div>
        )
      })}

      {isReopened && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
          <RotateCcw size={15} className="mt-0.5 shrink-0 text-rose-400" />
          <div>
            <span className="font-semibold">Issue Reopened by Citizen</span>
            <p className="text-slate-300">Ground repairs have been restarted for priority completion.</p>
          </div>
        </div>
      )}
    </div>
  )
}