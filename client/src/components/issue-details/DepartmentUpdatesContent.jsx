import { motion } from 'framer-motion'
import { Building2, HardHat, User, ShieldCheck, Clock } from 'lucide-react'

export default function DepartmentUpdatesContent({ history = [], department = 'NMC Civic Department', assignedOfficer, adminRemarks }) {
  // Extract updates from history or fallback to admin remarks
  const adminEvents = history.filter((h) => h.changedByAdmin || h.remark)

  return (
    <div className="space-y-3">
      {adminRemarks && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="mt-0.5 text-blue-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Official Municipal Note</p>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">"{adminRemarks}"</p>
            </div>
          </div>
        </div>
      )}

      {assignedOfficer && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
              <HardHat size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Field Engineer Dispatched</p>
              <p className="text-[11px] text-slate-400">{assignedOfficer} &middot; {department}</p>
            </div>
          </div>
        </div>
      )}

      {adminEvents.length === 0 && !adminRemarks ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-center text-xs text-slate-500">
          <Clock size={20} className="mx-auto mb-2 text-slate-600" />
          <p>No department updates posted yet.</p>
          <p className="mt-1 text-[11px] text-slate-600">Updates from the assigned municipal engineering team will appear here.</p>
        </div>
      ) : (
        adminEvents.map((event, idx) => (
          <motion.div
            key={event._id || idx}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                <Building2 size={13} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white">
                    {event.changedByAdmin?.name ? `Admin: ${event.changedByAdmin.name}` : department}
                  </p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(event.changedAt || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-blue-300">
                  {event.fromStatus} → {event.toStatus}
                </p>
                {event.remark && (
                  <p className="mt-1 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
                    {event.remark}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}
