import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const nearbyIssues = [
  { id: '7', title: 'Manhole cover missing near Railway Station', category: 'Road', status: 'Resolved', area: 'Railway Station' },
  { id: '4', title: 'Street light not working on Jhansi Rani Road', category: 'Street Light', status: 'In Progress', area: 'Jhansi Rani Road' },
  { id: '8', title: 'Garbage dump attracting stray dogs', category: 'Garbage', status: 'Pending', area: 'Lakadganj' },
]

const statusColors = {
  Resolved: 'text-green-400',
  Pending: 'text-yellow-400',
  'In Progress': 'text-blue-400',
}

export default function NearbyIssuesContent() {
  const navigate = useNavigate()

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {nearbyIssues.map((issue) => (
        <motion.button
          key={issue.id}
          whileHover={{ y: -2 }}
          onClick={() => navigate(`/issues/${issue.id}`)}
          className="group rounded-lg border border-slate-700/30 bg-slate-800/40 p-3 text-left transition-colors hover:border-slate-600/50"
        >
          <p className="text-xs font-medium text-white">{issue.title}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">{issue.category}</span>
            <span className={`text-[10px] font-medium ${statusColors[issue.status] || 'text-slate-400'}`}>
              {issue.status}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  )
}