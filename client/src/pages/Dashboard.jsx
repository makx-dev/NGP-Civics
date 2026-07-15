import { LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clearAuth, getAuth } from '../lib/auth'

export default function Dashboard({ role }) {
  const navigate = useNavigate()
  const auth = getAuth()
  const signOut = () => { clearAuth(); navigate('/auth') }
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/20">
        <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600"><ShieldCheck size={22} /></div>
        <p className="text-sm font-medium text-blue-400">{role} dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome, {auth?.account?.name || role}.</h1>
        <p className="mt-3 leading-6 text-slate-400">You have been securely authenticated. Your dashboard modules can now be added here.</p>
        <button onClick={signOut} className="mt-8 inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800"><LogOut size={16} /> Sign out</button>
      </section>
    </main>
  )
}
