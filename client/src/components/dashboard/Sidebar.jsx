import { Bell, CircleUserRound, FilePlus2, House, LogOut, UserRound, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'

const items = [
  { label: 'Dashboard', icon: House, path: '/citizen/dashboard' },
  { label: 'Report Issue', icon: FilePlus2, path: '/citizen/report' },
  { label: 'My Issues', icon: CircleUserRound, path: '/citizen/issues' },
  { label: 'Notifications', icon: Bell, path: '/citizen/notifications' },
  { label: 'Profile', icon: UserRound, path: '/citizen/profile' },
]

const transition = { duration: 0.25, ease: 'easeInOut' }

function Tooltip({ label, visible }) {
  if (!visible) return null
  return <span className="pointer-events-none absolute left-[calc(100%+0.75rem)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-100 opacity-0 shadow-xl group-hover:opacity-100">{label}</span>
}

function NavigationItem({ item, expanded, isActive, onClick }) {
  const Icon = item.icon
  return <button onClick={onClick} className={`group relative flex w-full items-center rounded-xl py-3 text-left text-sm font-medium transition-colors ${expanded ? 'gap-3 px-3.5' : 'justify-center px-0'} ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Icon size={19} className="shrink-0" /><AnimatePresence initial={false}>{expanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="whitespace-nowrap">{item.label}</motion.span>}</AnimatePresence><Tooltip label={item.label} visible={!expanded} /></button>
}

export default function Sidebar({ mobileOpen, expanded, isMobile, onClose, onLogout, name }) {
  const isExpanded = isMobile || expanded
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const location = useLocation()
  const navigate = useNavigate()
  return <>
    <AnimatePresence>{isMobile && mobileOpen && <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} className="fixed inset-0 z-20 bg-black/70" onClick={onClose} aria-label="Close navigation overlay" />}</AnimatePresence>
    <motion.aside initial={false} animate={isMobile ? { width: 260, x: mobileOpen ? 0 : -280 } : { width: expanded ? 260 : 72, x: 0 }} transition={transition} className="fixed inset-y-0 left-0 z-30 flex overflow-hidden border-r border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-black/30">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className={`mb-7 flex h-10 items-center ${isExpanded ? 'justify-between px-1.5' : 'justify-center'}`}>
          <div className="group relative flex items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">N</div><AnimatePresence initial={false}>{isExpanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}><p className="whitespace-nowrap font-semibold tracking-tight text-white">NGP Civics</p><p className="whitespace-nowrap text-xs text-slate-400">Citizen Workspace</p></motion.div>}</AnimatePresence><Tooltip label="NGP Civics" visible={!isExpanded} /></div>
          {isMobile && <button className="grid h-9 w-9 place-items-center rounded-xl text-slate-400" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>}
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto" aria-label="Main navigation">{items.map((item) => {
          const isActive = location.pathname === item.path
          return <NavigationItem key={item.label} item={item} expanded={isExpanded} isActive={isActive} onClick={() => { navigate(item.path); if (isMobile) onClose() }} />
        })}</nav>
        <div className="mt-4 shrink-0 border-t border-slate-700 pt-4">
          <div className={`group relative mb-3 flex items-center ${isExpanded ? 'gap-3 px-1.5' : 'justify-center'}`}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">{initials}</div><AnimatePresence initial={false}>{isExpanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="min-w-0"><p className="truncate text-sm font-medium text-white">{name}</p><p className="text-xs text-slate-400">Citizen Workspace</p></motion.div>}</AnimatePresence><Tooltip label={name} visible={!isExpanded} /></div>
          <button onClick={onLogout} className={`group relative flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white ${isExpanded ? 'gap-3 px-3.5' : 'justify-center px-0'}`}><LogOut size={19} className="shrink-0" /><AnimatePresence initial={false}>{isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>Logout</motion.span>}</AnimatePresence><Tooltip label="Logout" visible={!isExpanded} /></button>
        </div>
      </div>
    </motion.aside>
  </>
}
