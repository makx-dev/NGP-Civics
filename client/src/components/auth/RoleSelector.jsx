import { Building2, Check, UserRound } from 'lucide-react'

const roles = [
  { id: 'citizen', title: 'Citizen', description: 'Report civic issues, track progress, receive updates.', icon: UserRound },
  { id: 'authority', title: 'Authority', description: 'Manage complaints, assign departments and resolve issues.', icon: Building2 },
]

export default function RoleSelector({ selectedRole, onSelect, onContinue }) {
  return (
    <div className="space-y-7">
      <div className="space-y-3 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">N</div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">NGP Civics</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">A better civic experience.</h1>
        <p className="mx-auto max-w-sm text-sm leading-6 text-slate-400">The Civic App That Works for You, Not Just the Office.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map(({ id, title, description, icon: Icon }) => {
          const isSelected = selectedRole === id
          return (
            <button key={id} type="button" onClick={() => onSelect(id)} className={`relative rounded-2xl border p-5 text-left transition-colors ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-950/30 hover:border-slate-500'}`}>
              {isSelected && <span className="absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white"><Check size={13} strokeWidth={3} /></span>}
              <span className={`mb-5 grid h-10 w-10 place-items-center rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}><Icon size={20} /></span>
              <span className="block text-base font-semibold text-white">{title}</span>
              <span className="mt-1.5 block text-sm leading-5 text-slate-400">{description}</span>
            </button>
          )
        })}
      </div>
      <button type="button" disabled={!selectedRole} onClick={onContinue} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">Continue <span aria-hidden>→</span></button>
    </div>
  )
}
