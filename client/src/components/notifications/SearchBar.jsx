import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by ID, title, department…"
        className="w-full rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-blue-500/40 focus:bg-slate-900/80"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-slate-500 hover:bg-slate-700 hover:text-slate-300"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}