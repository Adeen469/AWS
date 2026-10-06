'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getTrips } from '@/services/operator/trips'
import type { Trip, TripStatus } from '@/types/operator'

const STATUS_FILTERS: { label: string; value: TripStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filtered, setFiltered] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TripStatus | 'all'>('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getTrips()
      setTrips(data)
      setFiltered(data)
    } catch {
      setError('Failed to load trips. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = trips
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.tripRef.toLowerCase().includes(q) ||
          t.traveler.name.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, trips])

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Manage and monitor all traveler trips."
      />

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search by trip, traveler, destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {/* Status tabs */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === f.value
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading trips..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No trips found." description="Try adjusting your search or filter." />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Trip ID</th>
                  <th className="px-5 py-3">Traveler</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Travel Dates</th>
                  <th className="px-5 py-3">Budget</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Coordinator</th>
                  <th className="px-5 py-3">Disruptions</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{trip.tripRef}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900">{trip.traveler.name}</div>
                      <div className="text-xs text-gray-400">{trip.traveler.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{trip.destination}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {trip.currency}{trip.budget.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={trip.status} /></td>
                    <td className="px-5 py-3.5 text-gray-600">{trip.coordinator}</td>
                    <td className="px-5 py-3.5">
                      {trip.activeDisruptions > 0 ? (
                        <span className="flex items-center gap-1.5 font-medium text-red-600">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          {trip.activeDisruptions} active
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/operator/trips/${trip.id}`}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition"
                      >
                        View Trip
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            Showing {filtered.length} of {trips.length} trips
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
