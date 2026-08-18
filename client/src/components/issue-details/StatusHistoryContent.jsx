const history = [
  { status: 'Submitted', updatedBy: 'Citizen', dept: 'Citizen', date: '12 Jul 2026', time: '09:15 AM', remarks: 'Complaint submitted via NGP Civics portal' },
  { status: 'Assigned', updatedBy: 'Rahul Sharma', dept: 'NMC Control Room', date: '12 Jul 2026', time: '11:30 AM', remarks: 'Assigned to Road Department' },
  { status: 'Engineer Assigned', updatedBy: 'Amit Verma', dept: 'NMC Road Department', date: '13 Jul 2026', time: '08:00 AM', remarks: 'Engineer assigned for inspection' },
  { status: 'Inspection', updatedBy: 'Amit Verma', dept: 'NMC Road Department', date: '14 Jul 2026', time: '10:15 AM', remarks: 'Inspection completed. Work order issued.' },
  { status: 'In Progress', updatedBy: 'Suresh Patil', dept: 'Contractor Team', date: '15 Jul 2026', time: '07:30 AM', remarks: 'Repair work has started' },
  { status: 'Completed', updatedBy: 'Amit Verma', dept: 'NMC Road Department', date: '16 Jul 2026', time: '04:00 PM', remarks: 'Repair completed. Quality check passed.' },
  { status: 'Citizen Verification', updatedBy: 'System', dept: 'Auto', date: '16 Jul 2026', time: '04:00 PM', remarks: 'Awaiting citizen confirmation' },
]

export default function StatusHistoryContent() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-700/50 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Updated By</th>
            <th className="py-2 pr-4">Department</th>
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Time</th>
            <th className="py-2 pr-4">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {history.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-800/50 text-xs last:border-0 hover:bg-slate-800/30">
              <td className="py-2.5 pr-4 font-medium text-slate-200">{row.status}</td>
              <td className="py-2.5 pr-4 text-slate-400">{row.updatedBy}</td>
              <td className="py-2.5 pr-4 text-slate-400">{row.dept}</td>
              <td className="py-2.5 pr-4 text-slate-400">{row.date}</td>
              <td className="py-2.5 pr-4 text-slate-400">{row.time}</td>
              <td className="py-2.5 pr-4 text-slate-500">{row.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}