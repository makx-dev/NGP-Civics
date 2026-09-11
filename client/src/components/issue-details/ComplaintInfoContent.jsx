export default function ComplaintInfoContent({ issue }) {
  const categoryName = typeof issue.category === 'object' ? issue.category?.name : (issue.category || 'General')
  const departmentName = issue.department || (typeof issue.assignedAdmin === 'object' ? issue.assignedAdmin?.department : null) || 'Civic Services'
  const reporterName = typeof issue.reporter === 'object' ? (issue.reporter?.name || issue.reporter?.email || 'Citizen') : (issue.reporter || 'Citizen')
  const issueId = issue.id || issue._id
  const complaintId = issue.complaintId || (issueId ? String(issueId).slice(-6).toUpperCase() : 'CIVIC-REQ')
  const areaName = issue.area || issue.ward || issue.location?.address || 'Nagpur'
  const dateText = issue.reportedDate || (issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Recent')

  const fields = [
    { label: 'Category', value: categoryName },
    { label: 'Priority', value: issue.priority || 'Medium' },
    { label: 'Complaint ID', value: `#${complaintId}` },
    { label: 'Department', value: departmentName },
    { label: 'Reporter', value: reporterName },
    { label: 'Reported Date', value: dateText },
    { label: 'Area', value: areaName },
    { label: 'Ward', value: issue.ward || 'Ward 12' },
    { label: 'Latitude', value: issue.lat || issue.location?.coordinates?.lat || '21.1458' },
    { label: 'Longitude', value: issue.lng || issue.location?.coordinates?.lng || '79.0882' },
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