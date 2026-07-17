import { motion } from 'framer-motion'
import { UserPen, Lock, Bell, LogOut, ChevronRight } from 'lucide-react'

const actions = [
  { key: 'edit', label: 'Edit Profile', icon: UserPen },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'notifications', label: 'Notification Preferences', icon: Bell },
]

export default function ActionCard({ onAction, isSigningOut }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm"
    >
      <div className="p-2">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.key}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => onAction(action.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white ${
                index < actions.length - 1 ? 'border-b border-slate-700/30' : ''
              }`}
            >
              <Icon size={18} className="shrink-0 text-slate-500" />
              <span className="flex-1">{action.label}</span>
              <ChevronRight size={16} className="text-slate-600" />
            </motion.button>
          )
        })}
      </div>

      <div className="border-t border-slate-700/30 p-2">
        <motion.button
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => onAction('signout')}
          disabled={isSigningOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="flex-1">Sign Out</span>
          <ChevronRight size={16} className="text-red-500/50" />
        </motion.button>
      </div>
    </motion.div>
  )
}