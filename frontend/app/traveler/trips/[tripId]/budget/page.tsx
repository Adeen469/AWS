import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BudgetSummary from '@/components/traveler/BudgetSummary'
import { BudgetSummary as BudgetSummaryType } from '@/types/traveler'

// Mock data - will be replaced with actual API calls
const getMockBudgetData = (tripId: string): BudgetSummaryType | null => {
  if (tripId !== '1') return null

  return {
    total_estimated: 145000,
    total_confirmed: 127800,
    remaining: 22200,
    breakdown: [
      {
        category: 'accommodation',
        estimated: 60000,
        confirmed: 60000,
      },
      {
        category: 'activities',
        estimated: 35000,
        confirmed: 29800,
      },
      {
        category: 'transportation',
        estimated: 25000,
        confirmed: 18000,
      },
      {
        category: 'meals',
        estimated: 20000,
        confirmed: 15000,
      },
      {
        category: 'other',
        estimated: 5000,
        confirmed: 5000,
      },
    ],
  }
}

export default async function TripBudgetPage({ params }: { params: { tripId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // TODO: Replace with actual API call
  const budgetData = getMockBudgetData(params.tripId)

  if (!budgetData) {
    notFound()
  }

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

        <h1 className="text-3xl font-bold text-gray-900">Budget & Costs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track your spending and see how it compares to your estimates
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
            className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
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

      {/* Budget Summary */}
      <BudgetSummary summary={budgetData} />
    </div>
  )
}
