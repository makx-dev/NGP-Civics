import React from 'react'
import { categories } from '../../data/reportIssueData'

const priorityColors = {
  low: 'text-green-400 border-green-500/30 bg-green-500/10',
  medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  high: 'text-red-400 border-red-500/30 bg-red-500/10',
}

export default function ReviewCard({ formData, onEdit }) {
  const category = categories.find((c) => c.id === formData.category)

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
        <SectionCard label="Photos" onEdit={() => onEdit(1)}>
          {formData.photos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((file, i) => (
                <div key={file.uid || i} className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-700 sm:h-20 sm:w-20">
                  <img
                    src={file.preview || URL.createObjectURL(file)}
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
        <SectionCard label="Category" onEdit={() => onEdit(2)}>
          {category ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
              <span className="text-blue-400">{React.createElement(category.icon, { size: 18 })}</span>
              <span className="text-sm font-medium text-blue-400">{category.label}</span>
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

        {/* Priority */}
        {formData.priority && (
          <SectionCard label="Priority" onEdit={() => onEdit(2)}>
            <span
              className={`inline-block rounded-xl border px-3 py-1.5 text-sm font-medium ${
                priorityColors[formData.priority] || 'border-slate-700 text-slate-400'
              }`}
            >
              {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
            </span>
          </SectionCard>
        )}

        {/* Location */}
        <SectionCard label="Location" onEdit={() => onEdit(3)}>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-slate-500">Latitude</span>
              <p className="mt-0.5 font-mono text-slate-200">{formData.location.lat.toFixed(6)}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Longitude</span>
              <p className="mt-0.5 font-mono text-slate-200">{formData.location.lng.toFixed(6)}</p>
            </div>
            {formData.location.address && (
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