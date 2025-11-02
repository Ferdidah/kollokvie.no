import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Meeting } from '@/types/database'

interface MeetingsPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function MeetingsPage({ params }: MeetingsPageProps) {
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

  // Check if user is a member of this emne
  const { data: membership } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', emneId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/emner')
  }

  // Fetch meetings for this emne
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .select('*')
    .eq('emne_id', emneId)
    .order('scheduled_at', { ascending: false })

  if (meetingsError) {
    console.error('Error fetching meetings:', meetingsError)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Møter</h1>
          <p className="mt-3 text-lg text-black font-medium">
            Planlegg og administrer kollokvie-møter
          </p>
        </div>
        <Link href={`/dashboard/emner/${emneId}/mote/new`}>
          <button className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Planlegg nytt møte
          </button>
        </Link>
      </div>

      {/* Meetings List */}
      {meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <Link key={meeting.id} href={`/dashboard/emner/${emneId}/mote/${meeting.id}`}>
              <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-200 hover:border-blue-200 transform hover:scale-105 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-2">{meeting.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {new Date(meeting.scheduled_at).toLocaleDateString('nb-NO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-xl font-bold text-xs ${
                    meeting.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    meeting.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    meeting.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {meeting.status === 'scheduled' ? 'Planlagt' :
                     meeting.status === 'in_progress' ? 'Pågår' :
                     meeting.status === 'completed' ? 'Fullført' :
                     'Avlyst'}
                  </div>
                </div>

                {meeting.agenda && (
                  <p className="text-gray-700 font-medium text-sm mb-4 line-clamp-2">
                    {meeting.agenda}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600 font-medium">
                  <span>Møte #{meeting.id.slice(-4)}</span>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Ingen møter ennå</h3>
          <p className="text-black font-medium mb-6">
            Planlegg ditt første møte for å komme i gang med kollokvie-gruppen.
          </p>
          <Link href={`/dashboard/emner/${emneId}/mote/new`}>
            <button className="inline-flex items-center px-6 py-3 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Planlegg første møte
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
