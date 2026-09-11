import { motion } from 'framer-motion'
import { CheckCircle, RotateCcw, Star, X, Loader2, ThumbsUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import api from '../../lib/api'

export default function CitizenVerification({ issue, onVerified }) {
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [showFixedModal, setShowFixedModal] = useState(false)
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [submittedMessage, setSubmittedMessage] = useState(null)
  const [error, setError] = useState(null)

  // Only show if status is awaiting verification
  const isAwaitingVerification = ['Citizen Verification Pending', 'Citizen Verification', 'Work Completed'].includes(issue.status)
  if (!isAwaitingVerification && !submittedMessage) return null

  const handleVerifyFixed = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post(`/issues/${issue._id || issue.id}/verification`, {
        decision: 'Fixed',
        feedback: feedback.trim() || 'Work verified and confirmed fixed by citizen.',
        rating: Number(rating),
      })
      setShowFixedModal(false)
      setSubmittedMessage('Thank you! You have confirmed this issue as resolved. Nagpur Municipal Corporation appreciates your civic contribution.')
      if (onVerified) onVerified(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit confirmation.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReopen = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await api.post(`/issues/${issue._id || issue.id}/verification`, {
        decision: 'Not Fixed',
        remark: reason.trim(),
        feedback: reason.trim(),
      })
      setShowReopenModal(false)
      setSubmittedMessage('Issue reopened for municipal attention. Authorities have been alerted.')
      if (onVerified) onVerified(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reopen issue.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submittedMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/30 bg-emerald-950/80 p-5 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <CheckCircle size={22} className="shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-semibold text-emerald-200">Verification Recorded</p>
            <p className="mt-0.5 text-xs text-emerald-300/80">{submittedMessage}</p>
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
        className="rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
              <CheckCircle size={13} /> Action Required
            </div>
            <h3 className="mt-2 text-base font-bold text-white">Citizen Verification Required</h3>
            <p className="mt-1 text-xs text-slate-300">
              Municipal authorities reported this work as complete. Please inspect the after photo and confirm if the issue is solved.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setShowFixedModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-500"
            >
              <ThumbsUp size={14} />
              Yes, Mark as Fixed
            </button>
            <button
              onClick={() => setShowReopenModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
            >
              <RotateCcw size={14} />
              Issue Still Persists (Reopen)
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-200">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>

      {/* Confirmation & Rating Modal */}
      {showFixedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Confirm Resolution & Rate Service</h3>
              <button onClick={() => setShowFixedModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Rate Municipal Workmanship</label>
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={star <= rating ? 'fill-amber-400' : 'text-slate-600'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-200">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Citizen Feedback / Remarks (optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="e.g. Excellent work, road was paved smoothly and cleaned up properly..."
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFixedModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyFixed}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Confirm & Close Issue
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Reopen Complaint</h3>
              <button onClick={() => setShowReopenModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Please explain why the issue is not resolved so that authorities can dispatch follow-up maintenance.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Reason for reopening <span className="text-red-400">*</span></label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  placeholder="Describe what is still broken or incomplete..."
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopen}
                disabled={!reason.trim() || submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-rose-500 disabled:opacity-50"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Submit & Reopen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}