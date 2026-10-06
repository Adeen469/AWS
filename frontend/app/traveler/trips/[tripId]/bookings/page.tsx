import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BookingList from '@/components/traveler/BookingList'
import { Booking } from '@/types/traveler'

// Mock data - will be replaced with actual API calls
const getMockBookings = (tripId: string): Booking[] | null => {
  if (tripId !== '1') return null

  return [
    {
      id: '1',
      trip_id: '1',
      type: 'flight',
      title: 'Flight to Paris',
      status: 'confirmed',
      booking_reference: 'AF1234',
      provider: 'Air France',
      cost: 45000,
      booking_date: '2026-10-01',
      start_time: '2026-11-15T09:00:00',
      end_time: '2026-11-15T14:30:00',
      location: 'Mumbai → Paris CDG',
      notes: 'Direct flight, 2 checked bags included',
      created_at: '2026-10-01T10:00:00',
      updated_at: '2026-10-01T10:00:00',
    },
    {
      id: '2',
      trip_id: '1',
      type: 'accommodation',
      title: 'Hotel Le Marais',
      status: 'confirmed',
      booking_reference: 'HLM789456',
      provider: 'Booking.com',
      cost: 60000,
      booking_date: '2026-10-02',
      start_time: '2026-11-15T14:00:00',
      end_time: '2026-11-22T11:00:00',
      location: 'Le Marais, Paris',
      notes: '7 nights, Superior Double Room with breakfast',
      created_at: '2026-10-02T15:00:00',
      updated_at: '2026-10-02T15:00:00',
    },
    {
      id: '3',
      trip_id: '1',
      type: 'activity',
      title: 'Eiffel Tower Skip-the-Line Tickets',
      status: 'confirmed',
      booking_reference: 'ET2026-1115',
      provider: 'GetYourGuide',
      cost: 2800,
      booking_date: '2026-10-03',
      start_time: '2026-11-15T15:00:00',
      location: 'Eiffel Tower, Paris',
      notes: 'Summit access, 2 adults',
      created_at: '2026-10-03T12:00:00',
      updated_at: '2026-10-03T12:00:00',
    },
    {
      id: '4',
      trip_id: '1',
      type: 'activity',
      title: 'Seine River Dinner Cruise',
      status: 'pending',
      provider: 'Bateaux Parisiens',
      cost: 8500,
      start_time: '2026-11-15T19:00:00',
      end_time: '2026-11-15T21:30:00',
      location: 'Port de la Bourdonnais, Paris',
      notes: 'Gourmet dinner, live music',
      created_at: '2026-10-04T09:00:00',
      updated_at: '2026-10-04T09:00:00',
    },
    {
      id: '5',
      trip_id: '1',
      type: 'activity',
      title: 'Louvre Museum Guided Tour',
      status: 'confirmed',
      booking_reference: 'LV789123',
      provider: 'Paris Museum Pass',
      cost: 4500,
      booking_date: '2026-10-03',
      start_time: '2026-11-16T09:30:00',
      end_time: '2026-11-16T12:30:00',
      location: 'Louvre Museum, Paris',
      notes: '3-hour guided tour with priority access',
      created_at: '2026-10-03T14:00:00',
      updated_at: '2026-10-03T14:00:00',
    },
    {
      id: '6',
      trip_id: '1',
      type: 'transport',
      title: 'Airport Transfer',
      status: 'planned',
      cost: 3500,
      location: 'CDG Airport → Le Marais',
      notes: 'Private car service',
      created_at: '2026-10-05T10:00:00',
      updated_at: '2026-10-05T10:00:00',
    },
  ]
}

export default async function TripBookingsPage({ params }: { params: { tripId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // TODO: Replace with actual API call
  const bookings = getMockBookings(params.tripId)

  if (!bookings) {
    notFound()
  }

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const totalCost = bookings.reduce((sum, b) => sum + b.cost, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/traveler/trips/${params.tripId}`}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Trip
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="mt-2 text-sm text-gray-600">Manage all your trip reservations in one place</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/traveler/trips/${params.tripId}`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Itinerary
          </Link>
          <Link
            href={`/traveler/trips/${params.tripId}/bookings`}
            className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
          >
            Bookings
          </Link>
          <Link
            href={`/traveler/trips/${params.tripId}/budget`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Budget
          </Link>
          <Link
            href={`/traveler/trips/${params.tripId}/assistant`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            AI Assistant
          </Link>
        </nav>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
          {pendingCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">{pendingCount} pending</p>
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Bookings List */}
      <BookingList bookings={bookings} />
    </div>
  )
}
