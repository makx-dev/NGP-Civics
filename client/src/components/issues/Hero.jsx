import { motion } from 'framer-motion'

export default function Hero({ stats }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-slate-700/50 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-6 backdrop-blur-sm sm:p-8"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-400">Citizen Workspace</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">My Issues</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
          Track every complaint you've submitted.
        </p>
      </div>

      {/* Mini stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>
    </motion.section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-700/30 bg-slate-900/40 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</p>
    </div>
  )
}
