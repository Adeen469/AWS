import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AIAssistant from '@/components/traveler/AIAssistant'
import { AssistantMessage } from '@/types/traveler'

export default async function TripAssistantPage({ params }: { params: { tripId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // TODO: Load conversation history from API
  const initialMessages: AssistantMessage[] = []

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

        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="mt-2 text-sm text-gray-600">
          Get instant answers about your trip, itinerary, and travel preferences
        </p>
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
            className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
            className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
          >
            AI Assistant
          </Link>
        </nav>
      </div>

      {/* AI Assistant */}
      <AIAssistant tripId={params.tripId} initialMessages={initialMessages} />
    </div>
  )
}
