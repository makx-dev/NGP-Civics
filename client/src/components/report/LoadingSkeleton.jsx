export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 sm:p-10">
        <div className="mb-4 h-5 w-40 rounded-full bg-slate-800" />
        <div className="h-10 w-96 max-w-full rounded-lg bg-slate-800" />
        <div className="mt-3 h-5 w-[500px] max-w-full rounded bg-slate-800" />
      </div>

      {/* Stepper skeleton */}
      <div className="flex items-center gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-800" />
            <div className="hidden sm:block flex-1 space-y-1">
              <div className="h-4 w-20 rounded bg-slate-800" />
              <div className="h-3 w-16 rounded bg-slate-800" />
            </div>
            {i < 4 && <div className="hidden sm:block h-px flex-1 bg-slate-800" />}
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
        <div className="mb-6 h-6 w-32 rounded bg-slate-800" />
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-slate-800" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}