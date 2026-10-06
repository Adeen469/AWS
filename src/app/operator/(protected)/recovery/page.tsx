'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import EmptyState from '@/components/operator/ui/EmptyState'
import { getRecoveryOptions, approveRecovery } from '@/services/operator/recovery'
import { getDisruptionById } from '@/services/operator/disruptions'
import type { RecoveryOption, RecoveryResult, Disruption, ApprovalResult } from '@/types/operator'

// Wrap in Suspense boundary because useSearchParams needs it
export default function RecoveryPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading recovery options..." />}>
      <RecoveryContent />
    </Suspense>
  )
}

function RecoveryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const disruptionId = searchParams.get('disruptionId') ?? 'dis-001' // default to demo disruption

  const [disruption, setDisruption] = useState<Disruption | null>(null)
  const [result, setResult] = useState<RecoveryResult | null>(null)
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set())
  const [selectedOption, setSelectedOption] = useState<RecoveryOption | null>(null)
  const [showApproval, setShowApproval] = useState(false)
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null)
  const [approving, setApproving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'cards' | 'compare'>('cards')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [d, r] = await Promise.all([
        getDisruptionById(disruptionId),
        getRecoveryOptions(disruptionId),
      ])
      setDisruption(d)
      setResult(r)
    } catch {
      setError('Failed to load recovery options.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [disruptionId])

  function toggleCompare(id: string) {
    setCompareSet((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < 2) {
        next.add(id)
      }
      return next
    })
  }

  async function handleApprove() {
    if (!selectedOption || !result) return
    setApproving(true)
    setError('')
    try {
      const res = await approveRecovery({
        tripId: result.tripId,
        disruptionId: result.disruptionId,
        selectedOptionId: selectedOption.id,
      })
      setApprovalResult(res)
      setShowApproval(false)
    } catch (err: unknown) {
      const apiError = err as { status?: number; message?: string }
      if (apiError?.status === 409) {
        setError('This recovery option is no longer available. Please refresh and review the latest options.')
      } else {
        setError('Something went wrong approving the recovery. Please try again.')
      }
    } finally {
      setApproving(false)
    }
  }

  if (loading) return <LoadingState message="Loading recovery options..." />
  if (error && !result) return <ErrorState message={error} onRetry={load} />
  if (!result) return <EmptyState message="No recovery options available." description="Run impact analysis first from the disruption page." />

  // Success state
  if (approvalResult?.success) {
    return <ApprovalSuccess result={approvalResult} tripId={result.tripId} />
  }

  const compareOptions = result.options.filter((o) => compareSet.has(o.id))

  return (
    <div>
      <PageHeader
        title="Recovery Options"
        description={disruption ? `${disruption.tripRef} · ${disruption.type.replace(/_/g, ' ')}` : 'Select and approve a recovery plan'}
        actions={
          <div className="flex gap-2">
            <Link href="/operator/disruptions" className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
              ← Disruptions
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* View toggle */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setView('cards')}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${view === 'cards' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Options
          </button>
          <button
            onClick={() => setView('compare')}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${view === 'compare' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Compare {compareSet.size > 0 && `(${compareSet.size})`}
          </button>
        </div>
        {compareSet.size === 0 && (
          <p className="text-xs text-gray-400">Select up to 2 options to compare</p>
        )}
      </div>

      {view === 'cards' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {result.options.map((opt) => (
            <RecoveryCard
              key={opt.id}
              option={opt}
              isComparing={compareSet.has(opt.id)}
              onToggleCompare={() => toggleCompare(opt.id)}
              onViewDetails={() => { setSelectedOption(opt); setShowApproval(true) }}
              onApprove={() => { setSelectedOption(opt); setShowApproval(true) }}
            />
          ))}
        </div>
      )}

      {view === 'compare' && (
        compareOptions.length < 2 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">Select exactly 2 options from the Options tab to compare.</p>
            <button onClick={() => setView('cards')} className="mt-3 text-sm text-blue-600 hover:underline">
              Go to Options
            </button>
          </div>
        ) : (
          <ComparisonTable
            options={compareOptions}
            onApprove={(opt) => { setSelectedOption(opt); setShowApproval(true) }}
          />
        )
      )}

      {/* Approval modal */}
      {showApproval && selectedOption && (
        <ApprovalModal
          option={selectedOption}
          tripRef={disruption?.tripRef ?? result.tripId}
          onCancel={() => setShowApproval(false)}
          onConfirm={handleApprove}
          isLoading={approving}
        />
      )}
    </div>
  )
}

// ─── Recovery Card ────────────────────────────────────────────────────────────

