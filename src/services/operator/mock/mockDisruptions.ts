import type { Disruption, ImpactAnalysis } from '@/types/operator'

export const mockDisruptions: Disruption[] = [
  {
    id: 'dis-001',
    tripId: 'trip-1023',
    tripRef: 'TRP-1023',
    type: 'flight_delay',
    description: 'Flight EK508 delayed by 2 hours due to operational reasons.',
    severity: 'high',
    status: 'active',
    occurredAt: '2026-10-12T08:30:00',
    affectedServices: [
      'Airport Transfer',
      'Hotel Check-in',
      'Dinner Reservation',
      'Day 1 Activity',
    ],
  },
]

export const mockImpactAnalysis: Record<string, ImpactAnalysis> = {
  'dis-001': {
    disruptionId: 'dis-001',
    tripId: 'trip-1023',
    affectedItems: [
      {
        id: 'ai-01',
        name: 'Airport Transfer',
        type: 'transport',
        impact: 'Transfer timing shifted by 2 hours',
        severity: 'high',
      },
      {
        id: 'ai-02',
        name: 'Hotel Check-in',
        type: 'accommodation',
        impact: 'Late check-in — hotel requires notification',
        severity: 'high',
      },
      {
        id: 'ai-03',
        name: 'Dinner Reservation (Al Mahara)',
        type: 'activity',
        impact: 'Reservation time conflict — cancellation likely',
        severity: 'medium',
      },
      {
        id: 'ai-04',
        name: 'Day 1 Activity',
        type: 'activity',
        impact: 'Activity start time may need adjustment',
        severity: 'low',
      },
    ],
    affectedServicesCount: 4,
    affectedBookingsCount: 3,
    affectedActivitiesCount: 2,
    estimatedDelayMinutes: 120,
    estimatedExtraCost: 1200,
    currency: '₹',
    overallSeverity: 'high',
    analyzedAt: '2026-10-12T08:45:00',
  },
}
