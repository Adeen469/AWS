'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getDisruptions } from '@/services/operator/disruptions'
import { getTrips } from '@/services/operator/trips'
import type { Disruption, DisruptionType, Trip } from '@/types/operator'

const DISRUPTION_LABELS: Record<DisruptionType, string> = {
  flight_delay: 'Flight Delay',
  flight_cancellation: 'Flight Cancellation',
  hotel_unavailable: 'Hotel Unavailable',
  activity_cancelled: 'Activity Cancelled',
  transport_delay: 'Transport Delay',
  weather_disruption: 'Weather Disruption',
  vendor_unavailable: 'Vendor Unavailable',
  traveler_preference_change: 'Traveler Preference Change',
}

export default function DisruptionsPage() {
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [d, t] = await Promise.all([getDisruptions(), getTrips()])
      setDisruptions(d)
      setTrips(t)
    } catch {
      setError('Failed to load disruptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const activeDisruptions = disruptions.filter((d) => d.status === 'active')
  const resolvedDisruptions = disruptions.filter((d) => d.status !== 'active')

  return (
    <div>
      <PageHeader
        title="Disruption Management"
        description="Monitor active disruptions and trigger impact analysis."
      />

      {loading ? (
        <LoadingState message="Loading disruptions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          {/* Active disruptions */}
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">Active Disruptions</h2>
              {activeDisruptions.length > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                  {activeDisruptions.length}
                </span>
              )}
            </div>

            {activeDisruptions.length === 0 ? (
              <EmptyState
                message="No active disruptions."
                description="All trips are running smoothly."
              />
            ) : (
              <div className="space-y-4">
                {activeDisruptions.map((d) => (
                  <DisruptionCard key={d.id} disruption={d} />
                ))}
              </div>
            )}
          </section>

          {/* Resolved / past disruptions */}
          {resolvedDisruptions.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-semibold text-gray-800">Resolved Disruptions</h2>
              <div className="space-y-3">
                {resolvedDisruptions.map((d) => (
                  <DisruptionCard key={d.id} disruption={d} muted />
                ))}
              </div>
            </section>
          )}

          {disruptions.length === 0 && (
            <EmptyState message="No disruptions found." />
          )}
        </>
      )}
    </div>
  )
}

// ─── Disruption card ──────────────────────────────────────────────────────────

function DisruptionCard({ disruption: d, muted = false }: { disruption: Disruption; muted?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      !muted && d.severity === 'critical' ? 'border-red-300 bg-red-50' :
      !muted && d.severity === 'high' ? 'border-orange-200 bg-orange-50' :
      'border-gray-200 bg-white'
    }`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-base font-semibold ${muted ? 'text-gray-500' : 'text-gray-900'}`}>
              {DISRUPTION_LABELS[d.type]}
            </span>
            <StatusBadge status={d.severity} />
            <StatusBadge status={d.status} />
          </div>

          {/* Trip + time */}
          <div className="mt-1.5 flex flex-wrap gap-4 text-sm text-gray-500">
            <span>
              <span className="font-medium text-gray-700">Trip:</span> {d.tripRef}
            </span>
            <span>
              <span className="font-medium text-gray-700">Reported:</span>{' '}
              {new Date(d.occurredAt).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          {/* Description */}
          <p className="mt-2 text-sm text-gray-700">{d.description}</p>

          {/* Affected services */}
          {d.affectedServices.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Affected:
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {d.affectedServices.map((s) => (
                  <span
                    key={s}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      muted ? 'bg-gray-100 text-gray-500' : 'bg-white border border-orange-200 text-orange-700'
                    }`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action */}
        {!muted && (
          <Link
            href={`/operator/disruptions/${d.id}`}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Analyze Impact →
          </Link>
        )}
      </div>
    </div>
  )
}
