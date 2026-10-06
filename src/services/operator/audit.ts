import type { AuditEvent } from '@/types/operator'
import { mockAuditEvents } from './mock/mockAudit'

const USE_MOCK = true

export async function getAuditLogs(tripId?: string): Promise<AuditEvent[]> {
  if (USE_MOCK) {
    await delay(400)
    return tripId
      ? mockAuditEvents.filter((e) => e.tripId === tripId)
      : mockAuditEvents
  }
  const url = tripId ? `/api/trips/${tripId}/audit` : '/api/audit'
  const res = await apiFetch(url)
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
