import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, MapPin, Globe, ImageUp, Loader2 } from 'lucide-react'
import Avatar from './Avatar'

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

export default function EditProfileModal({ isOpen, onClose, data, onSave }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '', language: '' })
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileRef = useRef(null)
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (isOpen && data) {
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        address: data.address || '',
        language: data.language || '',
      })
      setImagePreview(null)
    }
  }, [isOpen, data])

  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 600))
    onSave({
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      language: form.language.trim(),
      image: imagePreview || data?.image,
    })
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
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Avatar upload */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar
                  name={form.name || data?.name}
                  image={imagePreview || data?.image}
                  size="xl"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-slate-600 bg-slate-800 text-slate-300 shadow-lg transition-colors hover:bg-slate-700"
                >
                  <ImageUp size={14} />
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-slate-500">Click the icon to change photo</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email Address
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm text-slate-500">
                  <Mail size={16} className="shrink-0 text-slate-600" />
                  <span>{data?.email || '—'}</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label
                  htmlFor="edit-name"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Full Name
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm transition-colors focus-within:border-slate-600">
                  <User size={16} className="shrink-0 text-slate-500" />
                  <input
                    ref={firstInputRef}
                    id="edit-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="edit-phone"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Phone Number
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm transition-colors focus-within:border-slate-600">
                  <Phone size={16} className="shrink-0 text-slate-500" />
                  <input
                    id="edit-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="edit-address"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Address <span className="text-slate-600">(optional)</span>
                </label>
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm transition-colors focus-within:border-slate-600">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
                  <textarea
                    id="edit-address"
                    rows={2}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Your residential address"
                    className="min-w-0 flex-1 resize-none bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label
                  htmlFor="edit-language"
                  className="mb-1.5 block text-xs font-medium text-slate-400"
                >
                  Preferred Language <span className="text-slate-600">(optional)</span>
                </label>
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2.5 text-sm transition-colors focus-within:border-slate-600">
                  <Globe size={16} className="shrink-0 text-slate-500" />
                  <input
                    id="edit-language"
                    type="text"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    placeholder="e.g. English, Hindi, Marathi"
                    className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

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
                  disabled={isSubmitting || !form.name.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}