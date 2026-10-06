import { ItineraryDay, ItineraryItem, ApiResponse } from '@/types/traveler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

export async function getItinerary(
  tripId: string,
  accessToken: string
): Promise<ItineraryDay[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/itinerary`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch itinerary')
  }

  const data: ApiResponse<ItineraryDay[]> = await response.json()
  return data.data || []
}

export async function generateItinerary(
  tripId: string,
  accessToken: string
): Promise<ItineraryDay[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/itinerary/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to generate itinerary')
  }

  const data: ApiResponse<ItineraryDay[]> = await response.json()
  return data.data || []
}

export async function addItineraryItem(
  tripId: string,
  item: Partial<ItineraryItem>,
  accessToken: string
): Promise<ItineraryItem> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/itinerary/items`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })

  if (!response.ok) {
    throw new Error('Failed to add itinerary item')
  }

  const data: ApiResponse<ItineraryItem> = await response.json()
  if (!data.data) {
    throw new Error('Failed to add itinerary item')
  }

  return data.data
}

export async function updateItineraryItem(
  tripId: string,
  itemId: string,
  updates: Partial<ItineraryItem>,
  accessToken: string
): Promise<ItineraryItem> {
  const response = await fetch(
    `${API_BASE_URL}/traveler/trips/${tripId}/itinerary/items/${itemId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to update itinerary item')
  }

  const data: ApiResponse<ItineraryItem> = await response.json()
  if (!data.data) {
    throw new Error('Failed to update itinerary item')
  }

  return data.data
}

export async function removeItineraryItem(
  tripId: string,
  itemId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/traveler/trips/${tripId}/itinerary/items/${itemId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to remove itinerary item')
  }
}

export async function replaceItineraryItem(
  tripId: string,
  itemId: string,
  newItem: Partial<ItineraryItem>,
  accessToken: string
): Promise<ItineraryItem> {
  const response = await fetch(
    `${API_BASE_URL}/traveler/trips/${tripId}/itinerary/items/${itemId}/replace`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to replace itinerary item')
  }

  const data: ApiResponse<ItineraryItem> = await response.json()
  if (!data.data) {
    throw new Error('Failed to replace itinerary item')
  }

  return data.data
}
