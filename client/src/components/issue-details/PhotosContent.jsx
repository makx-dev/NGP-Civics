import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const darkAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

export default function MapContent({ lat = 21.1458, lng = 79.0882, address = 'Central Avenue, Dharampeth', area = 'Dharampeth', ward = 'Ward 12' }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer(darkTileUrl, { attribution: darkAttribution }).addTo(map)
    L.marker([lat, lng]).addTo(map)
    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [lat, lng])

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="h-48 w-full overflow-hidden rounded-lg sm:h-56" />
      <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-2">
          <span className="text-slate-500">Address</span>
          <p className="font-medium text-slate-200">{address}</p>
        </div>
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-2">
          <span className="text-slate-500">Area</span>
          <p className="font-medium text-slate-200">{area}</p>
        </div>
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-2">
          <span className="text-slate-500">Ward</span>
          <p className="font-medium text-slate-200">{ward}</p>
        </div>
        <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-2">
          <span className="text-slate-500">Coordinates</span>
          <p className="font-mono font-medium text-slate-200">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
        </div>
      </div>
    </div>
  )
}