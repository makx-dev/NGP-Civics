const priorityConfig = {
  Low: { bg: 'bg-green-500/10', text: 'text-green-400' },
  Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  High: { bg: 'bg-red-500/10', text: 'text-red-400' },
}

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.Medium

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {priority}
    </span>
  )
}