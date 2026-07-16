import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { categories } from '../../data/reportIssueData'

export default function CategorySelector({ value, onChange, error }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Category</h3>
        <p className="mt-1 text-sm text-slate-400">Select the type of issue you want to report.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const isSelected = value === cat.id
          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => onChange(cat.id)}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                {React.createElement(cat.icon, { size: 20 })}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-blue-400' : 'text-slate-200'
                  }`}
                >
                  {cat.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{cat.description}</p>
              </div>
              {isSelected && (
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <Check size={14} className="text-white" />
                </span>
              )}
            </motion.button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}