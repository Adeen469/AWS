import type { RecoveryResult } from '@/types/operator'

export const mockRecoveryOptions: Record<string, RecoveryResult> = {
  'dis-001': {
    tripId: 'trip-1023',
    disruptionId: 'dis-001',
    generatedAt: '2026-10-12T08:50:00',
    options: [
      {
        id: 'opt-A',
        label: 'Option A',
        description:
          'Rebook on next available Emirates flight + premium transfer + dinner rescheduled to tomorrow.',
        extraCost: 1200,
        currency: '₹',
        delayMinutes: 60,
        preferenceMatch: 94,
        availability: 'available',
        recommended: true,
        details: [
          'Flight EK510 — departs 13:00, arrives 15:00',
          'Premium hotel transfer arranged',
          'Al Mahara dinner rescheduled to Day 2',
          'Hotel notified of late arrival',
        ],
        changes: {
          transportation: 'Switch to Emirates EK510 (13:00 departure)',
          accommodation: 'Late check-in confirmed with hotel',
          activities: ['Welcome dinner moved to Day 2 (Oct 13)'],
          itinerary: 'Day 1 itinerary adjusted for 60-min delay',
        },
      },
      {
        id: 'opt-B',
        label: 'Option B',
        description:
          'Travel on same delayed flight + standard transfer + dinner cancelled with full refund.',
        extraCost: 500,
        currency: '₹',
        delayMinutes: 180,
        preferenceMatch: 82,
        availability: 'available',
        recommended: false,
        details: [
          'Proceed with delayed EK508',
          'Standard transfer at actual arrival time',
          'Welcome dinner cancelled — full refund',
          'Hotel check-in at ~17:30',
        ],
        changes: {
          transportation: 'Keep EK508 — 2-hour delay',
          accommodation: 'Late check-in confirmed with hotel',
          activities: ['Welcome dinner cancelled (full refund)'],
          itinerary: 'Day 1 itinerary adjusted for 180-min delay',
        },
      },
    ],
  },
}
