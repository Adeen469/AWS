'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import {
  getTripById,
  getTripItinerary,
  getTripTransportation,
  getTripAccommodation,
  getTripActivities,
} from '@/services/operator/trips'
import { getDisruptions } from '@/services/operator/disruptions'
import { getBookings } from '@/services/operator/bookings'
import { getAuditLogs } from '@/services/operator/audit'
import type {
  Trip, ItineraryItem, Transportation, Accommodation, Activity, Disruption, Booking, AuditEvent,
} from '@/types/operator'

type Tab = 'itinerary' | 'transport' | 'accommodation' | 'activities' | 'bookings' | 'disruptions' | 'audit'

const TABS: { id: Tab; label: string }[] = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'transport', label: 'Transport' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'activities', label: 'Activities' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'disruptions', label: 'Disruptions' },
  { id: 'audit', label: 'Audit' },
]

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = use(params)

  const [trip, setTrip] = useState<Trip | null>(null)
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [transport, setTransport] = useState<Transportation[]>([])
  const [accommodation, setAccommodation] = useState<Accommodation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [disruptions, setDisruptions] = useState<Disruption[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [audit, setAudit] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('itinerary')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [t, itin, trans, acc, act, dis, bk, aud] = await Promise.all([
        getTripById(tripId),
        getTripItinerary(tripId),
        getTripTransportation(tripId),
        getTripAccommodation(tripId),
        getTripActivities(tripId),
        getDisruptions(tripId),
        getBookings(tripId),
        getAuditLogs(tripId),
      ])
      if (!t) { setError('Trip not found.'); return }
      setTrip(t)
      setItinerary(itin)
      setTransport(trans)
      setAccommodation(acc)
      setActivities(act)
      setDisruptions(dis)
      setBookings(bk)
      setAudit(aud)
    } catch {
      setError('Failed to load trip details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [tripId])

  if (loading) return <LoadingState message="Loading trip details..." />
  if (error || !trip) return <ErrorState message={error || 'Trip not found.'} onRetry={load} />

  const hasDisruptions = disruptions.some((d) => d.status === 'active')

  return (
    <div>
      <PageHeader
        title={`${trip.tripRef} — ${trip.destination}`}
        description={`${formatDate(trip.startDate)} → ${formatDate(trip.endDate)}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/operator/trips"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              ← Back
            </Link>
            {hasDisruptions && (
              <Link
                href="/operator/disruptions"
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                View Disruption
              </Link>
            )}
          </div>
        }
      />

      {/* Active disruption banner */}
      {hasDisruptions && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium text-red-700">
            This trip has an active disruption requiring attention.
          </span>
          <Link
            href={`/operator/disruptions/${disruptions.find((d) => d.status === 'active')?.id}`}
            className="ml-auto text-sm font-semibold text-red-600 hover:underline"
          >
            Analyze Impact →
          </Link>
        </div>
      )}

      {/* Trip overview */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard title="Traveler">
          <p className="font-semibold text-gray-900">{trip.traveler.name}</p>
          <p className="text-sm text-gray-500">{trip.traveler.email}</p>
          <p className="text-sm text-gray-500">{trip.traveler.phone}</p>
        </InfoCard>
        <InfoCard title="Trip">
          <Row label="Destination" value={trip.destination} />
          <Row label="Travel Style" value={trip.travelStyle} />
          <Row label="Budget" value={`${trip.currency}${trip.budget.toLocaleString()}`} />
          <Row label="Status" value={<StatusBadge status={trip.status} />} />
        </InfoCard>
        <InfoCard title="Operations">
          <Row label="Coordinator" value={trip.coordinator} />
          <Row label="Start" value={formatDate(trip.startDate)} />
          <Row label="End" value={formatDate(trip.endDate)} />
          <Row label="Active Disruptions" value={
            trip.activeDisruptions > 0
              ? <span className="font-semibold text-red-600">{trip.activeDisruptions}</span>
              : <span className="text-gray-400">None</span>
          } />
        </InfoCard>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-700'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.id === 'disruptions' && disruptions.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-600">
                  {disruptions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'itinerary' && (
            <ItineraryTab items={itinerary} />
          )}
          {activeTab === 'transport' && (
            <TransportTab items={transport} />
          )}
          {activeTab === 'accommodation' && (
            <AccommodationTab items={accommodation} />
          )}
          {activeTab === 'activities' && (
            <ActivitiesTab items={activities} />
          )}
          {activeTab === 'bookings' && (
            <BookingsTab items={bookings} />
          )}
          {activeTab === 'disruptions' && (
            <DisruptionsTab items={disruptions} tripId={tripId} />
          )}
          {activeTab === 'audit' && (
            <AuditTab items={audit} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Tab content components ───────────────────────────────────────────────────

function ItineraryTab({ items }: { items: ItineraryItem[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No itinerary items.</p>
  const grouped = items.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
    if (!acc[item.day]) acc[item.day] = []
    acc[item.day].push(item)
    return acc
  }, {})
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([day, dayItems]) => (
        <div key={day}>
          <h4 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Day {day}</h4>
          <div className="space-y-2">
            {dayItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <span className="w-14 text-sm font-medium text-gray-500">{item.time}</span>
                <span className="flex-1 text-sm font-medium text-gray-900">{item.activity}</span>
                <span className="text-sm text-gray-500">{item.location}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TransportTab({ items }: { items: Transportation[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No transportation records.</p>
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <div key={t.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 capitalize">{t.type} · {t.carrier}</span>
            <StatusBadge status={t.status} />
          </div>
          <div className="mt-1 flex gap-6 text-sm text-gray-600">
            <span>{t.from} → {t.to}</span>
            <span>{formatDateTime(t.departureTime)} → {formatDateTime(t.arrivalTime)}</span>
            <span className="text-gray-400">Ref: {t.bookingRef}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function AccommodationTab({ items }: { items: Accommodation[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No accommodation records.</p>
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <div key={a.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{a.hotelName}</span>
            <StatusBadge status={a.status} />
          </div>
          <div className="mt-1 flex gap-6 text-sm text-gray-600">
            <span>{a.location}</span>
            <span>Check-in: {formatDate(a.checkIn)}</span>
            <span>Check-out: {formatDate(a.checkOut)}</span>
            <span>{a.roomType}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivitiesTab({ items }: { items: Activity[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No activities.</p>
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex-1">
            <span className="font-medium text-gray-900">{a.name}</span>
            <p className="text-xs text-gray-500">{a.location} · {a.vendor}</p>
          </div>
          <span className="text-sm text-gray-500">{formatDate(a.date)} at {a.time}</span>
          <StatusBadge status={a.status} />
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ items }: { items: Booking[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No bookings.</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs font-medium uppercase text-gray-400">
            <th className="pb-2">Booking ID</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Vendor</th>
            <th className="pb-2">Date</th>
            <th className="pb-2">Cost</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map((b) => (
            <tr key={b.id}>
              <td className="py-2.5 font-medium text-gray-800">{b.id}</td>
              <td className="py-2.5 capitalize text-gray-600">{b.type}</td>
              <td className="py-2.5 text-gray-600">{b.vendor}</td>
              <td className="py-2.5 text-gray-600">{formatDate(b.date)}</td>
              <td className="py-2.5 text-gray-700">{b.currency}{b.cost.toLocaleString()}</td>
              <td className="py-2.5"><StatusBadge status={b.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DisruptionsTab({ items, tripId }: { items: Disruption[]; tripId: string }) {
  if (!items.length) return <p className="text-sm text-gray-400">No disruptions for this trip.</p>
  return (
    <div className="space-y-3">
      {items.map((d) => (
        <div key={d.id} className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 capitalize">{d.type.replace(/_/g, ' ')}</span>
                <StatusBadge status={d.severity} />
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600">{d.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {d.affectedServices.map((s) => (
                  <span key={s} className="rounded-full bg-white border border-red-200 px-2 py-0.5 text-xs text-red-700">{s}</span>
                ))}
              </div>
            </div>
            <Link
              href={`/operator/disruptions/${d.id}`}
              className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Analyze Impact
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function AuditTab({ items }: { items: AuditEvent[] }) {
  if (!items.length) return <p className="text-sm text-gray-400">No audit history.</p>
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div key={a.id} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 capitalize">{a.action.replace(/_/g, ' ')}</span>
            <span className="text-xs text-gray-400">{formatDateTime(a.timestamp)}</span>
          </div>
          <p className="mt-0.5 text-gray-500">By: {a.operator}</p>
          <p className="mt-1 text-gray-600">{a.previousState} → {a.newState}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Helper components ────────────────────────────────────────────────────────

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800">{value}</span>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
