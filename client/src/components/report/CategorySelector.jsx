import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check,
  Road,
  Trash2,
  Lightbulb,
  Droplets,
  Waves,
  Car,
  Construction,
  TrafficCone,
  Building2,
  ClipboardList,
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react'
import api from '../../lib/api'

const iconMap = {
  road: Road,
  pothole: Road,
  street: Lightbulb,
  light: Lightbulb,
  garbage: Trash2,
  waste: Trash2,
  water: Droplets,
  leakage: Droplets,
  drain: Waves,
  washroom: Droplets,
  hygiene: Droplets,
  traffic: TrafficCone,
  spit: ShieldAlert,
  property: Building2,
  encroach: Construction,
  animal: HeartHandshake,
  park: Car,
  parking: Car,
  other: ClipboardList,
}

function getCategoryIcon(name = '') {
  const lower = name.toLowerCase()
  for (const [key, Icon] of Object.entries(iconMap)) {
    if (lower.includes(key)) return Icon
  }
  return ClipboardList
}

export default function CategorySelector({ value, onChange, error }) {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await api.get('/categories')
        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data)
        }
      } catch (err) {
        console.warn('Could not fetch categories from server:', err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white">Category</h3>
        <p className="mt-1 text-sm text-slate-400">Select the type of issue you want to report.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const catId = cat._id || cat.id
            const isSelected = value === catId || value === cat.name
            const Icon = getCategoryIcon(cat.name)

            return (
              <motion.button
                key={catId}
                type="button"
                onClick={() => onChange(catId)}
                whileTap={{ scale: 0.98 }}
                className={`group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_-5px_rgba(59,130,246,0.3)]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 text-blue-400">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-blue-400' : 'text-slate-200'
                    }`}
                  >
                    {cat.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{cat.description || `${cat.name} civic issue`}</p>
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
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}