import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'

const PHOTON_API = 'https://photon.komoot.io/api/'

export default function PhotonSearch({ onSelect, onUseCurrentLocation }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [locLoading, setLocLoading] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const search = (value) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=5`
        )
        const data = await res.json()
        const mapped = data.map((f) => {
          const address = f.address || {}
          return {
            id: f.place_id || Math.random().toString(36).slice(2),
            label: f.name || f.display_name.split(',')[0] || '',
            address: address.road || address.suburb || address.neighbourhood || '',
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            country: address.country || '',
            lat: parseFloat(f.lat),
            lng: parseFloat(f.lon),
            fullAddress: f.display_name
          }
        })
        setSuggestions(mapped)
        setIsOpen(mapped.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 500) // Slightly longer debounce for Nominatim (Usage Policy recommends 1 req/sec max)
  }

  const handleSelect = (item) => {
    setQuery(item.fullAddress || item.label)
    setIsOpen(false)
    onSelect({
      lat: item.lat,
      lng: item.lng,
      address: item.fullAddress || item.label,
      area: item.address || '',
      ward: item.state || '',
      city: item.city || '',
    })
  }

  const handleCurrentLocation = () => {
    setLocLoading(true)
    onUseCurrentLocation(() => setLocLoading(false))
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Search for a location or address..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]"
        />
        {isLoading && (
          <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/30">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-800"
            >
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-500" />
              <div className="min-w-0">
                <p className="font-medium text-slate-200">{item.label || item.fullAddress}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {[item.address, item.city, item.state].filter(Boolean).join(', ')}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-xs font-medium text-slate-500">OR</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={handleCurrentLocation}
        disabled={locLoading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-400 transition-all hover:bg-blue-500/20 disabled:opacity-50"
      >
        {locLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <MapPin size={16} />
        )}
        {locLoading ? 'Getting location...' : 'Use My Current Location'}
      </button>
    </div>
  )
}