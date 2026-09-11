import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendDirection,
  isActive = false,
}) {
  const TrendIcon =
    trendDirection === 'down'
      ? ArrowDownRight
      : trendDirection === 'up'
      ? ArrowUpRight
      : Minus

  return (
    <article
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isActive
          ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/40'
          : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900/90 shadow-md shadow-black/20'
      }`}
      aria-label={label}
    >
      {/* Ambient subtle top border highlight */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] transition-opacity duration-300 ${
          isActive
            ? 'bg-blue-500 opacity-100'
            : 'bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white font-mono sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors ${
            isActive
              ? 'border-blue-500/50 bg-blue-600/20 text-blue-300'
              : 'border-slate-800 bg-slate-950 text-blue-400 group-hover:border-blue-500/30 group-hover:text-blue-300'
          }`}
        >
          <Icon size={19} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300">
          <TrendIcon
            size={13}
            className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}
          />
          <span className="truncate">{trend}</span>
        </span>

        <span
          className={`text-[10px] font-semibold uppercase tracking-wider transition-colors ${
            isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
          }`}
        >
          {isActive ? 'Active' : 'Filter'}
        </span>
      </div>
    </article>
  )
}


