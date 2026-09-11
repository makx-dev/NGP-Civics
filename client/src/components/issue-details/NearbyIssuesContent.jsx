import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../../lib/api'

const statusColors = {
  Resolved: 'text-emerald-400',
  Pending: 'text-amber-400',
  'Complaint Submitted': 'text-amber-400',
  'In Progress': 'text-blue-400',
  'Work Started': 'text-blue-400',
  'Engineer Assigned': 'text-blue-400',
}

export default function NearbyIssuesContent({ currentIssueId }) {
  const navigate = useNavigate()
  const [nearby, setNearby] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    api
      .get('/issues/mine')
      .then((res) => {
        if (isMounted && Array.isArray(res.data)) {
          const filtered = res.data.filter((i) => (i._id || i.id) !== currentIssueId).slice(0, 3)
          setNearby(filtered)
        }
      })
      .catch(() => {
        if (isMounted) setNearby([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [currentIssueId])

  if (loading) {
    return <div className="text-xs text-slate-500 animate-pulse">Loading related issues...</div>
  }

  if (nearby.length === 0) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-950/30 p-4 text-center text-xs text-slate-500">
        No other reports registered in this vicinity yet.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {nearby.map((issue) => {
        const id = issue._id || issue.id
        const catName = typeof issue.category === 'object' ? issue.category?.name : (issue.category || 'Civic')
        return (
          <motion.button
            key={id}
            whileHover={{ y: -2 }}
            onClick={() => navigate(`/issues/${id}`)}
            className="group rounded-lg border border-slate-700/30 bg-slate-800/40 p-3 text-left transition-colors hover:border-slate-600/50 hover:bg-slate-800/60"
          >
            <p className="line-clamp-2 text-xs font-medium text-white">{issue.title}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">{catName}</span>
              <span className={`text-[10px] font-medium ${statusColors[issue.status] || 'text-slate-400'}`}>
                {issue.status}
              </span>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}