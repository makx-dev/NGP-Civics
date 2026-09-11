import { Bell, Building2, CheckCircle2, Clock3, FileText, ShieldCheck, UsersRound } from 'lucide-react'

export default function SummaryPanel({ counts, onQuickAction, onSelectFilter }) {
  return (
    <div className="sticky top-[72px] space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Command Summary</p>
          <h3 className="mt-1 text-base font-bold tracking-tight text-white">Action Required</h3>
        </div>

        <div className="mt-4 grid gap-2.5">
          <button
            type="button"
            onClick={() => onSelectFilter?.({ type: 'Pending' })}
            className="group rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Bell size={13} />
                </span>
                Pending Review
              </span>
              <span className="font-mono text-sm font-bold text-white">{counts?.Pending ?? 0}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilter?.({ type: 'Overdue' })}
            className="group rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Clock3 size={13} />
                </span>
                Overdue Work
              </span>
              <span className="font-mono text-sm font-bold text-white">{counts?.Overdue ?? 0}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilter?.({ type: 'Citizen Verification' })}
            className="group rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck size={13} />
                </span>
                Citizen Verification
              </span>
              <span className="font-mono text-sm font-bold text-white">{counts?.CitizenVerificationPending ?? 0}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectFilter?.({ type: 'Resolved' })}
            className="group rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-left transition-all hover:border-slate-700 hover:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-300">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <CheckCircle2 size={13} />
                </span>
                Resolved Today
              </span>
              <span className="font-mono text-sm font-bold text-white">{counts?.ResolvedToday ?? 0}</span>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Quick Actions</p>
            <p className="mt-1 text-sm font-bold text-white">Administrative Tools</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => onQuickAction?.('ManageDepartments')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-left text-xs font-medium text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Building2 size={15} className="text-blue-400" /> Manage Departments
            </span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickAction?.('ManageUsers')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-left text-xs font-medium text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <UsersRound size={15} className="text-blue-400" /> Manage Users
            </span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickAction?.('GenerateReports')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-left text-xs font-medium text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <FileText size={15} className="text-blue-400" /> Generate Reports
            </span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            type="button"
            onClick={() => onQuickAction?.('ViewAllIssues')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-left text-xs font-medium text-slate-200 transition-all hover:border-slate-700 hover:bg-slate-900 hover:text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Bell size={15} className="text-blue-400" /> View All Issues
            </span>
            <span className="text-slate-500">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}


