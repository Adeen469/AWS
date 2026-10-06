import type { Booking } from '@/types/operator'
import { mockBookings } from './mock/mockBookings'

const USE_MOCK = true

export async function getBookings(tripId?: string): Promise<Booking[]> {
  if (USE_MOCK) {
    await delay(400)
    return tripId ? mockBookings.filter((b) => b.tripId === tripId) : mockBookings
  }
  const url = tripId ? `/api/trips/${tripId}/bookings` : '/api/bookings'
  const res = await apiFetch(url)
  return res.json()
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiFetch(path: string, options?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.detail ?? res.statusText }
  }
  return res
}
