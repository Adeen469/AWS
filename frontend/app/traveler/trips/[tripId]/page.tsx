import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Edit } from 'lucide-react'
import ItineraryTimeline from '@/components/traveler/ItineraryTimeline'
import { ItineraryDay } from '@/types/traveler'

// Mock data - will be replaced with actual API calls
const getMockTripData = (tripId: string) => {
  if (tripId !== '1') return null

  return {
    trip: {
      id: '1',
      destination: 'Paris, France',
      start_date: '2026-11-15',
      end_date: '2026-11-22',
      duration_days: 7,
      number_of_travelers: 2,
      budget: 150000,
      status: 'planned' as const,
    },
    days: [
      {
        day: 1,
        date: '2026-11-15',
        items: [
          {
            id: '1',
            trip_id: '1',
            day: 1,
            time: '09:00',
            title: 'Arrival at Charles de Gaulle Airport',
            type: 'flight' as const,
            status: 'confirmed' as const,
            estimated_cost: 0,
            created_at: '',
            updated_at: '',
          },
          {
            id: '2',
            trip_id: '1',
            day: 1,
            time: '10:30',
            title: 'Airport Transfer to Hotel',
            type: 'transport' as const,
            status: 'planned' as const,
            location: 'CDG → Le Marais',
            estimated_cost: 3500,
            description: 'Private car transfer',
            created_at: '',
            updated_at: '',
          },
          {
            id: '3',
            trip_id: '1',
            day: 1,
            time: '11:30',
            title: 'Hotel Check-in',
            type: 'accommodation' as const,
            status: 'confirmed' as const,
            location: 'Hotel Le Marais',
            estimated_cost: 12000,
            confirmed_cost: 12000,
            created_at: '',
            updated_at: '',
          },
          {
            id: '4',
            trip_id: '1',
            day: 1,
            time: '13:00',
            title: 'Lunch at Local Bistro',
            type: 'meal' as const,
            status: 'planned' as const,
            location: 'Le Marais District',
            estimated_cost: 2500,
            created_at: '',
            updated_at: '',
          },
          {
            id: '5',
            trip_id: '1',
            day: 1,
            time: '15:00',
            title: 'Eiffel Tower Visit',
            type: 'activity' as const,
            status: 'confirmed' as const,
            location: 'Champ de Mars',
            estimated_cost: 3000,
            confirmed_cost: 2800,
            description: 'Skip-the-line tickets to the summit',
            created_at: '',
            updated_at: '',
          },
          {
            id: '6',
            trip_id: '1',
            day: 1,
            time: '19:00',
            title: 'Seine River Dinner Cruise',
            type: 'activity' as const,
            status: 'pending' as const,
            location: 'Port de la Bourdonnais',
            estimated_cost: 8500,
            description: 'Evening cruise with dinner',
            created_at: '',
            updated_at: '',
          },
        ],
      },
      {
        day: 2,
        date: '2026-11-16',
        items: [
          {
            id: '7',
            trip_id: '1',
            day: 2,
            time: '08:00',
            title: 'Breakfast at Hotel',
            type: 'meal' as const,
            status: 'confirmed' as const,
            estimated_cost: 0,
            created_at: '',
            updated_at: '',
          },
          {
            id: '8',
            trip_id: '1',
            day: 2,
            time: '09:30',
            title: 'Louvre Museum Tour',
            type: 'activity' as const,
            status: 'confirmed' as const,
            location: 'Musée du Louvre',
            estimated_cost: 4500,
            confirmed_cost: 4500,
            description: 'Guided tour with priority access',
            created_at: '',
            updated_at: '',
          },
          {
            id: '9',
            trip_id: '1',
            day: 2,
            time: '13:00',
            title: 'Lunch at Café near Louvre',
            type: 'meal' as const,
            status: 'planned' as const,
            location: 'Rue de Rivoli',
            estimated_cost: 2000,
            created_at: '',
            updated_at: '',
          },
          {
            id: '10',
            trip_id: '1',
            day: 2,
            time: '15:00',
            title: 'Notre-Dame & Sainte-Chapelle',
            type: 'activity' as const,
            status: 'planned' as const,
            location: 'Île de la Cité',
            estimated_cost: 1500,
            description: 'Historical landmarks visit',
            created_at: '',
            updated_at: '',
          },
          {
            id: '11',
            trip_id: '1',
            day: 2,
            time: '19:00',
            title: 'Dinner in Latin Quarter',
            type: 'meal' as const,
            status: 'planned' as const,
            location: 'Latin Quarter',
            estimated_cost: 3500,
            created_at: '',
            updated_at: '',
          },
        ],
      },
    ] as ItineraryDay[],
  }
}

export default async function TripDetailPage({ params }: { params: { tripId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // TODO: Replace with actual API call
  const data = getMockTripData(params.tripId)

  if (!data) {
    notFound()
  }

  const { trip, days } = data

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/traveler"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.destination}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {trip.duration_days} days
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {trip.number_of_travelers} {trip.number_of_travelers === 1 ? 'traveler' : 'travelers'}
              </div>
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Budget: ₹{trip.budget.toLocaleString()}
              </div>
            </div>
          </div>
          <Link
            href={`/traveler/trips/${trip.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Trip
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            href={`/traveler/trips/${trip.id}`}
            className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
          >
            Itinerary
          </Link>
          <Link
            href={`/traveler/trips/${trip.id}/bookings`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Bookings
          </Link>
          <Link
            href={`/traveler/trips/${trip.id}/budget`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Budget
          </Link>
          <Link
            href={`/traveler/trips/${trip.id}/assistant`}
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            AI Assistant
          </Link>
        </nav>
      </div>

      {/* Itinerary Timeline */}
      <ItineraryTimeline days={days} />
    </div>
  )
}
