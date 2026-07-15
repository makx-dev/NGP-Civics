import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function PasswordInput({ label = 'Password', error, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      <span className="relative block">
        <input
          type={visible ? 'text' : 'password'}
          className={`w-full rounded-xl border bg-slate-950/45 px-3.5 py-3 pr-11 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-slate-700'}`}
          {...props}
        />
        <button type="button" onClick={() => setVisible((value) => !value)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 hover:text-white" aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  )
}
