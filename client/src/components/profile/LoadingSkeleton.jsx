import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[700px] space-y-6 px-4 py-8 sm:px-0">
      {/* Card 1 skeleton */}
      <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-900/50 p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-slate-700/50" />
          <div className="h-6 w-48 rounded bg-slate-700/50" />
          <div className="h-4 w-32 rounded bg-slate-700/50" />
          <div className="h-5 w-36 rounded-full bg-slate-700/50" />
        </div>
      </div>

      {/* Card 2 skeleton */}
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

      {/* Card 3 skeleton */}
      <div className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-900/50 p-2 backdrop-blur-sm">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-slate-700/30 px-4 py-3.5"
          >
            <div className="h-5 w-5 rounded bg-slate-700/50" />
            <div className="h-4 w-32 rounded bg-slate-700/50" />
          </div>
        ))}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className="h-5 w-5 rounded bg-slate-700/50" />
          <div className="h-4 w-24 rounded bg-slate-700/50" />
        </div>
      </div>
    </div>
  )
}