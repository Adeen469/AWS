import { Booking, BudgetSummary, Disruption, RecoveryOption, Recommendation, AssistantMessage, ApiResponse } from '@/types/traveler'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// Bookings
export async function getBookings(tripId: string, accessToken: string): Promise<Booking[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/bookings`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }

  const data: ApiResponse<Booking[]> = await response.json()
  return data.data || []
}

export async function createBooking(
  tripId: string,
  booking: Partial<Booking>,
  accessToken: string
): Promise<Booking> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/bookings`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(booking),
  })

  if (!response.ok) {
    throw new Error('Failed to create booking')
  }

  const data: ApiResponse<Booking> = await response.json()
  if (!data.data) {
    throw new Error('Failed to create booking')
  }

  return data.data
}

// Budget
export async function getBudgetSummary(
  tripId: string,
  accessToken: string
): Promise<BudgetSummary> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/budget`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch budget summary')
  }

  const data: ApiResponse<BudgetSummary> = await response.json()
  if (!data.data) {
    throw new Error('Failed to fetch budget summary')
  }

  return data.data
}

// Recommendations
export async function getRecommendations(
  tripId: string,
  accessToken: string
): Promise<Recommendation[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/recommendations`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recommendations')
  }

  const data: ApiResponse<Recommendation[]> = await response.json()
  return data.data || []
}

// Disruptions
export async function getDisruptions(tripId: string, accessToken: string): Promise<Disruption[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/disruptions`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch disruptions')
  }

  const data: ApiResponse<Disruption[]> = await response.json()
  return data.data || []
}

export async function getRecoveryOptions(
  disruptionId: string,
  accessToken: string
): Promise<RecoveryOption[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/disruptions/${disruptionId}/recovery-options`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recovery options')
  }

  const data: ApiResponse<RecoveryOption[]> = await response.json()
  return data.data || []
}

export async function approveRecoveryOption(
  optionId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/traveler/recovery-options/${optionId}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to approve recovery option')
  }
}

// AI Assistant
export async function sendAssistantMessage(
  tripId: string,
  message: string,
  accessToken: string
): Promise<AssistantMessage> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/assistant`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  if (!response.ok) {
    throw new Error('Failed to send message')
  }

  const data: ApiResponse<AssistantMessage> = await response.json()
  if (!data.data) {
    throw new Error('Failed to get response')
  }

  return data.data
}

export async function getAssistantHistory(
  tripId: string,
  accessToken: string
): Promise<AssistantMessage[]> {
  const response = await fetch(`${API_BASE_URL}/traveler/trips/${tripId}/assistant/history`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch assistant history')
  }

  const data: ApiResponse<AssistantMessage[]> = await response.json()
  return data.data || []
}
