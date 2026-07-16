import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FilePlus2, Inbox } from 'lucide-react'

export default function EmptyState() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center rounded-xl border border-slate-700/50 bg-slate-900/40 px-6 py-16 backdrop-blur-sm"
    >
      <div className="mb-6 rounded-full bg-slate-800 p-5">
        <Inbox size={40} className="text-slate-600" />
      </div>
      <h2 className="text-xl font-semibold text-white">No complaints submitted yet</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-400">
        Report your first civic issue to help improve Nagpur.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/citizen/report')}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500"
      >
        <FilePlus2 size={18} />
        Report Issue
      </motion.button>
    </motion.div>
  )
}