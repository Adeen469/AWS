import { Clock, MapPin, DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ItineraryDay, ItineraryItem as ItineraryItemType } from '@/types/traveler'

interface ItineraryTimelineProps {
  days: ItineraryDay[]
  onItemClick?: (item: ItineraryItemType) => void
}

const statusConfig = {
  planned: {
    label: 'Planned',
    color: 'bg-blue-100 text-blue-800',
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
  at_risk: {
    label: 'At Risk',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
  },
}

const typeConfig = {
  flight: { color: 'bg-sky-500', label: 'Flight' },
  accommodation: { color: 'bg-purple-500', label: 'Hotel' },
  activity: { color: 'bg-green-500', label: 'Activity' },
  meal: { color: 'bg-orange-500', label: 'Meal' },
  transport: { color: 'bg-blue-500', label: 'Transport' },
  other: { color: 'bg-gray-500', label: 'Other' },
}

function ItineraryItem({ item, onClick }: { item: ItineraryItemType; onClick?: () => void }) {
  const statusInfo = statusConfig[item.status]
  const StatusIcon = statusInfo.icon
  const typeInfo = typeConfig[item.type]

  return (
    <div
      onClick={onClick}
      className={`relative pl-8 pb-8 ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {/* Timeline line */}
      <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Timeline dot */}
      <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${typeInfo.color} border-2 border-white`} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-500">{item.time}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color} text-white`}>
                {typeInfo.label}
              </span>
            </div>
            <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mb-3">{item.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {item.location && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {item.location}
            </div>
          )}
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            {item.confirmed_cost
              ? `₹${item.confirmed_cost.toLocaleString()}`
              : `~₹${item.estimated_cost.toLocaleString()}`}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ItineraryTimeline({ days, onItemClick }: ItineraryTimelineProps) {
  if (days.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No itinerary yet</h3>
        <p className="mt-1 text-sm text-gray-500">Your itinerary will appear here once generated</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {days.map((day) => (
        <div key={day.day} className="bg-gray-50 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Day {day.day}</h3>
            <p className="text-sm text-gray-600">{format(new Date(day.date), 'EEEE, MMMM d, yyyy')}</p>
          </div>

          <div>
            {day.items.map((item) => (
              <ItineraryItem
                key={item.id}
                item={item}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
