const STORAGE_KEY = 'ngp_my_issues'

export function getStoredIssues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addIssue(issue) {
  try {
    const existing = getStoredIssues()
    existing.unshift(issue)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch {
    return false
  }
}

export function clearStoredIssues() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}