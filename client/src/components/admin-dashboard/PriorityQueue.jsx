import { useMemo, useState } from 'react'
import { AlertTriangle, Clock3, Layers, RefreshCcw, ArrowUpDown } from 'lucide-react'

import PriorityIssueCard from './PriorityIssueCard'

const filterConfig = {
  All: { label: 'Sorting: Priority', icon: ArrowUpDown },
  HighPriority: { label: 'High Priority', icon: AlertTriangle },
  Overdue: { label: 'Overdue', icon: Clock3 },
  Reopened: { label: 'Reopened', icon: RefreshCcw },
  OldestPending: { label: 'Oldest Pending', icon: Layers },
}

function parseDaysFromEstimatedResolution(est) {
  if (!est || typeof est !== 'string') return NaN
  const days = parseInt(est.replace(/[^0-9]/g, ''), 10)
  return Number.isFinite(days) ? days : NaN
}

function isOverdue(issue, now = Date.now()) {
  const days = parseDaysFromEstimatedResolution(issue.estimatedResolution)
  if (!Number.isFinite(days)) return false
  const reportedDate = issue.reportedDate || issue.createdAt
  if (!reportedDate) return false
  const reported = new Date(reportedDate).getTime()
  if (!Number.isFinite(reported)) return false
  const deadline = reported + days * 24 * 60 * 60 * 1000
  return now > deadline && !['Completed', 'Resolved'].includes(issue.status)
}

function defaultQueueSortKey(activeFilter) {
  if (!activeFilter?.type || activeFilter.type === 'All') return 'All'
  if (activeFilter.type === 'Overdue') return 'Overdue'
  if (activeFilter.type === 'In Progress') return 'HighPriority'
  if (activeFilter.type === 'Pending') return 'OldestPending'
  if (activeFilter.type === 'Citizen Verification') return 'HighPriority'
  if (activeFilter.type === 'Assigned') return 'HighPriority'
  return 'All'
}

export default function PriorityQueue({ issues, activeFilter, onFilter, onOpenIssue }) {
  const [queueSortKey, setQueueSortKey] = useState(() => defaultQueueSortKey(activeFilter))

  const derivedKey = useMemo(() => defaultQueueSortKey(activeFilter), [activeFilter])
  const effectiveKey = derivedKey || queueSortKey

  const sorted = useMemo(() => {
    const now = Date.now()
    const list = [...issues]

    const byOldestPending = (a, b) => {
      const aT = new Date(a.reportedDate || a.createdAt || 0).getTime()
      const bT = new Date(b.reportedDate || b.createdAt || 0).getTime()
      return aT - bT
    }

    const byPriorityRankDesc = (a, b) => {
      const rank = { High: 3, Medium: 2, Low: 1 }
      const ar = rank[a.priority] ?? 0
      const br = rank[b.priority] ?? 0
      if (br !== ar) return br - ar
      const ao = isOverdue(a, now)
      const bo = isOverdue(b, now)
      if (bo !== ao) return bo ? 1 : -1
      return byOldestPending(a, b)
    }

    const overdueOnly = (i) => isOverdue(i, now)
    const reopenedOnly = (i) => ['Reopened', 'REOPENED'].includes(i.status)
    const highPriorityOnly = (i) => (i.priority || '').toLowerCase() === 'high'

    if (effectiveKey === 'Overdue') {
      return list.filter(overdueOnly).sort(byPriorityRankDesc)
    }
    if (effectiveKey === 'Reopened') {
      return list.filter(reopenedOnly).sort(byPriorityRankDesc)
    }
    if (effectiveKey === 'OldestPending') {
      return list
        .filter((i) => ['Pending', 'Complaint Submitted'].includes(i.status))
        .sort(byOldestPending)
        .concat(list.filter((i) => !['Pending', 'Complaint Submitted'].includes(i.status)).sort(byPriorityRankDesc))
    }
    if (effectiveKey === 'HighPriority') {
      return list.filter(highPriorityOnly).sort(byPriorityRankDesc)
    }

    return list.sort(byPriorityRankDesc)
  }, [issues, effectiveKey])

  return (
    <section className="space-y-4" aria-label="Priority queue">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Priority queue</h2>
          <p className="mt-1 text-sm text-slate-400">Automatically sorted by what needs attention now.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['All', 'HighPriority', 'Overdue', 'Reopened', 'OldestPending'].map((id) => {
            const cfg = filterConfig[id]
            const Icon = cfg.icon
            const isActive = effectiveKey === id

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setQueueSortKey(id)
                  const map = {
                    All: { type: 'All' },
                    HighPriority: { type: 'All' },
                    Overdue: { type: 'Overdue' },
                    Reopened: { type: 'All' },
                    OldestPending: { type: 'Pending' },
                  }
                  onFilter?.(map[id] || { type: 'All' })
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-950/40 text-blue-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200'
                }`}
                aria-label={`Sort queue: ${cfg.label}`}
              >
                <Icon size={14} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <p className="text-sm font-semibold text-slate-200">No items match the current focus.</p>
            <p className="mt-1 text-xs text-slate-500">Adjust filters to see more.</p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 md:grid-cols-2">
            {sorted.slice(0, 8).map((issue, idx) => {
              const key = issue._id || issue.id || `priority-issue-${idx}`
              return (
                <PriorityIssueCard
                  key={key}
                  issue={issue}
                  onOpenIssue={(id) => onOpenIssue?.(id)}
                  onQuickAction={(i) => {
                    onOpenIssue?.(i._id || i.id)
                  }}
                />
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

