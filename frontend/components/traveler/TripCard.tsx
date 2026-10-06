import Link from 'next/link'
import { MapPin, Calendar, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface TripCardProps {
  trip: {
    id: string
    destination: string
    start_date: string
    end_date: string
    duration_days: number
    status: 'draft' | 'planned' | 'booked' | 'in_progress' | 'completed' | 'cancelled'
    budget: number
    estimated_cost: number
    next_activity?: string | null
    alerts: number
  }
}

const statusConfig = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  planned: {
    label: 'Planned',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  booked: {
    label: 'Booked',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-100 text-purple-800',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: AlertCircle,
  },
}

export default function TripCard({ trip }: TripCardProps) {
  const statusInfo = statusConfig[trip.status]
  const StatusIcon = statusInfo.icon

  return (
    <Link href={`/traveler/trips/${trip.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{trip.destination}</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(trip.start_date), 'MMM d')} -{' '}
                {format(new Date(trip.end_date), 'MMM d, yyyy')}
              </div>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {trip.duration_days} {trip.duration_days === 1 ? 'day' : 'days'}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              Budget: ₹{trip.budget.toLocaleString()}
              {trip.estimated_cost > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  (Est: ₹{trip.estimated_cost.toLocaleString()})
                </span>
              )}
            </div>

            {trip.next_activity && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">Next Activity</p>
                <p className="text-sm font-medium text-gray-900">{trip.next_activity}</p>
              </div>
            )}

            {trip.alerts > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {trip.alerts} {trip.alerts === 1 ? 'alert' : 'alerts'} requires attention
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
