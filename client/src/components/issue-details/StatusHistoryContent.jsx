export default function StatusHistoryContent({ history = [] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-6 text-center text-xs text-slate-500">
        No status history recorded yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-700/50 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <th className="py-2.5 pr-4">Transition</th>
            <th className="py-2.5 pr-4">Updated By</th>
            <th className="py-2.5 pr-4">Date & Time</th>
            <th className="py-2.5 pr-4">Remarks / Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, idx) => {
            const actorName = row.changedByAdmin?.name
              ? `Admin: ${row.changedByAdmin.name} (${row.changedByAdmin.department || 'NMC'})`
              : row.changedByUser?.name
              ? `Citizen: ${row.changedByUser.name}`
              : 'System'

            return (
              <tr key={row._id || idx} className="border-b border-slate-800/50 text-xs last:border-0 hover:bg-slate-800/30">
                <td className="py-3 pr-4 font-semibold text-slate-200">
                  {row.fromStatus} → <span className="text-blue-400">{row.toStatus}</span>
                </td>
                <td className="py-3 pr-4 text-slate-300">{actorName}</td>
                <td className="py-3 pr-4 text-slate-400">
                  {new Date(row.changedAt || Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 pr-4 text-slate-300 italic">{row.remark || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}