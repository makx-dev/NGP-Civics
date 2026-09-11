// Legacy local store deprecated. All issues and reports are persisted directly to MongoDB.
export function getStoredIssues() {
  return []
}

export function addIssue() {
  return false
}

export function clearStoredIssues() {
  try {
    localStorage.removeItem('ngp_my_issues')
  } catch {
    // ignore
  }
}