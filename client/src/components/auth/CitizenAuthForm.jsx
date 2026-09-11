import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react'
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
  const [forgotStep, setForgotStep] = useState(1) // 1: request code, 2: reset password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotNotice, setForgotNotice] = useState(null)

  const schema = mode === 'login' ? loginSchema : registerSchema
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { remember: true },
  })

  const submit = async (values) => {
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const { data } = await api.post(endpoint, values)
      onSuccess({
        token: data.token,
        role: 'user',
        account: data.user,
        remember: values.remember,
        message: mode === 'login' ? 'Welcome back.' : 'Your citizen account is ready.',
      })
    } catch (error) {
      onError(error.response?.data?.message || 'Unable to continue. Please try again.')
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      onError('Google Sign-In failed: No credential received from Google.')
      return
    }

    try {
      const { data } = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      })
      onSuccess({
        token: data.token,
        role: 'user',
        account: data.user,
        remember: true,
        message: 'Signed in with Google successfully.',
      })
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        (error.message === 'Network Error'
          ? 'Network Error: Cannot connect to backend API server (http://localhost:5001).'
          : error.message) ||
        'Google authentication failed. Please try again.'
      onError(errorMessage)
    }
  }

  const handleGoogleError = () => {
    onError('Google Sign-In was cancelled or encountered an error.')
  }

  const handleRequestResetOtp = async (e) => {
    e.preventDefault()
    const email = forgotEmail.trim().toLowerCase()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setForgotNotice({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setForgotLoading(true)
    setForgotNotice(null)
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setForgotNotice({
        type: 'success',
        message: data.otp
          ? `Reset code generated: ${data.otp} (Valid for ${data.expiresInMinutes} mins)`
          : 'Verification code sent to your email address.',
      })
      if (data.otp) setForgotOtp(data.otp)
      setForgotStep(2)
    } catch (error) {
      setForgotNotice({
        type: 'error',
        message: error.response?.data?.message || 'Failed to generate reset code. Please check your email.',
      })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!forgotOtp.trim()) {
      setForgotNotice({ type: 'error', message: 'Please enter the 6-digit verification code.' })
      return
    }
    if (newPassword.length < 8) {
      setForgotNotice({ type: 'error', message: 'Password must be at least 8 characters long.' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      setForgotNotice({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setForgotLoading(true)
    setForgotNotice(null)
    try {
      const { data } = await api.post('/auth/reset-password', {
        email: forgotEmail.trim().toLowerCase(),
        otp: forgotOtp.trim(),
        newPassword,
      })
      setValue('email', forgotEmail.trim().toLowerCase())
      setMode('login')
      setForgotStep(1)
      setForgotEmail('')
      setForgotOtp('')
      setNewPassword('')
      setConfirmNewPassword('')
      setForgotNotice(null)
      onSuccess({
        message: data.message || 'Password reset successfully! Please log in.',
        account: null,
        token: null,
      })
    } catch (error) {
      setForgotNotice({
        type: 'error',
        message: error.response?.data?.message || 'Failed to reset password. Please check your code.',
      })
    } finally {
      setForgotLoading(false)
    }
  }

  if (mode === 'forgot') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setForgotStep(1)
              setForgotNotice(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} /> Back to sign in
          </button>
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
            <KeyRound size={13} /> Account Recovery
          </span>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Reset citizen password</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {forgotStep === 1
              ? 'Enter your registered email address to receive a secure password reset code.'
              : `Enter the 6-digit code for ${forgotEmail} and choose a new password.`}
          </p>
        </div>

        {forgotNotice && (
          <div
            className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-5 ${
              forgotNotice.type === 'success'
                ? 'border-green-500/30 bg-green-950/60 text-green-200'
                : 'border-red-500/30 bg-red-950/60 text-red-200'
            }`}
          >
            {forgotNotice.type === 'success' ? (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-400" />
            ) : (
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-red-400" />
            )}
            <p className="flex-1">{forgotNotice.message}</p>
          </div>
        )}

        {forgotStep === 1 ? (
          <form onSubmit={handleRequestResetOtp} className="space-y-4">
            <InputField
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={forgotLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-700"
            >
              {forgotLoading && <LoaderCircle size={17} className="animate-spin" />}
              Send reset code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              label="6-Digit reset code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value)}
              required
            />
            <PasswordInput
              label="New password"
              placeholder="Enter at least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <PasswordInput
              label="Confirm new password"
              placeholder="Repeat your new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setForgotStep(1)
                  setForgotNotice(null)
                }}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-3 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                Change email
              </button>
              <button
                type="submit"
                disabled={forgotLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-700"
              >
                {forgotLoading && <LoaderCircle size={17} className="animate-spin" />}
                Reset password & Sign in
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-950/50 p-1">
        {['login', 'register'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
              mode === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mb-5 flex justify-center">
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          size="large"
          text={mode === 'login' ? 'signin_with' : 'signup_with'}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>

      <div className="relative mb-5 flex items-center justify-center">
        <div className="w-full border-t border-slate-800" />
        <span className="bg-slate-900/90 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
          or with email
        </span>
        <div className="w-full border-t border-slate-800" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        {mode === 'register' && (
          <InputField
            label="Full name"
            placeholder="Aarav Sharma"
            error={errors.name?.message}
            {...register('name')}
          />
        )}
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        {mode === 'register' && (
          <InputField
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="98765 43210"
            error={errors.phone?.message}
            {...register('phone')}
          />
        )}
        <PasswordInput
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register('password')}
        />
        {mode === 'register' && (
          <PasswordInput
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        )}
        <div className="flex items-center justify-between gap-3 pt-1 text-sm">
          <label className="flex items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600"
              {...register('remember')}
            />{' '}
            Remember me
          </label>
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                setMode('forgot')
                setForgotStep(1)
                setForgotNotice(null)
              }}
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Forgot password?
            </button>
          )}
        </div>
        <button
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-700"
        >
          {isSubmitting && <LoaderCircle size={17} className="animate-spin" />}
          {mode === 'login' ? 'Sign in as citizen' : 'Create citizen account'}
        </button>
      </form>
    </div>
  )
}

