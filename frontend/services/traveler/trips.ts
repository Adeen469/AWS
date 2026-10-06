import { CreateTripPayload, Trip, ApiResponse } from '@/types/traveler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export async function getTrips(accessToken: string): Promise<Trip[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch trips')
  }

  const data: ApiResponse<Trip[]> = await response.json()
  return data.data || []
}

export async function getTripById(tripId: string, accessToken: string): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch trip')
  }

  const data: ApiResponse<Trip> = await response.json()
  if (!data.data) {
    throw new Error('Trip not found')
  }

  return data.data
}

export async function createTrip(
  payload: CreateTripPayload,
  accessToken: string
): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create trip')
  }

  const data: ApiResponse<Trip> = await response.json()
  if (!data.data) {
    throw new Error('Failed to create trip')
  }

  return data.data
}

export async function updateTrip(
  tripId: string,
  payload: Partial<CreateTripPayload>,
  accessToken: string
): Promise<Trip> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to update trip')
  }

  const data: ApiResponse<Trip> = await response.json()
  if (!data.data) {
    throw new Error('Failed to update trip')
  }

  return data.data
}

export async function deleteTrip(tripId: string, accessToken: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to delete trip')
  }
}
