import { motion } from 'framer-motion'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'updates', label: 'Updates' },
  { key: 'verification', label: 'Verification' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'reopened', label: 'Reopened' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'department', label: 'Department' },
]

export default function FilterBar({ active, counts, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((f) => {
        const count = counts[f.key]
        const isActive = active === f.key
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'border border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
            }`}
          >
            {f.label}
            {count !== undefined && count > 0 && (
              <span
                className={`grid h-4 min-w-[1rem] place-items-center rounded-full px-1 text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId="filter-pill"
                className="absolute inset-0 -z-10 rounded-full bg-blue-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}