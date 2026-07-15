export default function InputField({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <input
        className={`w-full rounded-xl border bg-slate-950/45 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-slate-700'}`}
        {...props}
      />
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  )
}
