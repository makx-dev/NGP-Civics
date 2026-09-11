import axios from 'axios'
import { getToken, clearAuth } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || ''
      // Only redirect if this is not an intentional bad-credential response from login/register
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/google') ||
        url.includes('/auth/reset-password')

      if (!isAuthEndpoint) {
        clearAuth()
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth') {
          window.location.href = '/auth'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
