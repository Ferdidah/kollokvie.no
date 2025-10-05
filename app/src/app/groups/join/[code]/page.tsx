import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { JoinGroupClient } from './JoinGroupClient'

interface JoinGroupPageProps {
  params: {
    code: string
  }
}

export default async function JoinGroupPage({ params }: JoinGroupPageProps) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/groups/join/${params.code}`)
  }

  // Find group by invite code
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', params.code)
    .single()

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Ugyldig Invitasjonskode</h2>
          <p className="mt-2 text-sm text-gray-600">
            Denne invitasjonskoden er ugyldig eller utløpt. Kontakt personen som inviterte deg for en ny lenke.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Tilbake til Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  // If already a member, redirect to group page
  if (existingMembership) {
    redirect(`/groups/${group.id}`)
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('group_members')
    .select('*', { count: 'exact' })
    .eq('group_id', group.id)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.196M17 20H7m10 0v-2c0-5-5-5-5-5m5 5H7m0 0v-2c0-5-5-5-5-5m0 5v-2a3 3 0 015.196-2.196" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Bli med i kollokv-gruppe
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Du har blitt invitert til å delta i en studiegruppe
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-medium text-gray-900">{group.name}</h3>
            <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              {group.subject}
            </div>
            <div className="mt-1 flex items-center justify-center text-sm text-gray-500">
              <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              {memberCount || 0} medlemmer
            </div>
            
            {group.description && (
              <p className="mt-4 text-sm text-gray-600">{group.description}</p>
            )}
          </div>

          <div className="mt-6">
            <JoinGroupClient groupId={group.id} groupName={group.name} />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Avbryt og gå til dashboard
            </Link>
          </div>
        </div>

        {/* Info om kollokv */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Om AI-kollokv
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Som medlem får du tilgang til AI-støttet kollokv-metodikk som strukturerer 
                  studiearbeidet og forbedrer læringen gjennom organiserte diskusjoner og 
                  felles kunnskapsbygging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

