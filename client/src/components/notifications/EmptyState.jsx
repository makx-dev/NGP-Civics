import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'

export default function EmptyState({ hasFilters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-slate-700/40 bg-slate-900/60">
        <Bell size={28} className="text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">You're all caught up</h3>
      <p className="mt-1 max-w-xs text-center text-sm text-slate-500">
        {hasFilters
          ? 'No notifications match this filter.'
          : 'No new notifications at the moment.'}
      </p>
    </motion.div>
  )
}