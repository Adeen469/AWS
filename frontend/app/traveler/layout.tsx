import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TravelerNav from '@/components/traveler/TravelerNav'

export default async function TravelerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TravelerNav user={user} />
      <main>{children}</main>
    </div>
  )
}