function RecoveryCard({
  option: opt,
  isComparing,
  onToggleCompare,
  onApprove,
}: {
  option: RecoveryOption
  isComparing: boolean
  onToggleCompare: () => void
  onViewDetails: () => void
  onApprove: () => void
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm transition ${
      opt.recommended
        ? 'border-green-200 bg-green-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{opt.label}</span>
          {opt.recommended && (
            <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">
              ★ Recommended
            </span>
          )}
        </div>
        <StatusBadge status={opt.availability} />
      </div>

      {/* Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <MetricBox
          label="Extra Cost"
          value={`${opt.currency}${opt.extraCost.toLocaleString()}`}
          sub={opt.extraCost === 0 ? 'No extra cost' : undefined}
        />
        <MetricBox
          label="Additional Delay"
          value={`${opt.delayMinutes} min`}
          highlight={opt.delayMinutes <= 60}
        />
        <MetricBox
          label="Preference Match"
          value={`${opt.preferenceMatch}%`}
          highlight={opt.preferenceMatch >= 90}
        />
        <MetricBox
          label="Availability"
          value={opt.availability}
          capitalize
        />
      </div>

      {/* Description */}
      <p className="mb-4 text-sm text-gray-600">{opt.description}</p>

      {/* Changes */}
      {opt.details.length > 0 && (
        <ul className="mb-4 space-y-1">
          {opt.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {detail}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleCompare}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition ${
            isComparing
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {isComparing ? '✓ Comparing' : 'Compare'}
        </button>
        <button
          onClick={onApprove}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition ${
            opt.recommended
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Approve
        </button>
      </div>
    </div>
  )
}

// ─── Comparison table ─────────────────────────────────────────────────────────

function ComparisonTable({
  options,
  onApprove,
}: {
  options: RecoveryOption[]
  onApprove: (opt: RecoveryOption) => void
}) {
  const metrics = [
    { label: 'Extra Cost', render: (o: RecoveryOption) => `${o.currency}${o.extraCost.toLocaleString()}` },
    { label: 'Additional Delay', render: (o: RecoveryOption) => `${o.delayMinutes} min` },
    { label: 'Preference Match', render: (o: RecoveryOption) => `${o.preferenceMatch}%` },
    { label: 'Availability', render: (o: RecoveryOption) => o.availability },
    { label: 'Recommended', render: (o: RecoveryOption) => o.recommended ? 'Yes' : 'No' },
  ]

  const [a, b] = options

  function isBetter(metric: string, opt: RecoveryOption) {
    if (metric === 'Extra Cost') return opt.extraCost === Math.min(a.extraCost, b.extraCost)
    if (metric === 'Additional Delay') return opt.delayMinutes === Math.min(a.delayMinutes, b.delayMinutes)
    if (metric === 'Preference Match') return opt.preferenceMatch === Math.max(a.preferenceMatch, b.preferenceMatch)
    if (metric === 'Recommended') return opt.recommended
    return false
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 w-40">
                Metric
              </th>
              {options.map((opt) => (
                <th key={opt.id} className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base font-bold text-gray-900">{opt.label}</span>
                    {opt.recommended && (
                      <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                        ★ Recommended
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {metrics.map((metric) => (
              <tr key={metric.label} className="hover:bg-gray-50/50">
                <td className="px-6 py-3.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                  {metric.label}
                </td>
                {options.map((opt) => {
                  const better = isBetter(metric.label, opt)
                  return (
                    <td key={opt.id} className="px-6 py-3.5 text-center">
                      <span className={`font-semibold capitalize ${
                        better ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {metric.render(opt)}
                        {better && (
                          <span className="ml-1.5 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                            ✓ Better
                          </span>
                        )}
                      </span>
                    </td>
                  )
                })}
              </tr>
            ))}
            {/* Approve row */}
            <tr className="bg-gray-50">
              <td className="px-6 py-4 text-xs font-medium uppercase tracking-wide text-gray-400">
                Action
              </td>
              {options.map((opt) => (
                <td key={opt.id} className="px-6 py-4 text-center">
                  <button
                    onClick={() => onApprove(opt)}
                    className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition ${
                      opt.recommended
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Approve {opt.label}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Approval Modal ───────────────────────────────────────────────────────────

function ApprovalModal({
  option: opt,
  tripRef,
  onCancel,
  onConfirm,
  isLoading,
}: {
  option: RecoveryOption
  tripRef: string
  onCancel: () => void
  onConfirm: () => void
  isLoading: boolean
}) {
  const changes = [
    'Update transportation',
    'Update itinerary',
    'Update affected bookings',
    'Create audit record',
    'Trigger traveler notification',
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 id="approval-title" className="text-lg font-semibold text-gray-900">
            Approve Recovery?
          </h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Summary */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Trip</span>
              <span className="font-semibold text-gray-900">{tripRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selected Option</span>
              <span className="font-semibold text-gray-900">{opt.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Extra Cost</span>
              <span className="font-semibold text-gray-900">
                {opt.currency}{opt.extraCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Additional Delay</span>
              <span className="font-semibold text-gray-900">{opt.delayMinutes} minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Preference Match</span>
              <span className="font-semibold text-green-700">{opt.preferenceMatch}%</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* What this will do */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              This will:
            </p>
            <ul className="space-y-1.5">
              {changes.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Approving…
              </>
            ) : (
              'Approve Recovery'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Approval Success ─────────────────────────────────────────────────────────

function ApprovalSuccess({ result, tripId }: { result: ApprovalResult; tripId: string }) {
  const changes = [
    { label: 'Transportation updated', done: result.changes.transportation },
    { label: 'Itinerary updated', done: result.changes.itinerary },
    { label: 'Booking updated', done: result.changes.booking },
    { label: 'Audit record created', done: result.changes.auditCreated },
    { label: 'Traveler notified', done: result.changes.travelerNotified },
  ]

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Recovery Approved</h1>
      <p className="mt-2 text-gray-500">Trip successfully updated.</p>

      <div className="mt-6 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-sm text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Updated:</p>
        <ul className="space-y-2">
          {changes.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5 text-sm">
              <svg
                className={`h-4 w-4 shrink-0 ${c.done ? 'text-green-500' : 'text-gray-300'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className={c.done ? 'text-gray-800' : 'text-gray-400'}>{c.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/operator/trips/${tripId}`}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          View Updated Trip
        </Link>
        <Link
          href="/operator/audit"
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Audit Log
        </Link>
      </div>
    </div>
  )
}

// ─── Metric box ───────────────────────────────────────────────────────────────

function MetricBox({
  label, value, sub, highlight = false, capitalize = false,
}: {
  label: string
  value: string
  sub?: string
  highlight?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="rounded-lg bg-white/70 border border-gray-100 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${highlight ? 'text-green-700' : 'text-gray-900'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
