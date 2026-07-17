import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

const toneConfig = {
  slate: {
    container: 'border-slate-700 bg-slate-800/70',
    iconBg: 'bg-slate-900 text-slate-200',
    value: 'text-white',
    label: 'text-slate-300',
    border: 'border-slate-700',
  },
  blue: {
    container: 'border-slate-700 bg-blue-500/10',
    iconBg: 'bg-blue-600/15 text-blue-300',
    value: 'text-white',
    label: 'text-blue-300',
    border: 'border-blue-500/30',
  },
  amber: {
    container: 'border-slate-700 bg-amber-500/10',
    iconBg: 'bg-amber-500/15 text-amber-300',
    value: 'text-white',
    label: 'text-amber-300',
    border: 'border-amber-500/30',
  },
  green: {
    container: 'border-slate-700 bg-green-500/10',
    iconBg: 'bg-green-500/15 text-green-300',
    value: 'text-white',
    label: 'text-green-300',
    border: 'border-green-500/30',
  },
  red: {
    container: 'border-slate-700 bg-red-500/10',
    iconBg: 'bg-red-500/15 text-red-300',
    value: 'text-white',
    label: 'text-red-300',
    border: 'border-red-500/30',
  },
}

export default function StatsCard({ label, value, icon: Icon, tone = 'slate', trend, trendDirection }) {
  const t = toneConfig[tone] || toneConfig.slate

  const TrendIcon = trendDirection === 'down' ? ArrowDownRight : ArrowUpRight
  const trendTone = trendDirection === 'down' ? 'text-amber-300' : trendDirection === 'up' ? 'text-blue-300' : 'text-slate-500'

  return (
    <article className={`group relative rounded-2xl border ${t.border} ${t.container} p-4 shadow-lg shadow-black/10 transition-colors hover:border-slate-600/60`}
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${t.label}`}>{label}</p>
          <p className={`mt-2 text-2xl font-semibold tracking-tight ${t.value}`}>{value}</p>
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${t.iconBg} border border-slate-700/30`}
        >
          <Icon size={20} />
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${trendTone} bg-slate-950/20 border-slate-700/40`}
        >
          <TrendIcon size={13} />
          {trend}
        </span>
        <span className="text-xs text-slate-500">Quick filter</span>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent transition-all group-hover:ring-blue-400/20" />
    </article>
  )
}

