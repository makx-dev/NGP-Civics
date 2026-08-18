import { FilePlus2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CommunityImpact from '../components/dashboard/CommunityImpact'
import EmptyState from '../components/dashboard/EmptyState'
import IssueCard from '../components/dashboard/IssueCard'
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton'
import Navbar from '../components/dashboard/Navbar'
import NotificationCard from '../components/dashboard/NotificationCard'
import QuickActions from '../components/dashboard/QuickActions'
import RecentActivity from '../components/dashboard/RecentActivity'
import Sidebar from '../components/dashboard/Sidebar'
import StatCard from '../components/dashboard/StatCard'
import { citizenDashboardData } from '../data/citizenDashboardData'
import { clearAuth, getAuth } from '../lib/auth'

export default function CitizenDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const [isLoading] = useState(false)
  const navigate = useNavigate()
  const name = getAuth()?.account?.name || 'Citizen'
  const signOut = () => { clearAuth(); navigate('/auth') }

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const updateMode = () => {
      setIsMobile(media.matches)
      if (!media.matches) setMobileMenuOpen(false)
    }
    media.addEventListener('change', updateMode)
    return () => media.removeEventListener('change', updateMode)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) setMobileMenuOpen((isOpen) => !isOpen)
    else setSidebarExpanded((isExpanded) => !isExpanded)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        expanded={sidebarExpanded}
        isMobile={isMobile}
        name={name}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={signOut}
      />

      <div
        className="flex min-w-0 flex-1 flex-col"
        style={{ marginLeft: isMobile ? 0 : (sidebarExpanded ? 260 : 72) }}
      >
        <Navbar name={name} onMenu={toggleSidebar} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {isLoading ? <LoadingSkeleton /> : <>
              <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/15 sm:p-8">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="text-sm font-medium text-blue-400">Citizen dashboard</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Good Evening, {name.split(' ')[0]}.</h1><p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">Every report helps improve Nagpur.</p></div><button onClick={() => navigate('/citizen/report')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/40"><FilePlus2 size={18} />Report New Issue</button></div>
              </section>

              <section className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Report statistics">{citizenDashboardData.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

              <div className="mt-8 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
                <section><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight text-white">Active issues</h2><p className="mt-1 text-sm text-slate-400">Follow every step from submission to resolution.</p></div><button className="text-sm font-semibold text-blue-400">View all issues</button></div>{citizenDashboardData.issues.length ? <div className="space-y-5">{citizenDashboardData.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div> : <EmptyState />}</section>
                <aside className="space-y-5"><section className="rounded-xl border border-slate-700 bg-slate-800/80 p-5 shadow-lg shadow-black/10"><div className="mb-5 flex items-center justify-between"><div><p className="text-base font-semibold text-white">Notifications</p><p className="mt-1 text-sm text-slate-400">Your latest updates</p></div><button className="text-sm font-semibold text-blue-400">View all</button></div><div className="space-y-3">{citizenDashboardData.notifications.map((notification) => <NotificationCard key={`${notification.title}-${notification.time}`} notification={notification} />)}</div></section><QuickActions /><CommunityImpact impact={citizenDashboardData.impact} /></aside>
              </div>

              <section className="mt-8 max-w-3xl"><RecentActivity items={citizenDashboardData.activity} /></section>
            </>}
          </div>
        </main>
      </div>
    </div>
  )
}