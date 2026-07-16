import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react'

export default function SuccessModal({ open, complaintId, onTrack, onDashboard }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-black/30"
          >
            {/* Background decoration */}
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 15, stiffness: 200 }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/10"
              >
                <CheckCircle size={44} className="text-blue-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white">Report Submitted!</h2>
              <p className="mt-2 text-sm text-slate-400">
                Your report has been submitted successfully. The authorities will review it shortly.
              </p>

              <div className="mx-auto mt-6 max-w-xs rounded-xl border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-xs font-medium text-slate-500">Complaint ID</p>
                <p className="mt-1 text-lg font-bold tracking-wide text-blue-400">
                  {complaintId}
                </p>
              </div>

              <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-xs font-medium text-green-400">Status: Submitted</span>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onTrack}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
                >
                  Track Complaint
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={onDashboard}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-700"
                >
                  <LayoutDashboard size={16} />
                  Return Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}