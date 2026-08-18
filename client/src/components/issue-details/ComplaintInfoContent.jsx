export default function ComplaintInfoContent({ issue }) {
  const fields = [
    { label: 'Category', value: issue.category },
    { label: 'Priority', value: issue.priority },
    { label: 'Complaint ID', value: `#${issue.complaintId}` },
    { label: 'Department', value: issue.department },
    { label: 'Reporter', value: issue.reporter || 'Citizen' },
    { label: 'Reported Date', value: issue.reportedDate },
    { label: 'Area', value: issue.area },
    { label: 'Ward', value: issue.ward || 'Ward 12' },
    { label: 'Latitude', value: issue.lat || '21.1458' },
    { label: 'Longitude', value: issue.lng || '79.0882' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:grid-cols-5">
      {fields.map((f) => (
        <div key={f.label} className="rounded-lg border border-slate-700/30 bg-slate-800/40 p-2.5">
          <span className="text-slate-500">{f.label}</span>
          <p className="mt-0.5 font-medium text-slate-200">{f.value}</p>
        </div>
      ))}
    </div>
  )
}