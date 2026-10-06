import type { Vendor } from '@/types/operator'

export const mockVendors: Vendor[] = [
  {
    id: 'vend-01',
    name: 'Emirates',
    type: 'airline',
    location: 'Dubai, UAE',
    availability: 'available',
    rating: 4.8,
    status: 'active',
  },
  {
    id: 'vend-02',
    name: 'Burj Al Arab',
    type: 'hotel',
    location: 'Jumeirah, Dubai',
    availability: 'limited',
    rating: 5.0,
    status: 'active',
  },
  {
    id: 'vend-03',
    name: 'Arabian Adventures',
    type: 'activity_provider',
    location: 'Dubai, UAE',
    availability: 'available',
    rating: 4.6,
    status: 'active',
  },
  {
    id: 'vend-04',
    name: 'Dubai Transfers Co.',
    type: 'transport_provider',
    location: 'Dubai, UAE',
    availability: 'available',
    rating: 4.4,
    status: 'active',
  },
]
