import { motion } from 'framer-motion'
import { CheckCircle, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'

export default function CitizenVerification({ issue, onReopen }) {
  const [showModal, setShowModal] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Only show if status is Citizen Verification
  if (issue.status !== 'Citizen Verification') return null

  if (confirmed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 backdrop-blur-sm sm:p-5"
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-green-400" />
          <div>
            <p className="text-sm font-semibold text-green-300">Verification submitted</p>
            <p className="text-xs text-green-400/70">Your response has been recorded. Thank you!</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 backdrop-blur-sm sm:p-5"
      >
        <h3 className="text-sm font-semibold text-white">Citizen Verification</h3>
        <p className="mt-1 text-xs text-slate-400">Is this issue actually resolved?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setConfirmed(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-500"
          >
            <CheckCircle size={14} />
            Yes, Issue Resolved
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
          >
            <RotateCcw size={14} />
            No, Reopen Complaint
          </button>
        </div>
      </motion.div>

      {/* Reopen Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Reopen Complaint</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400">Upload Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files[0])}
                  className="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-xs text-slate-300 file:mr-2 file:rounded file:border-0 file:bg-blue-600 file:px-2 file:py-0.5 file:text-xs file:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400">Reason for reopening</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why the issue is not resolved..."
                  className="mt-1 w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:border-blue-500/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSubmitting(true)
                  setTimeout(() => {
                    setSubmitting(false)
                    setShowModal(false)
                    setConfirmed(true)
                    if (onReopen) onReopen()
                  }, 1000)
                }}
                disabled={!reason.trim() || submitting}
                className="rounded-lg bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit & Reopen'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}