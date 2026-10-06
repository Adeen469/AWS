import type { DashboardStats, RecentActivity } from '@/types/operator'

export const mockDashboardStats: DashboardStats = {
  activeTrips: 24,
  upcomingTrips: 12,
  todaysBookings: 8,
  openDisruptions: 3,
  pendingRecoveries: 2,
}

export const mockRecentActivity: RecentActivity[] = [
  {
    id: 'ra-01',
    action: 'Recovery Approved — Option A',
    time: '10:42 AM',
    tripRef: 'TRP-1023',
    operator: 'Priya Admin',
    tripId: 'trip-1023',
  },
  {
    id: 'ra-02',
    action: 'Impact Analysis Generated',
    time: '08:50 AM',
    tripRef: 'TRP-1023',
    operator: 'System',
    tripId: 'trip-1023',
  },
  {
    id: 'ra-03',
    action: 'Disruption Detected — Flight Delay',
    time: '08:30 AM',
    tripRef: 'TRP-1023',
    operator: 'System',
    tripId: 'trip-1023',
  },
  {
    id: 'ra-04',
    action: 'Traveler Notified',
    time: '10:45 AM',
    tripRef: 'TRP-1023',
    operator: 'System',
    tripId: 'trip-1023',
  },
  {
    id: 'ra-05',
    action: 'Booking Confirmed',
    time: 'Yesterday',
    tripRef: 'TRP-1024',
    operator: 'Ravi Admin',
    tripId: 'trip-1024',
  },
]
