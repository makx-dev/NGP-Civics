import { AnimatePresence, motion } from 'framer-motion'

function Tooltip({ label, visible }) {
  if (!visible) return null
  return (
    <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-100 opacity-0 shadow-xl group-hover:opacity-100">
      {label}
    </span>
  )
}

export default function SidebarItem({ item, expanded, isActive, onClick }) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={`group relative flex w-full items-center rounded-xl py-3 text-left text-sm font-medium transition-colors ${
        expanded ? 'gap-3 px-3.5' : 'justify-center px-0'
      } ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      <Icon size={19} className="shrink-0" />
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <Tooltip label={item.label} visible={!expanded} />
    </button>
  )
}

