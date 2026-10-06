'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getVendors } from '@/services/operator/vendors'
import type { Vendor, VendorType } from '@/types/operator'

const TYPE_LABELS: Record<VendorType, string> = {
  hotel: 'Hotel',
  airline: 'Airline',
  transport_provider: 'Transport',
  activity_provider: 'Activity',
}

const TYPE_ICONS: Record<VendorType, string> = {
  hotel: '🏨',
  airline: '✈️',
  transport_provider: '🚗',
  activity_provider: '🎯',
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filtered, setFiltered] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<VendorType | 'all'>('all')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getVendors()
      setVendors(data)
      setFiltered(data)
    } catch {
      setError('Failed to load vendors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let result = vendors
    if (typeFilter !== 'all') result = result.filter((v) => v.type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (v) => v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q)
      )
    }
    setFiltered(result)
  }, [search, typeFilter, vendors])

  const vendorTypes: { label: string; value: VendorType | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Hotels', value: 'hotel' },
    { label: 'Airlines', value: 'airline' },
    { label: 'Transport', value: 'transport_provider' },
    { label: 'Activities', value: 'activity_provider' },
  ]

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage hotels, airlines, transport, and activity providers."
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
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {vendorTypes.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                typeFilter === f.value ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading vendors..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No vendors found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}
    </div>
  )
}

function VendorCard({ vendor: v }: { vendor: Vendor }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">{TYPE_ICONS[v.type]}</span>
          <div>
            <p className="font-semibold text-gray-900">{v.name}</p>
            <p className="text-xs text-gray-400">{TYPE_LABELS[v.type]}</p>
          </div>
        </div>
        <StatusBadge status={v.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Location</span>
          <span className="text-gray-700">{v.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Availability</span>
          <StatusBadge status={v.availability} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Rating</span>
          <span className="flex items-center gap-1 font-semibold text-yellow-600">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {v.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
