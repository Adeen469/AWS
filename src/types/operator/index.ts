// ─── Enums ────────────────────────────────────────────────────────────────────

export type TripStatus = 'active' | 'upcoming' | 'completed' | 'cancelled'

export type DisruptionSeverity = 'low' | 'medium' | 'high' | 'critical'

export type DisruptionType =
  | 'flight_delay'
  | 'flight_cancellation'
  | 'hotel_unavailable'
  | 'activity_cancelled'
  | 'transport_delay'
  | 'weather_disruption'
  | 'vendor_unavailable'
  | 'traveler_preference_change'

export type DisruptionStatus = 'active' | 'resolved' | 'in_review'

export type BookingType = 'flight' | 'hotel' | 'transport' | 'activity'

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'modified'

export type VendorType =
  | 'hotel'
  | 'airline'
  | 'transport_provider'
  | 'activity_provider'

export type RecoveryAvailability = 'available' | 'limited' | 'unavailable'

export type AuditAction =
  | 'recovery_approved'
  | 'disruption_created'
  | 'impact_analyzed'
  | 'trip_updated'
  | 'booking_changed'
  | 'traveler_notified'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Traveler {
  id: string
  name: string
  email: string
  phone: string
}

export interface Trip {
  id: string
  tripRef: string // e.g. "TRP-1023"
  traveler: Traveler
  destination: string
  startDate: string // ISO date string
  endDate: string
  budget: number
  currency: string
  travelStyle: string
  status: TripStatus
  coordinator: string
  activeDisruptions: number
}

export interface ItineraryItem {
  id: string
  day: number
  time: string
  activity: string
  location: string
  status: BookingStatus
  type: BookingType
}

export interface Transportation {
  id: string
  type: 'flight' | 'train' | 'bus' | 'taxi' | 'transfer'
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  carrier: string
  bookingRef: string
  status: BookingStatus
}

export interface Accommodation {
  id: string
  hotelName: string
  checkIn: string
  checkOut: string
  roomType: string
  status: BookingStatus
  location: string
}

export interface Activity {
  id: string
  name: string
  date: string
  time: string
  location: string
  vendor: string
  status: BookingStatus
}

export interface Booking {
  id: string
  tripId: string
  tripRef: string
  travelerName: string
  type: BookingType
  vendor: string
  date: string
  cost: number
  currency: string
  status: BookingStatus
}

export interface Vendor {
  id: string
  name: string
  type: VendorType
  location: string
  availability: 'available' | 'limited' | 'unavailable'
  rating: number
  status: 'active' | 'inactive'
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  activeTrips: number
  totalTrips: number
  status: 'active' | 'inactive'
}

// ─── Disruption & Impact ──────────────────────────────────────────────────────

export interface Disruption {
  id: string
  tripId: string
  tripRef: string
  type: DisruptionType
  description: string
  severity: DisruptionSeverity
  status: DisruptionStatus
  occurredAt: string // ISO datetime
  affectedServices: string[]
}

export interface AffectedItem {
  id: string
  name: string
  type: string
  impact: string
  severity: DisruptionSeverity
}

export interface ImpactAnalysis {
  disruptionId: string
  tripId: string
  affectedItems: AffectedItem[]
  affectedServicesCount: number
  affectedBookingsCount: number
  affectedActivitiesCount: number
  estimatedDelayMinutes: number
  estimatedExtraCost: number
  currency: string
  overallSeverity: DisruptionSeverity
  analyzedAt: string
}

// ─── Recovery ─────────────────────────────────────────────────────────────────

export interface RecoveryOption {
  id: string
  label: string // "Option A", "Option B"
  description: string
  extraCost: number
  currency: string
  delayMinutes: number
  preferenceMatch: number // 0-100
  availability: RecoveryAvailability
  recommended: boolean
  details: string[]
  changes: {
    transportation?: string
    accommodation?: string
    activities?: string[]
    itinerary?: string
  }
}

export interface RecoveryResult {
  tripId: string
  disruptionId: string
  options: RecoveryOption[]
  generatedAt: string
}

export interface ApprovalRequest {
  tripId: string
  disruptionId: string
  selectedOptionId: string
  operatorNote?: string
}

export interface ApprovalResult {
  success: boolean
  tripId: string
  optionId: string
  updatedAt: string
  changes: {
    transportation: boolean
    itinerary: boolean
    booking: boolean
    auditCreated: boolean
    travelerNotified: boolean
  }
  message: string
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export interface AuditEvent {
  id: string
  timestamp: string
  operator: string
  action: AuditAction
  tripId: string
  tripRef: string
  previousState: string
  newState: string
  reason: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  activeTrips: number
  upcomingTrips: number
  todaysBookings: number
  openDisruptions: number
  pendingRecoveries: number
}

export interface RecentActivity {
  id: string
  action: string
  time: string
  tripRef: string
  operator: string
  tripId: string
}

// ─── API Utilities ────────────────────────────────────────────────────────────

export interface ApiError {
  status: number
  message: string
  detail?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
