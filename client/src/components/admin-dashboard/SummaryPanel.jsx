import { Bell, Building2, ShieldCheck, UsersRound, FileText } from 'lucide-react'

export default function SummaryPanel({ counts, onQuickAction, onSelectFilter }) {
  return (
    <div className="sticky top-[72px] space-y-4">
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm shadow-xl shadow-black/10">
        <div>
          <p className="text-xs font-semibold text-slate-400">Command summary</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-white">What needs attention</h3>
        </div>

        <div className="mt-4 grid gap-3">
          <button
            onClick={() => onSelectFilter?.({ type: 'Pending' })}
            className="rounded-xl border border-slate-700 bg-slate-950/30 p-3 text-left transition-colors hover:border-slate-600/60"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <Bell size={16} className="text-blue-300" /> Pending
              </span>
              <span className="font-semibold text-white">{counts?.Pending ?? 0}</span>
            </div>
          </button>

          <button
            onClick={() => onSelectFilter?.({ type: 'Overdue' })}
            className="rounded-xl border border-slate-700 bg-slate-950/30 p-3 text-left transition-colors hover:border-slate-600/60"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <Bell size={16} className="text-red-300" /> Overdue
              </span>
              <span className="font-semibold text-white">{counts?.Overdue ?? 0}</span>
            </div>
          </button>

          <button
            onClick={() => onSelectFilter?.({ type: 'Citizen Verification' })}
            className="rounded-xl border border-slate-700 bg-slate-950/30 p-3 text-left transition-colors hover:border-slate-600/60"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-200" /> Citizen verification pending
              </span>
              <span className="font-semibold text-white">{counts?.CitizenVerificationPending ?? 0}</span>
            </div>
          </button>

          <button
            onClick={() => onSelectFilter?.({ type: 'ResolvedToday' })}
            className="rounded-xl border border-slate-700 bg-slate-950/30 p-3 text-left transition-colors hover:border-slate-600/60"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2">
                <UsersRound size={16} className="text-green-200" /> Resolved today
              </span>
              <span className="font-semibold text-white">{counts?.ResolvedToday ?? 0}</span>
            </div>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">Quick actions</p>
            <p className="mt-1 text-sm font-semibold text-white">Execute common admin tasks</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <button
            onClick={() => onQuickAction?.('ManageDepartments')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/30 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600/70 hover:bg-slate-800/30"
          >
            <span className="inline-flex items-center gap-2"><Building2 size={15} /> Manage Departments</span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            onClick={() => onQuickAction?.('ManageUsers')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/30 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600/70 hover:bg-slate-800/30"
          >
            <span className="inline-flex items-center gap-2"><UsersRound size={15} /> Manage Users</span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            onClick={() => onQuickAction?.('GenerateReports')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/30 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600/70 hover:bg-slate-800/30"
          >
            <span className="inline-flex items-center gap-2"><FileText size={15} /> Generate Reports</span>
            <span className="text-slate-500">→</span>
          </button>

          <button
            onClick={() => onQuickAction?.('ViewAllIssues')}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/30 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600/70 hover:bg-slate-800/30"
          >
            <span className="inline-flex items-center gap-2"><Bell size={15} /> View all issues</span>
            <span className="text-slate-500">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

