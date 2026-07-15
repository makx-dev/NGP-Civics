import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import api from '../../lib/api'
import InputField from './InputField'
import PasswordInput from './PasswordInput'

const isGovernmentEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase() || ''
  return ['nmcnagpur.gov.in', 'maharashtra.gov.in'].includes(domain) || domain === 'gov.in' || domain.endsWith('.gov.in')
}

const schema = z.object({
  email: z.string().email('Enter a valid government email').refine(isGovernmentEmail, 'Only authorized government accounts are allowed.'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

export default function AuthorityLoginForm({ onSuccess, onError }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { remember: false } })
  const submit = async (values) => {
    try {
      const { data } = await api.post('/auth/admin/login', values)
      onSuccess({ token: data.token, role: 'admin', account: data.admin, remember: values.remember, message: 'Authority access granted.' })
    } catch (error) {
      onError(error.response?.data?.message || 'Unable to sign in. Please try again.')
    }
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <div className="flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3.5 text-sm text-blue-100"><Building2 size={19} className="mt-0.5 shrink-0 text-blue-400" /><p>Authority accounts are issued by the municipal administration.</p></div>
      <InputField label="Government email" type="email" autoComplete="email" placeholder="name@nmcnagpur.gov.in" error={errors.email?.message} {...register('email')} />
      <PasswordInput autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register('password')} />
      <div className="flex items-center justify-between gap-3 pt-1 text-sm"><label className="flex items-center gap-2 text-slate-400"><input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600" {...register('remember')} /> Remember me</label><button type="button" onClick={() => onError('Password recovery is managed by the municipal administration.')} className="font-medium text-blue-400 hover:text-blue-300">Forgot password?</button></div>
      <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-700">{isSubmitting && <LoaderCircle size={17} className="animate-spin" />}Sign in to authority portal</button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck size={14} /> Protected municipal access</p>
    </form>
  )
}
