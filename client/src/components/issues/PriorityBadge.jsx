import { AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react'

const priorityConfig = {
  Low: { bg: 'bg-green-500/10', text: 'text-green-400', icon: ArrowDown },
  Medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', icon: AlertTriangle },
  High: { bg: 'bg-red-500/10', text: 'text-red-400', icon: ArrowUp },
}

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.Medium
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon size={12} />
      {priority}
    </span>
  )
}