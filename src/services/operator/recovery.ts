import type { RecoveryResult, ApprovalRequest, ApprovalResult } from '@/types/operator'
import { mockRecoveryOptions } from './mock/mockRecovery'

const USE_MOCK = true

export async function getRecoveryOptions(disruptionId: string): Promise<RecoveryResult | null> {
  if (USE_MOCK) {
    await delay(800)
    return mockRecoveryOptions[disruptionId] ?? null
  }
  const res = await apiFetch(`/api/disruptions/${disruptionId}/recovery-options`)
  if (res.status === 404) return null
  return res.json()
}

export async function approveRecovery(request: ApprovalRequest): Promise<ApprovalResult> {
  if (USE_MOCK) {
    await delay(1000)
    return {
      success: true,
      tripId: request.tripId,
      optionId: request.selectedOptionId,
      updatedAt: new Date().toISOString(),
      changes: {
        transportation: true,
        itinerary: true,
        booking: true,
        auditCreated: true,
        travelerNotified: true,
      },
      message: 'Recovery approved. Trip successfully updated.',
    }
  }
  const res = await apiFetch(
    `/api/trips/${request.tripId}/recovery-options/${request.selectedOptionId}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  )
  return res.json()
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.detail ?? res.statusText }
  }
  return res
}
