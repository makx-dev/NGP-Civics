import { motion } from 'framer-motion'
import { LayoutGrid, AlignJustify, Table2 } from 'lucide-react'

const modes = [
  { key: 'cards', icon: LayoutGrid, label: 'Cards' },
  { key: 'compact', icon: AlignJustify, label: 'Compact' },
  { key: 'table', icon: Table2, label: 'Table' },
]

export default function ViewModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/60 p-0.5 backdrop-blur-sm">
      {modes.map((m) => {
        const Icon = m.icon
        const isActive = mode === m.key
        return (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="viewModeBg"
                className="absolute inset-0 rounded-md bg-blue-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon size={14} />
              <span className="hidden sm:inline">{m.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}