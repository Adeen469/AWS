import type { Customer } from '@/types/operator'

export const mockCustomers: Customer[] = [
  {
    id: 'cust-01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 98765 43210',
    activeTrips: 1,
    totalTrips: 4,
    status: 'active',
  },
  {
    id: 'cust-02',
    name: 'Ananya Patel',
    email: 'ananya.patel@email.com',
    phone: '+91 87654 32109',
    activeTrips: 1,
    totalTrips: 2,
    status: 'active',
  },
  {
    id: 'cust-03',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 76543 21098',
    activeTrips: 1,
    totalTrips: 6,
    status: 'active',
  },
  {
    id: 'cust-04',
    name: 'Meera Nair',
    email: 'meera.nair@email.com',
    phone: '+91 65432 10987',
    activeTrips: 0,
    totalTrips: 3,
    status: 'active',
  },
]
