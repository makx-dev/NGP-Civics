import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const darkAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

export default function LeafletMap({ center, onMove, height = '400px', readOnly = false }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (mapInstance.current) return

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer(darkTileUrl, {
      attribution: darkAttribution,
      maxZoom: 20,
    }).addTo(map)

    const marker = L.marker([center.lat, center.lng], {
      draggable: !readOnly,
    }).addTo(map)

    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onMove?.(pos.lat, pos.lng)
    })

    map.on('click', (e) => {
      if (readOnly) return
      marker.setLatLng(e.latlng)
      onMove?.(e.latlng.lat, e.latlng.lng)
    })

    mapInstance.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update marker position when center changes externally
  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      markerRef.current.setLatLng([center.lat, center.lng])
      mapInstance.current.setView([center.lat, center.lng], mapInstance.current.getZoom(), {
        animate: true,
      })
    }
  }, [center.lat, center.lng])

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700">
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />
    </div>
  )
}