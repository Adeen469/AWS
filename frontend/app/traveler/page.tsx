import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, MapPin, Calendar, DollarSign, AlertTriangle } from 'lucide-react'
import TripCard from '@/components/traveler/TripCard'
import EmptyState from '@/components/traveler/EmptyState'

// Mock data - will be replaced with actual API calls
const getMockTrips = () => [
  {
    id: '1',
    destination: 'Paris, France',
    start_date: '2026-11-15',
    end_date: '2026-11-22',
    duration_days: 7,
    status: 'planned' as const,
    budget: 150000,
    estimated_cost: 145000,
    next_activity: 'Eiffel Tower Visit',
    alerts: 1,
  },
  {
    id: '2',
    destination: 'Bali, Indonesia',
    start_date: '2026-12-01',
    end_date: '2026-12-10',
    duration_days: 9,
    status: 'draft' as const,
    budget: 120000,
    estimated_cost: 0,
    next_activity: null,
    alerts: 0,
  },
]

export default async function TravelerDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // TODO: Replace with actual API call
  const trips = getMockTrips()

  if (trips.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          title="No trips yet"
          description="Start planning your personalized trip by creating a new one"
          actionLabel="Create your first trip"
          actionHref="/traveler/create-trip"
          icon={MapPin}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.full_name || 'Traveler'}!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your trips and explore new destinations
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/traveler/create-trip"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Trip
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trips</dt>
                  <dd className="text-lg font-semibold text-gray-900">{trips.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Upcoming</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {trips.filter((t) => t.status !== 'completed' && t.status !== 'cancelled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    ₹{trips.reduce((sum, t) => sum + t.budget, 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Alerts</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {trips.reduce((sum, t) => sum + t.alerts, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Your Trips</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </div>
  )
}
