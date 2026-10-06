'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getBookings } from '@/services/operator/bookings'
import type { Booking, BookingType, BookingStatus } from '@/types/operator'

const TYPE_ICONS: Record<BookingType, string> = {
  flight: '✈️',
  hotel: '🏨',
  transport: '🚗',
  activity: '🎯',
}

const STATUS_FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Modified', value: 'modified' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filtered, setFiltered] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getBookings()
      setBookings(data)
      setFiltered(data)
    } catch {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = bookings
    if (statusFilter !== 'all') result = result.filter((b) => b.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.travelerName.toLowerCase().includes(q) ||
          b.vendor.toLowerCase().includes(q) ||
          b.tripRef.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, bookings])

  const totalCost = filtered.reduce((sum, b) => sum + b.cost, 0)

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="All bookings across flights, hotels, transport and activities."
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search bookings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === f.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading bookings..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No bookings found." />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Booking ID</th>
                  <th className="px-5 py-3">Trip</th>
                  <th className="px-5 py-3">Traveler</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Cost</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-gray-700">{b.id}</td>
                    <td className="px-5 py-3.5 font-medium text-blue-600">{b.tripRef}</td>
                    <td className="px-5 py-3.5 text-gray-700">{b.travelerName}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 capitalize text-gray-700">
                        <span>{TYPE_ICONS[b.type]}</span>
                        {b.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{b.vendor}</td>
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {new Date(b.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      {b.currency}{b.cost.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
            <span>{filtered.length} booking{filtered.length !== 1 ? 's' : ''}</span>
            <span className="font-semibold text-gray-700">
              Total: ₹{totalCost.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
