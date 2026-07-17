import { BadgeCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function SidebarProfile({ expanded, initials, name, roleLabel, verifiedLabel }) {
  return (
    <div className={`group relative mb-3 flex items-center ${expanded ? 'gap-3 px-1.5' : 'justify-center'}`}>
      <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
        {initials}
        {!expanded && (
          <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full border border-slate-700 bg-blue-600 text-[10px] text-white">
            <BadgeCheck size={12} />
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="min-w-0"
          >
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
            <div className="mt-1 flex items-center gap-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
                <BadgeCheck size={14} />
                {verifiedLabel}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-100 opacity-0 shadow-xl group-hover:opacity-100">
          {name}
        </span>
      )}
    </div>
  )
}

