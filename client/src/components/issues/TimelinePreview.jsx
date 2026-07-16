const defaultTimeline = [
  { label: 'Submitted', key: 'submitted' },
  { label: 'Assigned', key: 'assigned' },
  { label: 'Engineer Assigned', key: 'engineer_assigned' },
  { label: 'Inspection', key: 'inspection' },
  { label: 'Work Started', key: 'work_started' },
  { label: 'Completed', key: 'completed' },
]

export default function TimelinePreview({ currentStatus }) {
  const statusOrder = [
    'Pending',
    'Assigned',
    'Engineer Assigned',
    'Inspection',
    'In Progress',
    'Citizen Verification',
    'Completed',
    'Resolved',
    'Rejected',
    'Reopened',
  ]

  const currentIndex = statusOrder.indexOf(currentStatus)
  if (currentIndex === -1) return null

  // Determine which default timeline steps are completed / current / upcoming
  const relevantSteps = defaultTimeline.filter((step) => {
    const stepIndex = statusOrder.indexOf(step.label)
    return stepIndex >= 0
  })

  return (
    <div className="flex items-center gap-0.5">
      {relevantSteps.map((step, idx) => {
        const stepIndex = statusOrder.indexOf(step.label)
        const isCompleted = stepIndex < currentIndex
        const isCurrent = stepIndex === currentIndex
        const isUpcoming = stepIndex > currentIndex

        let dotClass = 'bg-slate-600'
        if (isCompleted) dotClass = 'bg-green-500'
        if (isCurrent) dotClass = 'bg-blue-500'

        let lineClass = 'bg-slate-600'
        if (isCompleted) lineClass = 'bg-green-500'
        if (isCurrent && idx > 0) lineClass = 'bg-green-500'

        return (
          <div key={step.key} className="flex items-center">
            {idx > 0 && <div className={`h-0.5 w-2 ${lineClass}`} />}
            <div
              className={`flex h-2 w-2 items-center justify-center rounded-full ${dotClass}`}
              title={step.label}
            />
            {idx < relevantSteps.length - 1 && <div className={`h-0.5 w-2 ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`} />}
          </div>
        )
      })}
    </div>
  )
}