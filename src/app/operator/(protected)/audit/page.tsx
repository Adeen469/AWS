'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getAuditLogs } from '@/services/operator/audit'
import type { AuditEvent, AuditAction } from '@/types/operator'

const ACTION_LABELS: Record<AuditAction, string> = {
  recovery_approved: 'Recovery Approved',
  disruption_created: 'Disruption Created',
  impact_analyzed: 'Impact Analyzed',
  trip_updated: 'Trip Updated',
  booking_changed: 'Booking Changed',
  traveler_notified: 'Traveler Notified',
}

const ACTION_COLORS: Record<AuditAction, string> = {
  recovery_approved: 'bg-green-100 text-green-700',
  disruption_created: 'bg-red-100 text-red-700',
  impact_analyzed: 'bg-blue-100 text-blue-700',
  trip_updated: 'bg-indigo-100 text-indigo-700',
  booking_changed: 'bg-yellow-100 text-yellow-700',
  traveler_notified: 'bg-purple-100 text-purple-700',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEvent[]>([])
  const [filtered, setFiltered] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await getAuditLogs()
      setLogs(data)
      setFiltered(data)
    } catch {
      setError('Failed to load audit log.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) { setFiltered(logs); return }
    const q = search.toLowerCase()
    setFiltered(
      logs.filter(
        (l) =>
          l.tripRef.toLowerCase().includes(q) ||
          l.operator.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.reason.toLowerCase().includes(q)
      )
    )
  }, [search, logs])

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Complete history of operator actions and system events."
      />

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search by trip, operator, action…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <LoadingState message="Loading audit log..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No audit records found." />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Operator</th>
                  <th className="px-5 py-3">Action</th>
                  <th className="px-5 py-3">Trip</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr
                      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                      onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{log.operator}</td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_COLORS[log.action]}`}>
                          {ACTION_LABELS[log.action]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/operator/trips/${log.tripId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {log.tripRef}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{log.reason}</td>
                      <td className="px-5 py-3.5">
                        <svg
                          className={`h-4 w-4 text-gray-400 transition-transform ${expanded === log.id ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expanded === log.id && (
                      <tr key={`${log.id}-detail`} className="bg-blue-50/40">
                        <td colSpan={6} className="px-5 py-4">
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                Previous State
                              </p>
                              <p className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-gray-700">
                                {log.previousState}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                                New State
                              </p>
                              <p className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-sm text-gray-700">
                                {log.newState}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  )
}
