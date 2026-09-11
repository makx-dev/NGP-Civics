import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock3,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  Copy,
  Check,
} from 'lucide-react'
import api from '../../lib/api'
import StatusBadge from '../issues/StatusBadge'

export default function CitizenProfileModal({ citizenId, citizenInitial, onClose, onSelectIssue }) {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!citizenId) return
    let mounted = true
    setIsLoading(true)
    setError(null)

    api.get(`/admin/citizens/${citizenId}`)
      .then((res) => {
        if (mounted) {
          setData(res.data)
        }
      })
      .catch((err) => {
        console.warn('Could not fetch citizen details:', err.message)
        if (mounted) {
          // If 404 or fallback, use initial reporter info
          if (citizenInitial) {
            setData({
              user: citizenInitial,
              stats: {
                total: 1,
                resolved: citizenInitial.status === 'Resolved' ? 1 : 0,
                active: citizenInitial.status !== 'Resolved' ? 1 : 0,
                resolutionRate: citizenInitial.status === 'Resolved' ? 100 : 0,
              },
              recentIssues: [],
            })
          } else {
            setError('Could not load citizen profile.')
          }
        }
      })
      .finally(() => {
        if (mounted) setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [citizenId, citizenInitial])

  const copyContact = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const user = data?.user || citizenInitial || {}
  const stats = data?.stats || { total: 0, resolved: 0, active: 0, resolutionRate: 0 }
  const recentIssues = data?.recentIssues || []

  const userInitials = (user.name || 'Citizen')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Registered Citizen'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60"
      >
        {/* Header with gradient banner */}
        <div className="relative border-b border-slate-800 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-900 p-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/20 text-xl font-bold text-blue-300 shadow-inner">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full rounded-2xl object-cover" />
              ) : (
                userInitials
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-xl font-bold text-white">{user.name || 'Citizen Reporter'}</h2>
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-300">
                  <ShieldCheck size={12} /> Verified Citizen
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={13} className="text-slate-500" /> Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin text-blue-400" />
              <span className="text-xs">Loading citizen profile & records...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center text-xs text-slate-400">
              {error}
            </div>
          ) : (
            <>
              {/* Contact Information Cards */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Citizen Contact & Address
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={13} className="text-blue-400" /> Email Address
                      </span>
                      {user.email && (
                        <button
                          type="button"
                          onClick={() => copyContact(user.email)}
                          className="text-slate-500 hover:text-white"
                          title="Copy Email"
                        >
                          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium text-white font-mono">
                      {user.email || 'Not provided'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={13} className="text-blue-400" /> Contact Number
                      </span>
                      {user.phone && (
                        <a
                          href={`tel:${user.phone}`}
                          className="text-[11px] font-semibold text-blue-400 hover:underline"
                        >
                          Call
                        </a>
                      )}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium text-white font-mono">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 sm:col-span-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin size={13} className="text-blue-400" /> Residential Address / Area
                    </span>
                    <p className="mt-1.5 text-xs font-medium text-slate-200">
                      {user.address || 'Nagpur Municipal Corporation Area'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Civic Activity & Reporting Stats */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Civic Reporting Statistics
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-[11px] text-slate-400">Total Filed</p>
                    <p className="mt-1 text-lg font-bold text-white font-mono">{stats.total}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-[11px] text-slate-400">Resolved</p>
                    <p className="mt-1 text-lg font-bold text-emerald-400 font-mono">{stats.resolved}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-[11px] text-slate-400">In Progress</p>
                    <p className="mt-1 text-lg font-bold text-blue-400 font-mono">{stats.active}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                    <p className="text-[11px] text-slate-400">Resolution Rate</p>
                    <p className="mt-1 text-lg font-bold text-blue-300 font-mono">{stats.resolutionRate}%</p>
                  </div>
                </div>
              </div>

              {/* Recent Complaints Reported by this Citizen */}
              {recentIssues.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Complaints Filed by this Citizen ({recentIssues.length})
                  </p>
                  <div className="mt-3 space-y-2">
                    {recentIssues.map((item) => {
                      const cid = item.complaintId || `NGP-${String(item._id).slice(-4).toUpperCase()}`
                      const category = typeof item.category === 'object' ? item.category?.name : item.category || 'General'

                      return (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 transition-colors hover:border-slate-700 hover:bg-slate-950"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-blue-400">#{cid}</span>
                              <span className="truncate text-xs font-medium text-white">{item.title}</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {category} • {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={item.status} size="sm" />
                            <button
                              type="button"
                              onClick={() => {
                                onClose()
                                if (onSelectIssue) onSelectIssue(item._id)
                                else navigate(`/admin/issues/${item._id}`)
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                              title="View Issue"
                            >
                              <ArrowUpRight size={14} className="text-blue-400" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  )
}
