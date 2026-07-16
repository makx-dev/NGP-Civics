import { motion } from 'framer-motion'
import { ArrowUpDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'

export default function IssueTable({ issues, sortField, sortDir, onSort }) {
  const columns = [
    { key: 'complaintId', label: 'Complaint ID', sortable: true },
    { key: 'title', label: 'Issue', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'area', label: 'Area', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'reportedDate', label: 'Reported Date', sortable: true },
    { key: 'lastUpdated', label: 'Last Updated', sortable: true },
  ]

  const handleSort = (key) => {
    if (!key) return
    onSort(key)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-900/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-200' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="inline-flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <ArrowUpDown
                        size={12}
                        className={`transition-colors ${
                          sortField === col.key ? 'text-blue-400' : 'text-slate-600'
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, idx) => (
              <motion.tr
                key={issue.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
                className="border-b border-slate-800/50 transition-colors last:border-0 hover:bg-slate-800/40"
              >
                <td className="px-4 py-3 font-mono text-xs font-medium text-slate-300">
                  #{issue.complaintId}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-white">
                  {issue.title}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{issue.category}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{issue.department}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{issue.area}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={issue.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                  {issue.reportedDate}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-400">
                  {issue.lastUpdated || issue.reportedDate}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}