import React, { useEffect, useState } from 'react'
import { Tag } from 'lucide-react'
import api from '../../lib/api'

export default function ReviewCard({ formData, onEdit }) {
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const res = await api.get('/categories')
        if (isMounted && Array.isArray(res.data)) {
          const match = res.data.find(
            (c) => c._id === formData.category || c.id === formData.category || c.name === formData.category
          )
          if (match) setCategoryName(match.name)
          else setCategoryName(typeof formData.category === 'object' ? formData.category?.name : formData.category)
        }
      } catch {
        if (isMounted) setCategoryName(typeof formData.category === 'object' ? formData.category?.name : formData.category)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [formData.category])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Review Your Report</h3>
        <p className="mt-1 text-sm text-slate-400">
          Please verify all details before submitting.
        </p>
      </div>

      <div className="space-y-5">
        {/* Photos */}
        <SectionCard label="Photos" onEdit={() => onEdit(3)}>
          {formData.photos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((file, i) => (
                <div key={file.uid || i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-700 sm:h-20 sm:w-20">
                  <img
                    src={file.preview || (typeof file === 'string' ? file : URL.createObjectURL(file))}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No photos uploaded</p>
          )}
        </SectionCard>

        {/* Category */}
        <SectionCard label="Category" onEdit={() => onEdit(1)}>
          {categoryName ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
              <Tag size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-blue-400">{categoryName}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not selected</p>
          )}
        </SectionCard>

        {/* Title & Description */}
        <SectionCard label="Title" onEdit={() => onEdit(2)}>
          <p className="text-sm font-medium text-white">{formData.title || 'Not provided'}</p>
        </SectionCard>

        {formData.description && (
          <SectionCard label="Description" onEdit={() => onEdit(2)}>
            <p className="text-sm text-slate-300">{formData.description}</p>
          </SectionCard>
        )}

        {/* Location */}
        <SectionCard label="Location" onEdit={() => onEdit(3)}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-500">Latitude</span>
              <p className="mt-0.5 font-mono text-slate-200">{formData.location?.lat?.toFixed ? formData.location.lat.toFixed(6) : formData.location?.lat}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Longitude</span>
              <p className="mt-0.5 font-mono text-slate-200">{formData.location?.lng?.toFixed ? formData.location.lng.toFixed(6) : formData.location?.lng}</p>
            </div>
            {formData.location?.address && (
              <div className="col-span-2">
                <span className="text-xs text-slate-500">Address</span>
                <p className="mt-0.5 text-slate-200">{formData.location.address}</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function SectionCard({ label, children, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  )
}