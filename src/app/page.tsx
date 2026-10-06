import { redirect } from 'next/navigation'

// Root → redirect to operator login
export default function RootPage() {
  redirect('/operator/login')
}
