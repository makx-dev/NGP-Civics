import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Calendar, Globe, User } from 'lucide-react'

const fields = [
  { key: 'name', label: 'Full Name', icon: User },
  { key: 'email', label: 'Email Address', icon: Mail },
  { key: 'phone', label: 'Phone Number', icon: Phone },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'memberSince', label: 'Member Since', icon: Calendar },
  { key: 'language', label: 'Language', icon: Globe },
]

function formatValue(value, key) {
  if (!value) return '—'
  if (key === 'memberSince') {
    const d = new Date(value)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
  return value
}

export default function AccountInfoCard({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="mb-5 h-5 w-40 rounded bg-slate-700/50" />
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded bg-slate-700/50" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-16 rounded bg-slate-700/50" />
                <div className="h-4 w-40 rounded bg-slate-700/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm"
    >
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Account Information
      </h2>

      <div className="space-y-5">
        {fields.map((field) => {
          const Icon = field.icon
          const value = data?.[field.key]

          return (
            <div key={field.key} className="flex items-start gap-3">
              <Icon
                size={16}
                className="mt-0.5 shrink-0 text-slate-500"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  {field.label}
                </p>
                <p className="mt-0.5 text-sm text-slate-200">
                  {formatValue(value, field.key)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}