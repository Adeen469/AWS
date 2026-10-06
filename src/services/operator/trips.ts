/**
 * Operator Trip Service
 * Abstracts API calls for trip data.
 * Swap mock imports for real API calls once Developer 1's backend is ready.
 */

import type {
  Trip,
  ItineraryItem,
  Transportation,
  Accommodation,
  Activity,
} from '@/types/operator'
import {
  mockTrips,
  mockItinerary,
  mockTransportation,
  mockAccommodation,
  mockActivities,
} from './mock/mockTrips'

const USE_MOCK = true // flip to false when real API is ready

export async function getTrips(): Promise<Trip[]> {
  if (USE_MOCK) {
    await delay(400)
    return mockTrips
  }
  const res = await apiFetch('/api/trips')
  return res.json()
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  if (USE_MOCK) {
    await delay(300)
    return mockTrips.find((t) => t.id === tripId) ?? null
  }
  const res = await apiFetch(`/api/trips/${tripId}`)
  if (res.status === 404) return null
  return res.json()
}

export async function getTripItinerary(tripId: string): Promise<ItineraryItem[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockItinerary[tripId] ?? []
  }
  const res = await apiFetch(`/api/trips/${tripId}/itinerary`)
  return res.json()
}

export async function getTripTransportation(tripId: string): Promise<Transportation[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockTransportation[tripId] ?? []
  }
  const res = await apiFetch(`/api/trips/${tripId}/transportation`)
  return res.json()
}

export async function getTripAccommodation(tripId: string): Promise<Accommodation[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockAccommodation[tripId] ?? []
  }
  const res = await apiFetch(`/api/trips/${tripId}/accommodation`)
  return res.json()
}

export async function getTripActivities(tripId: string): Promise<Activity[]> {
  if (USE_MOCK) {
    await delay(300)
    return mockActivities[tripId] ?? []
  }
  const res = await apiFetch(`/api/trips/${tripId}/activities`)
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
