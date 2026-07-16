import { motion } from 'framer-motion'

const statusConfig = {
  Pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  Assigned: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  Inspection: { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  'In Progress': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', dot: 'bg-indigo-400' },
  Completed: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  'Citizen Verification': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  Resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Rejected: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  Reopened: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
}

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig.Pending
  const padding = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${padding}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </motion.span>
  )
}