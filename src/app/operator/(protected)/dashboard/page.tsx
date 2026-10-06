'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatsCard from '@/components/operator/ui/StatsCard'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import { getDashboardStats, getRecentActivity, getActiveDisruptions } from '@/services/operator/dashboard'
import { getTrips } from '@/services/operator/trips'
import type { DashboardStats, RecentActivity, Disruption, Trip } from '@/types/operator'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [activeTrips, setActiveTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [s, a, d, t] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getActiveDisruptions(),
        getTrips(),
      ])
      setStats(s)
      setActivity(a)
      setDisruptions(d)
      setActiveTrips(t.filter((tr) => tr.status === 'active'))
    } catch {
      setError('Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingState message="Loading dashboard..." />
  if (error) return <ErrorState message={error} onRetry={load} />

  return (
    <div>
      <PageHeader
        title="Operator Dashboard"
        description="Real-time overview of active trips, disruptions, and recovery status."
      />

      {/* Stats */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatsCard
            title="Active Trips"
            value={stats.activeTrips}
            icon={<TripIcon />}
          />
          <StatsCard
            title="Upcoming Trips"
            value={stats.upcomingTrips}
            icon={<CalendarIcon />}
          />
          <StatsCard
            title="Today's Bookings"
            value={stats.todaysBookings}
            icon={<BookingIcon />}
          />
          <StatsCard
            title="Open Disruptions"
            value={stats.openDisruptions}
            highlight={stats.openDisruptions > 0}
            icon={<AlertIcon />}
          />
          <StatsCard
            title="Pending Recoveries"
            value={stats.pendingRecoveries}
            highlight={stats.pendingRecoveries > 0}
            icon={<RecoveryIcon />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Disruptions — P0 highlight */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Active Disruptions</h2>
              <Link
                href="/operator/disruptions"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {disruptions.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-400">
                  No active disruptions
                </p>
              ) : (
                disruptions.map((d) => (
                  <div key={d.id} className="flex items-start gap-4 px-5 py-4">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      d.severity === 'critical' ? 'bg-red-700 text-white' :
                      d.severity === 'high' ? 'bg-red-100 text-red-600' :
                      d.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <AlertIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 capitalize">
                          {d.type.replace(/_/g, ' ')}
                        </span>
                        <StatusBadge status={d.severity} />
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Trip: {d.tripRef}</p>
                      <p className="mt-1 text-sm text-gray-600">{d.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {d.affectedServices.map((s) => (
                          <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link
                      href={`/operator/disruptions/${d.id}`}
                      className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      View Impact
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Trips Table */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="font-semibold text-gray-900">Active Trips</h2>
              <Link href="/operator/trips" className="text-sm font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Trip</th>
                    <th className="px-5 py-3">Traveler</th>
                    <th className="px-5 py-3">Destination</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Disruptions</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium text-gray-900">{trip.tripRef}</td>
                      <td className="px-5 py-3 text-gray-600">{trip.traveler.name}</td>
                      <td className="px-5 py-3 text-gray-600">{trip.destination}</td>
                      <td className="px-5 py-3"><StatusBadge status={trip.status} /></td>
                      <td className="px-5 py-3">
                        {trip.activeDisruptions > 0 ? (
                          <span className="flex items-center gap-1 text-red-600 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {trip.activeDisruptions}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/operator/trips/${trip.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No recent activity</p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-gray-800">{item.action}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    <span>{item.time}</span>
                    <span>·</span>
                    <Link href={`/operator/trips/${item.tripId}`} className="text-blue-500 hover:underline">
                      {item.tripRef}
                    </Link>
                    <span>·</span>
                    <span>{item.operator}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inline icons ─────────────────────────────────────────────────────────────

function TripIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  )
}

function RecoveryIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}
