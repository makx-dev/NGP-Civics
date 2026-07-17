export default function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800" />
        ))}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <div className="h-24 rounded-2xl bg-slate-800/70" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-800/70" />
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-56 rounded-2xl bg-slate-800/70" />
          <div className="h-64 rounded-2xl bg-slate-800/70" />
        </div>
      </div>
    </div>
  )
}

