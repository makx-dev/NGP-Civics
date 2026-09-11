import { ArrowUpRight, Building2, Clock3, UserRound } from 'lucide-react'

export default function AssignedIssues({ issues, onOpenIssue }) {
  return (
    <section className="space-y-4" aria-label="Assigned issues">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Assigned issues</h2>
          <p className="mt-1 text-sm text-slate-400">Work already routed to departments.</p>
        </div>
      </div>

      <div className="space-y-3">
        {issues.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
            <p className="text-sm font-semibold text-slate-200">No assigned issues.</p>
            <p className="mt-1 text-xs text-slate-500">Assign complaints from the priority queue.</p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3">
            {issues.slice(0, 6).map((issue, idx) => {
              const issueId = issue._id || issue.id
              const key = issueId || `assigned-issue-${idx}`
              const complaintId = issue.complaintId || (issueId ? `#${String(issueId).slice(-6).toUpperCase()}` : 'CIVIC-REQ')
              const departmentName = issue.department || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.department : null) || 'Civic Services'
              const officerName = issue.assignedOfficer || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.name : null) || 'Officer assigned'
              const dateText = issue.lastUpdated || (issue.updatedAt ? new Date(issue.updatedAt).toLocaleDateString() : '') || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recent')
              const reporterName = typeof issue.reporter === 'object' ? issue.reporter?.name : (typeof issue.reporter === 'string' ? 'Citizen' : 'Citizen')

              return (
                <article
                  key={key}
                  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900/90"
                  onClick={() => onOpenIssue?.(issueId)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-blue-400">{complaintId}</p>
                      <h3 className="mt-1 truncate text-sm font-semibold text-white">{issue.title}</h3>
                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1 text-blue-300 font-medium">
                          <UserRound size={13} className="text-blue-400" /> {reporterName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={13} className="text-slate-500" /> {departmentName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={13} className="text-slate-500" /> {officerName}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={13} className="text-slate-500" /> {dateText}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-xl border border-slate-800 bg-slate-950/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                          {issue.status}
                        </span>
                        {issue.currentStage && (
                          <span className="truncate text-[11px] text-slate-500">Stage: {issue.currentStage}</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white">
                        View <ArrowUpRight size={14} className="text-blue-400" />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

