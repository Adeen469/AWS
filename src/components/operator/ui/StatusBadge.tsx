import type { TripStatus, DisruptionSeverity, BookingStatus } from '@/types/operator'

type BadgeVariant = TripStatus | DisruptionSeverity | BookingStatus | string

interface StatusBadgeProps {
  status: BadgeVariant
  className?: string
}

const variantMap: Record<string, string> = {
  // Trip status
  active: 'bg-emerald-100 text-emerald-800',
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
  // Disruption severity
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-700 text-white',
  // Booking status
  confirmed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-yellow-100 text-yellow-800',
  modified: 'bg-blue-100 text-blue-800',
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const colorClass = variantMap[status] ?? 'bg-gray-100 text-gray-700'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${colorClass} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  )
}
