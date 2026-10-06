import type { Disruption, ImpactAnalysis } from '@/types/operator'
import { mockDisruptions, mockImpactAnalysis } from './mock/mockDisruptions'

const USE_MOCK = true

export async function getDisruptions(tripId?: string): Promise<Disruption[]> {
  if (USE_MOCK) {
    await delay(400)
    return tripId
      ? mockDisruptions.filter((d) => d.tripId === tripId)
      : mockDisruptions
  }
  const url = tripId ? `/api/trips/${tripId}/disruptions` : '/api/disruptions'
  const res = await apiFetch(url)
  return res.json()
}

export async function getDisruptionById(id: string): Promise<Disruption | null> {
  if (USE_MOCK) {
    await delay(300)
    return mockDisruptions.find((d) => d.id === id) ?? null
  }
  const res = await apiFetch(`/api/disruptions/${id}`)
  if (res.status === 404) return null
  return res.json()
}

export async function createDisruption(
  tripId: string,
  data: Partial<Disruption>
): Promise<Disruption> {
  if (USE_MOCK) {
    await delay(600)
    const newDisruption: Disruption = {
      id: `dis-${Date.now()}`,
      tripId,
      tripRef: data.tripRef ?? '',
      type: data.type ?? 'flight_delay',
      description: data.description ?? '',
      severity: data.severity ?? 'medium',
      status: 'active',
      occurredAt: new Date().toISOString(),
      affectedServices: [],
    }
    return newDisruption
  }
  const res = await apiFetch(`/api/trips/${tripId}/disruptions`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getImpactAnalysis(disruptionId: string): Promise<ImpactAnalysis | null> {
  if (USE_MOCK) {
    await delay(800)
    return mockImpactAnalysis[disruptionId] ?? null
  }
  const res = await apiFetch(`/api/disruptions/${disruptionId}/impact-analysis`)
  if (res.status === 404) return null
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
