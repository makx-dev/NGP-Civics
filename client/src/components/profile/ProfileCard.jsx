import { motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import Avatar from './Avatar'

export default function ProfileCard({ name, email, image, isLoading }) {
  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-slate-700/50" />
          <div className="h-6 w-48 rounded bg-slate-700/50" />
          <div className="h-4 w-32 rounded bg-slate-700/50" />
          <div className="mt-2 h-5 w-36 rounded-full bg-slate-700/50" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <Avatar name={name} image={image} size="xl" />

        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">{name || 'Citizen'}</h1>
          <p className="mt-0.5 text-sm text-slate-400">{email || '—'}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-400">
          <BadgeCheck size={14} />
          Verified Citizen
        </span>
      </div>
    </motion.div>
  )
}