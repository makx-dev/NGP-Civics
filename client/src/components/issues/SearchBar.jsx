import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search by Complaint ID, Title, Location, Category...'}
        className="w-full rounded-xl border border-slate-700/50 bg-slate-900/60 py-3 pl-11 pr-10 text-sm text-white placeholder-slate-500 backdrop-blur-sm transition-colors focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-slate-300"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}