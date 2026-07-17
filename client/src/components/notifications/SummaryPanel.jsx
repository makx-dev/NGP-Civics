import { motion } from 'framer-motion'
import { BellOff, CheckCheck, Settings, Eye, EyeOff } from 'lucide-react'

export default function SummaryPanel({
  unreadCount,
  todayCount,
  verificationPending,
  resolvedToday,
  onMarkAllRead,
  onSettings,
}) {
  const stats = [
    {
      label: 'Unread',
      value: unreadCount,
      icon: BellOff,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: "Today's Activity",
      value: todayCount,
      icon: Eye,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: 'Verification Pending',
      value: verificationPending,
      icon: EyeOff,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
    {
      label: 'Resolved Today',
      value: resolvedToday,
      icon: CheckCheck,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
  ]

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-700/30 bg-slate-900/50 p-3.5"
            >
              <div className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${s.bg} ${s.color}`}>
                <Icon size={14} />
              </div>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {unreadCount > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onMarkAllRead}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500"
          >
            <CheckCheck size={14} />
            Mark All as Read
          </motion.button>
        )}
        <button
          onClick={onSettings}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
        >
          <Settings size={14} />
          Notification Settings
        </button>
      </div>

      {/* Footer hint */}
      <p className="text-center text-[10px] leading-relaxed text-slate-600">
        Notifications auto-dismiss after 30 days.
      </p>
    </div>
  )
}