import { priorityOptions } from '../../data/reportIssueData'

export default function IssueForm({ formData, onChange, errors }) {
  const descLength = formData.description?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Issue Details</h3>
        <p className="mt-1 text-sm text-slate-400">Describe the issue you're reporting.</p>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium text-slate-300">
          Issue Title <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title || ''}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Large pothole near IT Park signal"
          maxLength={100}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]"
        />
        {errors?.title && <p className="text-sm text-red-400">{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-300">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          id="description"
          rows={4}
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Describe the issue in detail..."
          maxLength={500}
          className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-blue-500 focus:shadow-[0_0_10px_-3px_rgba(59,130,246,0.3)]"
        />
        <div className="flex items-center justify-between">
          {errors?.description ? (
            <p className="text-sm text-red-400">{errors.description}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ${
              descLength > 450 ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {descLength}/500
          </span>
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Priority <span className="text-xs text-slate-500">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((opt) => {
            const isSelected = formData.priority === opt.value
            const colorMap = {
              low: 'border-green-500/30 bg-green-500/10 text-green-400',
              medium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
              high: 'border-red-500/30 bg-red-500/10 text-red-400',
            }
            const selectedColor = colorMap[opt.value]
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange('priority', isSelected ? '' : opt.value)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  isSelected
                    ? `${selectedColor} shadow-sm`
                    : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}