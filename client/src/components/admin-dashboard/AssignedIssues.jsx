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
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6 text-center">
            <p className="text-sm font-semibold text-slate-200">No assigned issues.</p>
            <p className="mt-1 text-xs text-slate-500">Assign complaints from the priority queue.</p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3">
            {issues.slice(0, 6).map((issue) => (
              <article
                key={issue.id}
                className="cursor-pointer rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4 transition-colors hover:border-slate-600/70"
                onClick={() => onOpenIssue?.(issue.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-500">{issue.complaintId}</p>
                    <h3 className="mt-1 truncate text-sm font-semibold text-white">{issue.title}</h3>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={14} /> {issue.department || '—'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={14} /> {issue.assignedOfficer || 'Officer pending'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={14} /> {issue.lastUpdated || issue.reportedDate}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="rounded-xl border border-slate-700 bg-slate-950/30 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                        {issue.status}
                      </span>
                      {issue.currentStage && (
                        <span className="truncate text-[11px] text-slate-500">Stage: {issue.currentStage}</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-950/20 px-3 py-2 text-xs font-semibold text-slate-200">
                      View details <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

