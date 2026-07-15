import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import api from '../../lib/api'
import InputField from './InputField'
import PasswordInput from './PasswordInput'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid phone number').max(20, 'Phone number is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  remember: z.boolean().optional(),
}).refine(({ password, confirmPassword }) => password === confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })

export default function CitizenAuthForm({ onSuccess, onError }) {
  const [mode, setMode] = useState('login')
  const schema = mode === 'login' ? loginSchema : registerSchema
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { remember: true } })

  const submit = async (values) => {
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const { data } = await api.post(endpoint, values)
      onSuccess({ token: data.token, role: 'user', account: data.user, remember: values.remember, message: mode === 'login' ? 'Welcome back.' : 'Your citizen account is ready.' })
    } catch (error) {
      onError(error.response?.data?.message || 'Unable to continue. Please try again.')
    }
  }

  return (
    <div>
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-950/50 p-1">
        {['login', 'register'].map((tab) => <button key={tab} type="button" onClick={() => setMode(tab)} className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${mode === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>{tab}</button>)}
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        {mode === 'register' && <InputField label="Full name" placeholder="Aarav Sharma" error={errors.name?.message} {...register('name')} />}
        <InputField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        {mode === 'register' && <InputField label="Phone number" type="tel" autoComplete="tel" placeholder="98765 43210" error={errors.phone?.message} {...register('phone')} />}
        <PasswordInput autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Enter your password" error={errors.password?.message} {...register('password')} />
        {mode === 'register' && <PasswordInput label="Confirm password" autoComplete="new-password" placeholder="Repeat your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />}
        <div className="flex items-center justify-between gap-3 pt-1 text-sm">
          <label className="flex items-center gap-2 text-slate-400"><input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600" {...register('remember')} /> Remember me</label>
          {mode === 'login' && <button type="button" onClick={() => onError('Password recovery is not configured yet. Please contact support.')} className="font-medium text-blue-400 hover:text-blue-300">Forgot password?</button>}
        </div>
        <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-700">{isSubmitting && <LoaderCircle size={17} className="animate-spin" />}{mode === 'login' ? 'Sign in as citizen' : 'Create citizen account'}</button>
      </form>
    </div>
  )
}
