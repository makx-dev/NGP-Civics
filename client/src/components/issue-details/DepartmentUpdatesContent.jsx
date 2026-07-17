import { motion } from 'framer-motion'
import { Building2, ChefHat, User } from 'lucide-react'

const updates = [
  {
    role: 'Engineer',
    name: 'Amit Verma',
    dept: 'NMC Road Department',
    message: 'Inspection completed. Pothole depth measures 4 inches. Work order issued to contractor.',
    time: '14 Jul 2026, 10:15 AM',
  },
  {
    role: 'Department',
    name: 'NMC Control Room',
    dept: 'NMC Road Department',
    message: 'Repair work started by contractor team. Estimated completion in 2 days.',
    time: '15 Jul 2026, 07:30 AM',
  },
  {
    role: 'Engineer',
    name: 'Amit Verma',
    dept: 'NMC Road Department',
    message: 'Repair completed. Quality check passed. Awaiting citizen verification.',
    time: '16 Jul 2026, 04:00 PM',
  },
]

const roleIcons = {
  Engineer: ChefHat,
  Department: Building2,
  Citizen: User,
}

export default function DepartmentUpdatesContent() {
  return (
    <div className="space-y-3">
      {updates.map((update, idx) => {
        const Icon = roleIcons[update.role]
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="rounded-lg border border-slate-700/30 bg-slate-800/40 p-3"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 text-blue-300">
                {Icon ? <Icon size={18} /> : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-white">
                    {update.role} &middot; {update.name}
                  </p>
                  <span className="shrink-0 text-[10px] text-slate-500">{update.time}</span>
                </div>
                <p className="text-xs text-slate-400">{update.dept}</p>
                <p className="mt-1 text-xs text-slate-300">{update.message}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

