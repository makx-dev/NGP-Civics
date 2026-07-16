import PhotonSearch from './PhotonSearch'
import LeafletMap from './LeafletMap'

export default function LocationPicker({ location, onLocationChange, errors }) {
  const handleSearchSelect = (loc) => {
    onLocationChange(loc)
  }

  const handleMapMove = (lat, lng) => {
    onLocationChange({ ...location, lat, lng })
  }

  const handleCurrentLocation = (onComplete) => {
    if (!navigator.geolocation) {
      onComplete?.()
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({
          ...location,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: 'Current location',
        })
        onComplete?.()
      },
      () => {
        onComplete?.()
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-white">Location</h3>
        <p className="mt-1 text-sm text-slate-400">Pin the exact location of the issue on the map.</p>
      </div>

      <PhotonSearch onSelect={handleSearchSelect} onUseCurrentLocation={handleCurrentLocation} />

      <div className="space-y-3">
        <LeafletMap center={{ lat: location.lat, lng: location.lng }} onMove={handleMapMove} />

        {errors?.location?.address && (
          <p className="text-sm text-red-400">{errors.location.address}</p>
        )}
      </div>

      {/* Coordinates Display */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4 sm:grid-cols-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Latitude</p>
          <p className="mt-1 text-sm font-mono text-slate-200">{location.lat.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Longitude</p>
          <p className="mt-1 text-sm font-mono text-slate-200">{location.lng.toFixed(6)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs font-medium text-slate-500">Address</p>
          <p className="mt-1 text-sm text-slate-200 truncate">
            {location.address || 'Not set'}
          </p>
        </div>
      </div>
    </div>
  )
}