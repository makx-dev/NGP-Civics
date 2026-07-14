import { useEffect, useMemo, useState } from 'react'
import './App.css'

const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/'

const categoryOptions = [
  'Road Damage (Potholes)',
  'Streetlights',
  'Garbage',
  'Water Leakage',
  'Public Washroom Hygiene',
  'Drainage',
  'Traffic Signal',
  'Spitting',
  'Public Property Damage',
  'Encroachment',
  'Animal Welfare',
  'Others',
]

const initialForm = {
  title: '',
  description: '',
  category: '',
  locationQuery: '',
  locationAddress: '',
  locationLat: '',
  locationLng: '',
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')

  const hasLocationSelection = useMemo(
    () => Boolean(form.locationAddress && form.locationLat && form.locationLng),
    [form.locationAddress, form.locationLat, form.locationLng],
  )

  useEffect(() => {
    const query = form.locationQuery.trim()

    if (query.length < 3) {
      setSuggestions([])
      setSearchError('')
      setIsSearching(false)
      return undefined
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true)
      setSearchError('')

      try {
        const response = await fetch(
          `${PHOTON_SEARCH_URL}?q=${encodeURIComponent(query)}&limit=6&lang=en`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error('Failed to load location suggestions')
        }

        const data = await response.json()
        const nextSuggestions = Array.isArray(data?.features) ? data.features : []
        setSuggestions(nextSuggestions)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([])
          setSearchError('Location autocomplete is temporarily unavailable.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [form.locationQuery])

  const updateField = (field) => (event) => {
    const { value } = event.target

    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const toggleCategory = (category) => {
    setForm((current) => ({
      ...current,
      category: current.category === category ? '' : category,
    }))
  }

  const handleCategoryPick = (category) => {
    toggleCategory(category)
    setIsCategoryOpen(false)
  }

  const selectSuggestion = (feature) => {
    const coordinates = feature?.geometry?.coordinates || []
    const properties = feature?.properties || {}
    const address = [properties.name, properties.city, properties.state, properties.country]
      .filter(Boolean)
      .join(', ')

    setForm((current) => ({
      ...current,
      locationQuery: properties.name || address,
      locationAddress: address || properties.name || '',
      locationLat: coordinates.length > 1 ? String(coordinates[1]) : '',
      locationLng: coordinates.length > 0 ? String(coordinates[0]) : '',
    }))
    setSelectedLabel(address || properties.name || '')
    setSuggestions([])
  }

  const clearLocation = () => {
    setForm((current) => ({
      ...current,
      locationQuery: '',
      locationAddress: '',
      locationLat: '',
      locationLng: '',
    }))
    setSelectedLabel('')
    setSuggestions([])
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">NGP Civics</p>
          <h1>Report civic issues with precise location autocomplete.</h1>
          <p className="lede">
            Search streets, landmarks, and neighborhoods using Komoot Photon, then attach the
            selected place to an issue report with coordinates.
          </p>
          <div className="hero-points">
            <span>Photon-backed search</span>
            <span>Lat/lng capture</span>
            <span>Ready for `/api/issues`</span>
          </div>
        </div>

        <form className="issue-form" onSubmit={handleSubmit}>
          <label>
            <span>Issue title</span>
            <input
              type="text"
              value={form.title}
              onChange={updateField('title')}
              placeholder="Broken streetlight near the market"
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={updateField('description')}
              placeholder="Describe what happened and why it matters."
              rows="4"
            />
          </label>

          <label>
            <span>Category</span>
            <p className="category-help">Choose one category for the issue. Tap again to clear.</p>
          </label>

          <div className="category-picker">
            <button
              type="button"
              className="category-box"
              aria-expanded={isCategoryOpen}
              onClick={() => setIsCategoryOpen((current) => !current)}
            >
              <span className="category-box-label">{form.category || 'Select a category'}</span>
              <span className="category-box-arrow" aria-hidden="true">
                {isCategoryOpen ? '−' : '+'}
              </span>
            </button>

            {isCategoryOpen ? (
              <div className="category-panel" role="group" aria-label="Issue categories">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={form.category === category ? 'category-chip is-selected' : 'category-chip'}
                    aria-pressed={form.category === category}
                    onClick={() => handleCategoryPick(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="location-block">
            <label>
              <span>Location search</span>
              <input
                type="text"
                value={form.locationQuery}
                onChange={updateField('locationQuery')}
                placeholder="Start typing an area, road, or landmark"
              />
            </label>

            <div className="location-meta">
              <span className="location-credit">
                {isSearching ? 'Searching Photon…' : 'Location data powered by OpenStreetMap via Photon.'}
              </span>
              {hasLocationSelection ? <button type="button" onClick={clearLocation}>Clear</button> : null}
            </div>

            {searchError ? <p className="error-text">{searchError}</p> : null}

            {suggestions.length > 0 ? (
              <div className="suggestion-list" role="listbox" aria-label="Location suggestions">
                {suggestions.map((feature) => {
                  const properties = feature.properties || {}
                  const label = [properties.name, properties.city, properties.state, properties.country]
                    .filter(Boolean)
                    .join(', ')

                  return (
                    <button
                      key={`${properties.osm_id || label}-${label}`}
                      type="button"
                      className="suggestion-item"
                      onClick={() => selectSuggestion(feature)}
                    >
                      <strong>{properties.name || 'Unnamed place'}</strong>
                      <span>{label}</span>
                    </button>
                  )
                })}
              </div>
            ) : null}

            <div className="location-result">
              <label>
                <span>Selected address</span>
                <input type="text" value={form.locationAddress} readOnly placeholder="Select a suggestion" />
              </label>
              <div className="coord-grid">
                <label>
                  <span>Latitude</span>
                  <input type="text" value={form.locationLat} readOnly placeholder="Auto-filled" />
                </label>
                <label>
                  <span>Longitude</span>
                  <input type="text" value={form.locationLng} readOnly placeholder="Auto-filled" />
                </label>
              </div>
            </div>

            {selectedLabel ? <p className="selected-note">Selected: {selectedLabel}</p> : null}
          </div>

          <button type="submit" className="submit-button">Preview report payload</button>
        </form>
      </section>
    </main>
  )
}

export default App
