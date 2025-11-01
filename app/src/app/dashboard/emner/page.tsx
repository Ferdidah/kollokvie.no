import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GlobalNav from '@/components/navigation/GlobalNav'
import type { Emne } from '@/types/database'

export default async function EmnerPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's emne memberships
  const { data: emneMemberships, error: membershipsError } = await supabase
    .from('emne_members')
    .select('emne_id, role')
    .eq('user_id', user.id)

  if (membershipsError) {
    console.error('Error fetching emne memberships:', membershipsError)
  }

  // Fetch emne details separately to avoid RLS recursion
  const emneIds = emneMemberships?.map(m => m.emne_id) || []
  const { data: emner, error: emnerError } = await supabase
    .from('emne')
    .select('*')
    .in('id', emneIds)

  if (emnerError) {
    console.error('Error fetching emner:', emnerError)
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <GlobalNav />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Mine Emner</h1>
          <p className="mt-3 text-lg text-black font-medium">Hei, {user.email?.split('@')[0]} 👋</p>
        </div>
        <Link href="/emner/new">
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
              <p className="text-3xl font-black text-black">{emner.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
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
              <p className="text-3xl font-black text-black">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
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
              <p className="text-3xl font-black text-black">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emner Grid */}
      {emner.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emner.map((emne) => (
            <Link key={emne.id} href={`/emner/${emne.id}`}>
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
          <Link href="/emner/new">
            <button className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Opprett første emne
            </button>
          </Link>
        </div>
      )}
      </div>
    </div>
  )
}

