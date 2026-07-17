import { AnimatePresence, motion } from 'framer-motion'
import NotificationCard from './NotificationCard'

export default function NotificationGroup({ label, notifications, onRead }) {
  if (!notifications || notifications.length === 0) return null

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-700/60 to-transparent" />
        <span className="text-[10px] font-medium text-slate-600">{notifications.length}</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <NotificationCard key={n._id || n.id} notification={n} onRead={onRead} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}