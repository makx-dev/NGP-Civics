import { motion } from 'framer-motion'

function Pulse({ className }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-800/60 ${className}`}
    />
  )
}

function SkeletonCard() {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-700/30 bg-slate-900/30 p-4">
      <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <Pulse className="h-4 w-28" />
          <Pulse className="h-3 w-12" />
        </div>
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-full" />
        <div className="flex items-center gap-2">
          <Pulse className="h-4 w-24 rounded-md" />
          <Pulse className="h-3 w-20" />
        </div>
      </div>
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Group skeleton */}
      <div className="space-y-3">
        <div className="mb-3 flex items-center gap-2">
          <Pulse className="h-3 w-16" />
          <div className="h-px flex-1 bg-slate-700/20" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="space-y-3">
        <div className="mb-3 flex items-center gap-2">
          <Pulse className="h-3 w-20" />
          <div className="h-px flex-1 bg-slate-700/20" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </motion.div>
  )
}