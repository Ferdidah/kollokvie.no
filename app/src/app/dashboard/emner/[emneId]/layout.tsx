import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { EmneNav } from '@/components/navigation/EmneNav'
import type { Emne } from '@/types/database'

interface EmneLayoutProps {
  children: React.ReactNode
  params: Promise<{
    emneId: string
  }>
}

export default async function EmneLayout({ children, params }: EmneLayoutProps) {
  const { emneId } = await params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch emne details
  const { data: emne, error: emneError } = await supabase
    .from('emne')
    .select('*')
    .eq('id', emneId)
    .single()

  if (emneError || !emne) {
    notFound()
  }

  // Check if user is a member of this emne
  const { data: membership, error: membershipError } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', emneId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/emner')
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <EmneNav emne={emne} />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  )
}
