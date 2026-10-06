'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/operator/layout/PageHeader'
import StatusBadge from '@/components/operator/ui/StatusBadge'
import LoadingState from '@/components/operator/ui/LoadingState'
import ErrorState from '@/components/operator/ui/ErrorState'
import { getDisruptionById, getImpactAnalysis } from '@/services/operator/disruptions'
import { getRecoveryOptions } from '@/services/operator/recovery'
import type { Disruption, ImpactAnalysis, RecoveryResult } from '@/types/operator'

type Phase = 'disruption' | 'analyzing' | 'impact' | 'recovery'

export default function DisruptionDetailPage({
  params,
}: {
  params: Promise<{ disruptionId: string }>
}) {
  const { disruptionId } = use(params)
  const router = useRouter()

  const [disruption, setDisruption] = useState<Disruption | null>(null)
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null)
  const [recovery, setRecovery] = useState<RecoveryResult | null>(null)
  const [phase, setPhase] = useState<Phase>('disruption')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const d = await getDisruptionById(disruptionId)
      if (!d) { setError('Disruption not found.'); return }
      setDisruption(d)
    } catch {
      setError('Failed to load disruption.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [disruptionId])

  async function handleAnalyzeImpact() {
    if (!disruption) return
    setPhase('analyzing')
    setError('')
    try {
      const [imp, rec] = await Promise.all([
        getImpactAnalysis(disruptionId),
        getRecoveryOptions(disruptionId),
      ])
      setImpact(imp)
      setRecovery(rec)
      setPhase('impact')
    } catch {
      setError('Impact analysis failed. Please try again.')
      setPhase('disruption')
    }
  }

  if (loading) return <LoadingState message="Loading disruption..." />
  if (error && !disruption) return <ErrorState message={error} onRetry={load} />
  if (!disruption) return <ErrorState message="Disruption not found." />

  return (
    <div>
      <PageHeader
        title="Disruption Detail"
        description={`${disruption.tripRef} · ${disruption.type.replace(/_/g, ' ')}`}
        actions={
          <Link
            href="/operator/disruptions"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Back
          </Link>
        }
      />

      {/* Progress stepper */}
      <Stepper phase={phase} />

      <div className="mt-6 space-y-6">
        {/* Step 1 — Disruption info */}
        <DisruptionInfo disruption={disruption} />

        {/* Analyze button */}
        {phase === 'disruption' && (
          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeImpact}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analyze Impact
            </button>
          </div>
        )}

        {/* Analyzing spinner */}
        {phase === 'analyzing' && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-8 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="font-medium text-blue-700">Running impact analysis…</p>
            <p className="mt-1 text-sm text-blue-500">
              Identifying affected services and generating recovery options
            </p>
          </div>
        )}

        {/* Step 2 — Impact Analysis */}
        {(phase === 'impact' || phase === 'recovery') && impact && (
          <ImpactSection impact={impact} />
        )}

        {/* Step 3 — Recovery Options */}
        {(phase === 'impact' || phase === 'recovery') && recovery && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recovery Options</h2>
              <Link
                href="/operator/recovery"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition"
              >
                Compare & Approve →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recovery.options.map((opt) => (
                <RecoveryOptionCard key={opt.id} option={opt} />
              ))}
            </div>
          </div>
        )}

        {error && <ErrorState message={error} />}
      </div>
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ phase }: { phase: Phase }) {
  const steps = [
    { id: 'disruption', label: 'Disruption' },
    { id: 'analyzing', label: 'Analyzing' },
    { id: 'impact', label: 'Impact' },
    { id: 'recovery', label: 'Recovery' },
  ]
  const currentIndex = steps.findIndex((s) => s.id === phase)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex
        const isActive = idx === currentIndex
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                isDone ? 'bg-blue-600 text-white' :
                isActive ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : idx + 1}
              </div>
              <span className={`mt-1 text-xs ${isActive ? 'font-semibold text-blue-700' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-4 rounded ${idx < currentIndex ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Disruption info ──────────────────────────────────────────────────────────

function DisruptionInfo({ disruption: d }: { disruption: Disruption }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Disruption Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow label="Type" value={d.type.replace(/_/g, ' ')} capitalize />
        <InfoRow label="Trip" value={d.tripRef} />
        <InfoRow label="Severity" value={<StatusBadge status={d.severity} />} />
        <InfoRow label="Status" value={<StatusBadge status={d.status} />} />
        <InfoRow
          label="Reported At"
          value={new Date(d.occurredAt).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          })}
        />
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Description</p>
        <p className="mt-1 text-sm text-gray-700">{d.description}</p>
      </div>
      {d.affectedServices.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Affected Services</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {d.affectedServices.map((s) => (
              <span key={s} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Impact section ───────────────────────────────────────────────────────────

function ImpactSection({ impact }: { impact: ImpactAnalysis }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-900">Impact Analysis</h2>

      {/* Metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Affected Services', value: impact.affectedServicesCount },
          { label: 'Affected Bookings', value: impact.affectedBookingsCount },
          { label: 'Affected Activities', value: impact.affectedActivitiesCount },
          { label: 'Est. Delay', value: `${impact.estimatedDelayMinutes} min` },
          { label: 'Extra Cost', value: `${impact.currency}${impact.estimatedExtraCost.toLocaleString()}` },
          { label: 'Severity', value: <StatusBadge status={impact.overallSeverity} /> },
        ].map((m) => (
          <div key={m.label} className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-400">{m.label}</p>
            <div className="mt-1 font-bold text-gray-900">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Impact tree */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Affected Services Tree
        </p>
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Root Disruption</span>
            <StatusBadge status={impact.overallSeverity} />
          </div>

          <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
            {impact.affectedItems.map((item, idx) => (
              <div key={item.id} className="relative">
                {/* connector dot */}
                <div className="absolute -left-5 top-3 h-2 w-2 rounded-full bg-gray-300" />
                <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">
                          {item.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{item.impact}</p>
                    </div>
                    <StatusBadge status={item.severity} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Recovery option card (preview) ──────────────────────────────────────────

function RecoveryOptionCard({ option: opt }: { option: import('@/types/operator').RecoveryOption }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${
      opt.recommended ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-gray-900">{opt.label}</span>
        {opt.recommended && (
          <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white">
            ★ Recommended
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <MetricRow label="Extra Cost" value={`${opt.currency}${opt.extraCost.toLocaleString()}`} />
        <MetricRow label="Delay" value={`${opt.delayMinutes} minutes`} />
        <MetricRow label="Preference Match" value={`${opt.preferenceMatch}%`} highlight={opt.preferenceMatch >= 90} />
        <MetricRow label="Availability" value={opt.availability} capitalize />
      </div>
      <p className="mt-3 text-xs text-gray-500">{opt.description}</p>
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function InfoRow({
  label, value, capitalize = false,
}: {
  label: string
  value: React.ReactNode
  capitalize?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <div className={`mt-0.5 text-sm font-medium text-gray-800 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function MetricRow({
  label, value, highlight = false, capitalize = false,
}: {
  label: string
  value: string
  highlight?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${highlight ? 'text-green-700' : 'text-gray-800'} ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </span>
    </div>
  )
}
