import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, BellRing, Mail, Smartphone, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react'

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

const defaultSettings = [
  { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive updates via email' },
  { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Receive push notifications on your device' },
  { key: 'verification', label: 'Verification Reminders', icon: AlertTriangle, description: 'Get reminded to verify completed work' },
  { key: 'status', label: 'Status Updates', icon: RefreshCw, description: 'Get notified when issue status changes' },
]

export default function NotificationSettingsModal({ isOpen, onClose, settings, onSave }) {
  const [toggles, setToggles] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setToggles(
        settings || {
          email: true,
          push: true,
          verification: true,
          status: true,
        },
      )
    }
  }, [isOpen, settings])

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    onSave(toggles)
    setIsSubmitting(false)
    onClose()
  }

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
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-xs text-slate-500">Manage your notification preferences</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              {defaultSettings.map((item) => {
                const Icon = item.icon
                const isOn = toggles[item.key]
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggle(item.key)}
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-slate-800/50"
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isOn ? 'text-blue-400' : 'text-slate-600'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                    <div
                      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                        isOn ? 'bg-blue-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          isOn ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-700/30 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Saving…' : 'Save Preferences'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}