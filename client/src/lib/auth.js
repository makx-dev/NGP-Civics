const TOKEN_KEY = 'ngp_civics_token'
const USER_KEY = 'ngp_civics_auth'

const storageFor = () => localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage

export const getToken = () => storageFor().getItem(TOKEN_KEY)
export const getAuth = () => {
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

