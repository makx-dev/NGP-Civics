import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  UserCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  XCircle,
  Building2,
  Hammer,
  Wrench,
} from 'lucide-react'

const typeConfig = {
  'Work Completed': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500' },
  'Issue Resolved': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-l-emerald-500' },
  'Engineer Assigned': { icon: Hammer, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-l-blue-500' },
  'Work Started': { icon: Wrench, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-l-cyan-500' },
  'Inspection Scheduled': { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-l-amber-500' },
  'Verification Requested': { icon: UserCheck, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-l-violet-500' },
  'Issue Reopened': { icon: RotateCcw, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-l-orange-500' },
  'Issue Submitted': { icon: Building2, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-l-sky-500' },
  'Status Changed': { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-l-yellow-500' },
}

function getRelativeTime(date) {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationCard({ notification, onRead }) {
  const navigate = useNavigate()
  const cfg = typeConfig[notification.type] || typeConfig['Status Changed']
  const Icon = cfg.icon
  const isUnread = !notification.isRead

  const handleClick = () => {
    if (isUnread && onRead) onRead(notification._id || notification.id)
    navigate(`/issues/${notification.issue?._id || notification.issue}`)
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={handleClick}
      className={`group relative flex w-full gap-3 rounded-2xl border border-slate-700/30 bg-slate-900/50 p-4 text-left transition-all duration-200 hover:bg-slate-900/80 hover:border-slate-600/50 hover:shadow-lg hover:shadow-black/20 ${
        isUnread ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
      }`}
    >
      {/* Icon */}
      <div
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${cfg.bg} ${cfg.color}`}
      >
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              isUnread ? 'font-semibold text-white' : 'font-medium text-slate-200'
            }`}
          >
            {notification.type}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap text-[11px] text-slate-500">
              {getRelativeTime(notification.createdAt)}
            </span>
            {isUnread && (
              <motion.span
                initial={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40"
              />
            )}
          </div>
        </div>

        <p className="mt-0.5 text-sm font-medium text-slate-100 line-clamp-1">
          {notification.issue?.title || notification.title}
        </p>

        <p className="mt-1 text-xs leading-relaxed text-slate-400 line-clamp-2">
          {notification.message}
        </p>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400">
            {notification.issue?.complaintId || notification.complaintId}
          </span>
          {notification.issue?.department && (
            <span className="truncate text-[10px] font-medium text-slate-500">
              {notification.issue.department}
            </span>
          )}
        </div>
      </div>

      {/* Unread left border indicator glow */}
      {isUnread && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-blue-500 opacity-70 shadow-sm shadow-blue-500/30" />
      )}
    </motion.button>
  )
}