'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getCustomers } from '@/services/operator/customers'
import type { Customer } from '@/types/operator'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getCustomers()
      setCustomers(data)
      setFiltered(data)
    } catch {
      setError('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(customers); return }
    const q = search.toLowerCase()
    setFiltered(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      )
    )
  }, [search, customers])

  return (
    <div>
      <PageHeader
        title="Customers"
        description="View and manage all registered travelers."
      />

      <div className="mb-5 relative max-w-sm">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading customers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No customers found." />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Active Trips</th>
                  <th className="px-5 py-3">Total Trips</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{c.phone}</td>
                    <td className="px-5 py-3.5">
                      {c.activeTrips > 0 ? (
                        <span className="flex items-center gap-1.5 font-medium text-blue-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {c.activeTrips}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{c.totalTrips}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            {filtered.length} customer{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
