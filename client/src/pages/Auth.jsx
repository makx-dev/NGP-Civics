import { ArrowLeft, CheckCircle2, ShieldAlert, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedCard from '../components/auth/AnimatedCard'
import AuthorityLoginForm from '../components/auth/AuthorityLoginForm'
import CitizenAuthForm from '../components/auth/CitizenAuthForm'
import RoleSelector from '../components/auth/RoleSelector'
import { saveAuth } from '../lib/auth'

export default function Auth() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [step, setStep] = useState('role')
  const [notice, setNotice] = useState(null)
  const navigate = useNavigate()

  const finishAuth = ({ token, role, account, remember, message }) => {
    saveAuth({ token, role, account, remember })
    setNotice({ type: 'success', message })
    window.setTimeout(() => navigate(role === 'admin' ? '/admin/dashboard' : '/citizen/dashboard'), 450)
  }

  const showError = (message) => setNotice({ type: 'error', message })
  const isCitizen = selectedRole === 'citizen'

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:grid sm:place-items-center sm:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <div className="max-w-lg space-y-5 px-2 lg:px-0">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-400">Municipal service portal</p>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Clear updates. Better accountability.</h2>
          <p className="max-w-md text-base leading-7 text-slate-400">A secure shared workspace for residents and civic authorities to move every issue forward.</p>
          <div className="hidden border-l border-slate-700 pl-4 text-sm leading-6 text-slate-400 lg:block">Built for everyday civic requests, with transparent progress at every stage.</div>
        </div>
        <AnimatedCard>
          {step === 'role' ? <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} onContinue={() => setStep('auth')} /> : (
            <div>
              <button type="button" onClick={() => setStep('role')} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"><ArrowLeft size={16} /> Change role</button>
              <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">{isCitizen ? 'Citizen access' : 'Authority access'}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">{isCitizen ? 'Welcome to NGP Civics' : 'Sign in to your workspace'}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{isCitizen ? 'Access your reports and stay informed.' : 'Use your municipal account to continue.'}</p></div>
              {isCitizen ? <CitizenAuthForm onSuccess={finishAuth} onError={showError} /> : <AuthorityLoginForm onSuccess={finishAuth} onError={showError} />}
            </div>
          )}
        </AnimatedCard>
      </div>
      {notice && <div role="status" className={`fixed bottom-5 right-5 flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${notice.type === 'success' ? 'border-green-500/30 bg-green-950 text-green-100' : 'border-red-500/30 bg-red-950 text-red-100'}`}><span className="mt-0.5">{notice.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}</span><p className="pr-3 leading-5">{notice.message}</p><button onClick={() => setNotice(null)} className="text-current opacity-70 hover:opacity-100" aria-label="Dismiss notification"><X size={16} /></button></div>}
    </main>
  )
}
