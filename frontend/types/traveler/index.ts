// Trip Types
export type TripStatus = 'draft' | 'planned' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
export type TravelStyle = 'relaxed' | 'moderate' | 'fast_paced'
export type AccommodationType = 'budget' | 'mid_range' | 'luxury'
export type TransportationType = 'public' | 'private' | 'rental' | 'mixed'

export interface Trip {
  id: string
  user_id: string
  destination: string
  start_date: string
  end_date: string
  duration_days: number
  number_of_travelers: number
  budget: number
  status: TripStatus
  accommodation_preference: AccommodationType
  transportation_preference: TransportationType
  interests: string[]
  travel_style: TravelStyle
  pace: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateTripPayload {
  destination: string
  start_date: string
  end_date: string
  number_of_travelers: number
  budget: number
  accommodation_preference: AccommodationType
  transportation_preference: TransportationType
  interests: string[]
  travel_style: TravelStyle
  pace: string
  notes?: string
}

// Itinerary Types
export type ItineraryItemType = 'flight' | 'accommodation' | 'activity' | 'meal' | 'transport' | 'other'
export type ItineraryItemStatus = 'planned' | 'pending' | 'confirmed' | 'at_risk' | 'cancelled' | 'completed'

export interface ItineraryItem {
  id: string
  trip_id: string
  day: number
  time: string
  title: string
  type: ItineraryItemType
  description?: string
  location?: string
  estimated_cost: number
  confirmed_cost?: number
  status: ItineraryItemStatus
  booking_id?: string
  dependencies?: string[]
  created_at: string
  updated_at: string
}

export interface ItineraryDay {
  day: number
  date: string
  items: ItineraryItem[]
}

// Recommendation Types
export interface Recommendation {
  id: string
  name: string
  category: string
  description: string
  location?: string
  estimated_cost: number
  image_url?: string
  preference_match_reason?: string
  rating?: number
}

// Budget Types
export interface BudgetSummary {
  total_estimated: number
  total_confirmed: number
  remaining: number
  breakdown: BudgetBreakdown[]
}

export interface BudgetBreakdown {
  category: string
  estimated: number
  confirmed: number
}

// Booking Types
export type BookingStatus = 'planned' | 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'disrupted' | 'completed'
export type BookingType = 'flight' | 'accommodation' | 'activity' | 'transport' | 'meal'

export interface Booking {
  id: string
  trip_id: string
  itinerary_item_id?: string
  type: BookingType
  title: string
  status: BookingStatus
  booking_reference?: string
  provider?: string
  cost: number
  booking_date?: string
  start_time?: string
  end_time?: string
  location?: string
  notes?: string
  created_at: string
  updated_at: string
}

// Disruption Types
export type DisruptionSeverity = 'low' | 'medium' | 'high' | 'critical'
export type DisruptionType = 'delay' | 'cancellation' | 'change' | 'weather' | 'other'

export interface Disruption {
  id: string
  trip_id: string
  type: DisruptionType
  severity: DisruptionSeverity
  title: string
  description: string
  affected_items: string[]
  unaffected_items: string[]
  detected_at: string
  resolved: boolean
}

export interface ImpactItem {
  item_id: string
  title: string
  status: 'at_risk' | 'unaffected'
  explanation?: string
}

// Recovery Types
export type ExperienceImpact = 'very_low' | 'low' | 'medium' | 'high' | 'very_high'

export interface RecoveryOption {
  id: string
  disruption_id: string
  title: string
  description: string
  cost_delta: number
  experience_impact: ExperienceImpact
  affected_items: string[]
  changes: RecoveryChange[]
  created_at: string
}

export interface RecoveryChange {
  item_id: string
  change_type: 'add' | 'remove' | 'modify' | 'reschedule'
  description: string
}

// Assistant Types
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AssistantConversation {
  trip_id: string
  messages: AssistantMessage[]
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}
