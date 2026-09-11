const TOKEN_KEY = 'ngp_civics_token'
const USER_KEY = 'ngp_civics_auth'

const storageFor = () => localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage

export const getToken = () => storageFor().getItem(TOKEN_KEY)

export const isTokenExpired = (token) => {
  const t = token || getToken()
  if (!t) return true
  try {
    const base64Url = t.split('.')[1]
    if (!base64Url) return true
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const decoded = JSON.parse(jsonPayload)
    if (!decoded.exp) return false
    return decoded.exp * 1000 <= Date.now() + 5000 // Expired or expiring within 5s
  } catch {
    return true
  }
}

export const getAuth = () => {
  if (isTokenExpired()) {
    clearAuth()
    return null
  }
  const raw = storageFor().getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export const saveAuth = ({ token, role, account, remember }) => {
  const storage = remember ? localStorage : sessionStorage
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  storage.setItem(TOKEN_KEY, token)
  storage.setItem(USER_KEY, JSON.stringify({ role, account }))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export const isAdmin = () => {
  const auth = getAuth()
  return auth?.role === 'admin'
}

export const isCitizen = () => {
  const auth = getAuth()
  return auth?.role === 'user' || auth?.role === 'citizen'
}

export const getDepartment = () => {
  const auth = getAuth()
  return auth?.account?.department || 'Municipal Administration'
}

