import { motion } from 'framer-motion'
import { MapPin, Flag } from 'lucide-react'

export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-8 shadow-xl shadow-black/20 sm:p-10"
    >
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1.5 text-xs font-medium text-blue-400">
          <MapPin size={14} />
          Nagpur, Maharashtra
        </div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          <Flag size={36} className="text-blue-400" />
          Report a Civic Issue
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Help improve Nagpur by reporting issues accurately. Your report helps authorities
          respond faster and make our city better for everyone.
        </p>
      </div>
    </motion.section>
  )
}