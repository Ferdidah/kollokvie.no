import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { UserDeletion } from '@/components/user/UserDeletion'

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's profile information
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user.id)
    .single()

  // Fetch user's emne memberships for stats
  const { data: emneMemberships } = await supabase
    .from('emne_members')
    .select('emne_id, role')
    .eq('user_id', user.id)

  // Fetch user's contributions count
  const { data: contributions } = await supabase
    .from('contributions')
    .select('id')
    .eq('user_id', user.id)

  // Fetch user's tasks count
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', user.id)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Profil & Innstillinger</h1>
        <p className="mt-3 text-lg text-black font-medium">Administrer din konto og innstillinger</p>
      </div>

      <div className="space-y-8">
        {/* Account Information */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold text-black mb-4">Kontoinformasjon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Brukernavn</label>
                <p className="text-black font-medium">{profile?.username || 'Ingen brukernavn satt'}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-post</label>
                <p className="text-black font-medium">{profile?.email || 'Ingen e-post satt'}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Bruker-ID</label>
                <p className="text-gray-600 font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Registrert</label>
                <p className="text-gray-600 font-medium">
                  {new Date(user.created_at).toLocaleDateString('nb-NO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Sist aktiv</label>
                <p className="text-gray-600 font-medium">
                  {user.last_sign_in_at ? 
                    new Date(user.last_sign_in_at).toLocaleDateString('nb-NO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Ukjent'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-post bekreftet</label>
                <p className="text-gray-600 font-medium">
                  {user.email_confirmed_at ? 'Ja' : 'Nei'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold text-black mb-4">Din aktivitet</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Emner</h3>
              <p className="text-2xl font-black text-black">{emneMemberships?.length || 0}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Bidrag</h3>
              <p className="text-2xl font-black text-black">{contributions?.length || 0}</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wide">Oppgaver</h3>
              <p className="text-2xl font-black text-black">{tasks?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* User Deletion */}
        <UserDeletion userId={user.id} userEmail={user.email || 'Ukjent e-post'} />
      </div>
    </div>
  )
}