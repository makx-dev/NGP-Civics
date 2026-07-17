import { useNavigate } from 'react-router-dom'
import { Bell, Menu, Search } from 'lucide-react'

export default function Navbar({ name, onMenu }) {
  const navigate = useNavigate()
  const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 flex items-center gap-3 border-b border-slate-700 bg-slate-950/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-300"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="hidden min-w-0 flex-1 md:block">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            aria-label="Search your reports"
            placeholder="Search reports, updates or areas"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={() => navigate('/citizen/notifications')}
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-700 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">
            Good Evening, {name.split(' ')[0]}.
          </p>
          <p className="text-xs text-slate-400">Citizen account</p>
        </div>

        <button
          onClick={() => navigate('/citizen/profile')}
          className="grid h-10 w-10 place-items-center rounded-full bg-slate-700 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-600"
          aria-label="View profile"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
