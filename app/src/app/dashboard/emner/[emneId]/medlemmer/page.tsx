import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { AddMember } from '@/components/emner/AddMember'
import { MemberList } from '@/components/emner/MemberList'

interface MembersPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { emneId } = await params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

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

  // Check if user is a member
  const { data: membership } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', emneId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect(`/dashboard/emner`)
  }

  // Check if user is creator
  const isCreator = emne.created_by === user.id

  // Fetch all members with their email addresses
  // Note: We can't directly join auth.users, so we'll need to fetch emails separately
  // or use a profiles table. For now, we'll fetch members and try to get emails via RPC or client-side
  const { data: members, error: membersError } = await supabase
    .from('emne_members')
    .select('id, user_id, role, joined_at')
    .eq('emne_id', emneId)
    .order('joined_at', { ascending: true })

  if (membersError) {
    console.error('Error fetching members:', membersError)
  }

  // Fetch user emails (we'll need to do this client-side or via a function)
  // For now, we'll pass the members without emails and fetch them client-side
  const membersWithEmails = members?.map(member => ({
    ...member,
    email: undefined // Will be fetched client-side
  })) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Medlemmer & Roller</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Administrer medlemmer, invitasjoner og roterende roller
        </p>
      </div>

      <div className="space-y-6">
        {isCreator && (
          <AddMember emneId={emneId} isCreator={isCreator} />
        )}

        <MemberList
          members={membersWithEmails}
          emneId={emneId}
          currentUserId={user.id}
          isCreator={isCreator}
        />
      </div>
    </div>
  )
}

