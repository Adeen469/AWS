import { CheckCircle, Clock, XCircle, AlertCircle, Calendar, MapPin, DollarSign } from 'lucide-react'
import { Booking } from '@/types/traveler'

interface BookingListProps {
  bookings: Booking[]
}

const statusConfig = {
  planned: {
    label: 'Planned',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  disrupted: {
    label: 'Disrupted',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
  },
}

const typeConfig = {
  flight: { label: 'Flight', icon: '✈️' },
  accommodation: { label: 'Accommodation', icon: '🏨' },
  activity: { label: 'Activity', icon: '🎯' },
  transport: { label: 'Transport', icon: '🚗' },
  meal: { label: 'Meal', icon: '🍽️' },
}

export default function BookingList({ bookings }: BookingListProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No bookings yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your bookings will appear here once you confirm your plans
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const statusInfo = statusConfig[booking.status]
        const StatusIcon = statusInfo.icon
        const typeInfo = typeConfig[booking.type]

        return (
          <div
            key={booking.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <span className="text-3xl">{typeInfo.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.title}</h3>
                  <p className="text-sm text-gray-600">{typeInfo.label}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {booking.booking_reference && (
                <div>
                  <p className="text-xs text-gray-500">Reference</p>
                  <p className="text-sm font-medium text-gray-900">{booking.booking_reference}</p>
                </div>
              )}

              {booking.provider && (
                <div>
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="text-sm font-medium text-gray-900">{booking.provider}</p>
                </div>
              )}

              {booking.booking_date && (
                <div>
                  <p className="text-xs text-gray-500">Booking Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {booking.start_time && (
                <div>
                  <p className="text-xs text-gray-500">
                    {booking.type === 'flight' || booking.type === 'transport'
                      ? 'Departure'
                      : 'Start Time'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.start_time).toLocaleString()}
                  </p>
                </div>
              )}

              {booking.end_time && (
                <div>
                  <p className="text-xs text-gray-500">
                    {booking.type === 'flight' || booking.type === 'transport' ? 'Arrival' : 'End Time'}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(booking.end_time).toLocaleString()}
                  </p>
                </div>
              )}

              {booking.location && (
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {booking.location}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center text-lg font-semibold text-gray-900">
                <DollarSign className="w-5 h-5 mr-1" />
                ₹{booking.cost.toLocaleString()}
              </div>

              {booking.status === 'confirmed' && (
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  View Details
                </button>
              )}
            </div>

            {booking.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">{booking.notes}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
