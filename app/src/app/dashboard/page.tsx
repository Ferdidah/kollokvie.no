import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Emne } from '@/types/database'

// Disable static caching to ensure memberships appear immediately
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user profile (optional - fallback to email if not available)
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
    // Silently handle errors - profile is optional, we use email as fallback

  // Fetch user's emne memberships
  const { data: emneMemberships, error: membershipsError } = await supabase
    .from('emne_members')
    .select('emne_id, role')
    .eq('user_id', user.id)

  if (membershipsError) {
    console.error('Error fetching emne memberships:', membershipsError)
    // Handle error gracefully - continue with empty array
  }

  // Fetch emne details separately to avoid RLS recursion
  const emneIds = emneMemberships?.map(m => m.emne_id).filter((id): id is string => !!id) || []
  
  let emner: Emne[] = []
  if (emneIds.length > 0) {
    const { data, error: emnerError } = await supabase
      .from('emne')
      .select('*')
      .in('id', emneIds)

    if (emnerError) {
      console.error('Error fetching emner:', emnerError)
    } else {
      emner = data || []
    }
  }

  // Fetch user's contributions count
  const { data: contributions, error: contributionsError } = await supabase
    .from('contributions')
    .select('id')
    .eq('user_id', user.id)

  if (contributionsError) {
    console.error('Error fetching contributions:', contributionsError)
  }

  // Fetch upcoming meetings count (only if we have emneIds)
  let upcomingMeetings: any[] = []
  if (emneIds.length > 0) {
    const { data, error: meetingsError } = await supabase
      .from('meetings')
      .select('id')
      .in('emne_id', emneIds)
      .eq('status', 'scheduled')
      .gt('scheduled_at', new Date().toISOString())

    if (meetingsError) {
      console.error('Error fetching upcoming meetings:', meetingsError)
    } else {
      upcomingMeetings = data || []
    }
  }

  // Fetch member counts for each emne
  const memberCountsMap: Record<string, number> = {}
  if (emneIds.length > 0) {
    const { data: allMemberships } = await supabase
      .from('emne_members')
      .select('emne_id')
      .in('emne_id', emneIds)

    // Count members per emne
    if (allMemberships) {
      allMemberships.forEach((membership) => {
        memberCountsMap[membership.emne_id] = (memberCountsMap[membership.emne_id] || 0) + 1
      })
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Dashboard</h1>
          <p className="mt-3 text-lg text-black font-medium">Hei, {profile?.username || user.email?.split('@')[0]} 👋</p>
        </div>
        <Link href="/dashboard/emner/new">
          <button className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Opprett nytt emne
          </button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Aktive Emner</h3>
              <p className="text-3xl font-black text-black">{emner?.length || 0}</p>
            </div>
          </div>
        </div>

        <Link href="/dashboard/upcoming-meetings">
          <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide">Kommende Møter</h3>
                <p className="text-3xl font-black text-black">{upcomingMeetings?.length || 0}</p>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/mine-bidrag">
          <div className="bg-white border-2 border-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide">Mine Bidrag</h3>
                <p className="text-3xl font-black text-black">{contributions?.length || 0}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Emner Grid */}
      {emner && emner.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emner.map((emne: Emne) => (
            <Link key={emne.id} href={`/dashboard/emner/${emne.id}`}>
              <div className="bg-white border-2 border-blue-100 shadow-xl rounded-3xl p-8 hover:shadow-2xl transition-all duration-200 hover:border-blue-200 transform hover:scale-105 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {emne.code || emne.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-black mb-1">{emne.title}</h3>
                      {emne.code && (
                        <p className="text-sm text-gray-600 font-medium">{emne.code}</p>
                      )}
                      {emne.semester && (
                        <p className="text-sm text-gray-600 font-medium">{emne.semester}</p>
                      )}
                    </div>
                  </div>
                </div>

                {emne.description && (
                  <p className="text-gray-700 font-medium mb-6 leading-relaxed line-clamp-2">
                    {emne.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                  <span>Opprettet {new Date(emne.created_at).toLocaleDateString('nb-NO')}</span>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>{memberCountsMap[emne.id] || 0} {memberCountsMap[emne.id] === 1 ? 'medlem' : 'medlemmer'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Ingen emner ennå</h3>
          <p className="text-black font-medium mb-6">
            Opprett ditt første emne for å komme i gang med kollokvie-gruppen din.
          </p>
          <Link href="/dashboard/emner/new">
            <button className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Opprett første emne
            </button>
          </Link>
        </div>
      )}
    </>
  )
}
