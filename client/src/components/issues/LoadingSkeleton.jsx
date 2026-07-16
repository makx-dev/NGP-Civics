import { motion } from 'framer-motion'

function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-800/60 ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900/40">
      <SkeletonBlock className="h-40 sm:h-44 rounded-none" />
      <div className="space-y-2.5 p-4">
        <div className="flex gap-3">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <SkeletonBlock className="h-5 w-28" />
        <SkeletonBlock className="h-3 w-3/4" />
        <div className="flex items-center gap-2.5">
          <SkeletonBlock className="h-1.5 flex-1" />
          <SkeletonBlock className="h-3 w-8" />
        </div>
      </div>
    </div>
  )
}

export function CompactSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-slate-700/30 bg-slate-900/40 p-3">
      <SkeletonBlock className="h-12 w-12 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 flex-1" />
          <SkeletonBlock className="h-5 w-20" />
        </div>
        <div className="flex gap-3">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-3 w-12" />
        </div>
        <SkeletonBlock className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-1 flex-1" />
          <SkeletonBlock className="h-3 w-8" />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 p-4">
      <div className="space-y-3">
        <div className="flex gap-4 border-b border-slate-800/50 pb-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2.5">
            {Array.from({ length: 9 }).map((_, j) => (
              <SkeletonBlock key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoadingSkeleton({ viewMode = 'cards' }) {
  if (viewMode === 'compact') {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <CompactSkeleton />
          </motion.div>
        ))}
      </div>
    )
  }

  if (viewMode === 'table') {
    return <TableSkeleton />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <CardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}