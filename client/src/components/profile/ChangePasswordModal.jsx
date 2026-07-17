import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modal = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.15 } },
}

export default function ChangePasswordModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' })
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setForm({ current: '', newPass: '', confirm: '' })
      setError('')
      setTimeout(() => firstRef.current?.focus(), 100)
    }
  }, [isOpen])

  const validate = () => {
    if (!form.current) return 'Current password is required.'
    if (!form.newPass) return 'New password is required.'
    if (form.newPass.length < 6) return 'New password must be at least 6 characters.'
    if (form.newPass !== form.confirm) return 'Passwords do not match.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError('')
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 800))
    onSubmit({ currentPassword: form.current, newPassword: form.newPass })
    setIsSubmitting(false)
    onClose()
  }

  const toggleShow = (field) =>
    setShow((prev) => ({ ...prev, [field]: !prev[field] }))

  const fields = [
    {
      key: 'current',
      label: 'Current Password',
      value: form.current,
      visible: show.current,
      ref: firstRef,
    },
    {
      key: 'newPass',
      label: 'New Password',
      value: form.newPass,
      visible: show.newPass,
    },
    {
      key: 'confirm',
      label: 'Confirm New Password',
      value: form.confirm,
      visible: show.confirm,
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.button
            variants={backdrop}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close modal"
          />

          {/* Modal */}
          <motion.div
            variants={modal}
            className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 rounded-xl bg-red-500/10 px-3.5 py-2.5 text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`pw-${field.key}`}
                    className="mb-1.5 block text-xs font-medium text-slate-400"
                  >
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm transition-colors focus-within:border-slate-600">
                    <Lock size={16} className="shrink-0 text-slate-500" />
                    <input
                      ref={field.ref || null}
                      id={`pw-${field.key}`}
                      type={field.visible ? 'text' : 'password'}
                      value={field.value}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      placeholder="··········"
                      className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShow(field.key)}
                      className="shrink-0 text-slate-500 transition-colors hover:text-slate-300"
                      tabIndex={-1}
                    >
                      {field.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}