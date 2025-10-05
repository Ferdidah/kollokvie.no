import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { GroupMembersClient } from './GroupMembersClient'
import type { Group, GroupMember } from '@/types/database'

interface GroupPageProps {
  params: {
    id: string
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch group data
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', params.id)
    .single()

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Gruppe ikke funnet</h2>
          <p className="mt-2 text-gray-600">Denne gruppen eksisterer ikke eller du har ikke tilgang.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Tilbake til Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Fetch group members
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select('*, user_email:user_id')
    .eq('group_id', params.id)

  if (membersError) {
    console.error('Error fetching members:', membersError)
  }

  // Check if user is a member
  const isMember = members?.some(member => member.user_id === user.id)
  if (!isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Ingen tilgang</h2>
          <p className="mt-2 text-gray-600">Du er ikke medlem av denne gruppen.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Tilbake til Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Check if user is leader
  const userMembership = members?.find(member => member.user_id === user.id)
  const isLeader = userMembership?.role === 'leader'

  // Fetch active kollokv cycles
  const { data: cycles } = await supabase
    .from('kollokv_cycles')
    .select('*')
    .eq('group_id', params.id)
    .order('created_at', { ascending: false })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/groups/join/${group.invite_code}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Tilbake til Dashboard
          </Link>
          
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {group.name}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {group.subject}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {members?.length || 0} medlemmer
                </div>
              </div>
              {group.description && (
                <p className="mt-2 text-gray-600">{group.description}</p>
              )}
            </div>
            
            {isLeader && (
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href={`/groups/${group.id}/kollokv/create`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start Nytt Kollokv
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Active Kollokv Cycles */}
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Aktive Kollokv-sykluser
                </h3>
                
                {cycles && cycles.length > 0 ? (
                  <div className="space-y-4">
                    {cycles.map((cycle) => (
                      <div key={cycle.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{cycle.topic}</h4>
                            <p className="text-sm text-gray-500">
                              Status: <span className="capitalize">{cycle.status}</span>
                            </p>
                            {cycle.meeting_date && (
                              <p className="text-sm text-gray-500">
                                Møte: {new Date(cycle.meeting_date).toLocaleDateString('nb-NO')}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/groups/${group.id}/kollokv/${cycle.id}`}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            Se detaljer
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen aktive kollokv</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {isLeader ? 'Start det første kollokvet for denne gruppen.' : 'Venter på at gruppeledere starter et kollokv.'}
                    </p>
                    {isLeader && (
                      <div className="mt-6">
                        <Link
                          href={`/groups/${group.id}/kollokv/create`}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Start Første Kollokv
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Invite Members */}
            {isLeader && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Inviter Medlemmer
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Del denne lenken med andre studenter for å invitere dem til gruppen:
                  </p>
                  <div className="flex">
                    <input
                      type="text"
                      value={inviteUrl}
                      readOnly
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(inviteUrl)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                      Kopier
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Invitasjonskode: <code className="bg-gray-100 px-1 rounded">{group.invite_code}</code>
                  </p>
                </div>
              </div>
            )}

            {/* Group Members */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Gruppens Medlemmer
                </h3>
                <GroupMembersClient 
                  members={members || []} 
                  currentUserId={user.id}
                  isLeader={isLeader}
                  groupId={group.id}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

