import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const statusOptions = ['All', 'Pending', 'Assigned', 'Inspection', 'In Progress', 'Completed', 'Citizen Verification', 'Resolved', 'Rejected', 'Reopened']
const categoryOptions = ['All', 'Road', 'Garbage', 'Water', 'Street Light', 'Traffic', 'Encroachment']
const priorityOptions = ['All', 'Low', 'Medium', 'High']
const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Priority', value: 'priority' },
  { label: 'Status', value: 'status' },
  { label: 'Area', value: 'area' },
  { label: 'Date', value: 'date' },
]

function Select({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <p className="mb-1.5 text-xs font-medium text-slate-500">{label}</p>
      <button
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700/50 bg-slate-900/60 px-3 py-2 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:border-slate-600/50"
      >
        <span>{value}</span>
        <ChevronDown size={14} className="text-slate-500" />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-700/50 bg-slate-900 py-1 shadow-xl backdrop-blur-sm"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => {
                onChange(opt)
                setOpen(false)
              }}
              className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-800 ${
                value === opt ? 'text-blue-400' : 'text-slate-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function FilterBar({ filters, onFilterChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Select
        label="Status"
        value={filters.status}
        options={statusOptions}
        onChange={(v) => onFilterChange('status', v)}
      />
      <Select
        label="Category"
        value={filters.category}
        options={categoryOptions}
        onChange={(v) => onFilterChange('category', v)}
      />
      <Select
        label="Priority"
        value={filters.priority}
        options={priorityOptions}
        onChange={(v) => onFilterChange('priority', v)}
      />
      <Select
        label="Sort"
        value={sortOptions.find((o) => o.value === filters.sort)?.label || 'Newest'}
        options={sortOptions.map((o) => o.label)}
        onChange={(v) => {
          const match = sortOptions.find((o) => o.label === v)
          onFilterChange('sort', match ? match.value : 'newest')
        }}
      />
    </div>
  )
}