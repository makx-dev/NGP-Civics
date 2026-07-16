import { CheckCircle2, CircleDashed, Clock3, FileText } from 'lucide-react'

const config = { slate: { icon: FileText, classes: 'bg-slate-700 text-slate-200' }, amber: { icon: Clock3, classes: 'bg-amber-500/15 text-amber-400' }, blue: { icon: CircleDashed, classes: 'bg-blue-500/15 text-blue-400' }, green: { icon: CheckCircle2, classes: 'bg-green-500/15 text-green-400' } }

export default function StatCard({ label, value, tone }) { const { icon: Icon, classes } = config[tone]; return <article className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/10"><div className="flex items-start justify-between"><p className="text-sm font-medium text-slate-400">{label}</p><span className={`grid h-10 w-10 place-items-center rounded-xl ${classes}`}><Icon size={20} /></span></div><p className="mt-5 text-3xl font-semibold tracking-tight text-white">{value}</p><p className="mt-1 text-xs text-slate-500">Your civic reports</p></article> }
