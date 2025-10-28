import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { RotatingLeaderWrapper } from '@/components/meetings/RotatingLeaderWrapper'
import { LiveNotes } from '@/components/meetings/LiveNotes'
import type { Meeting, EmneMember } from '@/types/database'

interface MeetingPageProps {
  params: Promise<{
    emneId: string
    moteId: string
  }>
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { emneId, moteId } = await params
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

  // Fetch meeting details
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', moteId)
    .eq('emne_id', emneId)
    .single()

  if (meetingError || !meeting) {
    notFound()
  }

  // Fetch all members for role assignment
  const { data: members } = await supabase
    .from('emne_members')
    .select('*')
    .eq('emne_id', emneId)

  // Fetch agenda items
  const { data: agendaItems } = await supabase
    .from('agenda_items')
    .select('*')
    .eq('meeting_id', moteId)
    .order('order_index', { ascending: true })

  // Fetch tasks for this meeting
  const { data: meetingTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('meeting_id', moteId)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link 
              href={`/emner/${emneId}/mote`}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Møter
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{meeting.title}</span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">{meeting.title}</h1>
          <p className="mt-3 text-lg text-black font-medium">
            {new Date(meeting.scheduled_at).toLocaleDateString('nb-NO', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {meeting.duration_minutes && ` • ${meeting.duration_minutes} minutter`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-xl font-bold text-sm ${
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
          {meeting.status === 'scheduled' && (
            <button className="inline-flex items-center px-4 py-2 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Start møte
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agenda */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-bold text-black mb-6">Agenda</h2>
            
            {agendaItems && agendaItems.length > 0 ? (
              <div className="space-y-4">
                {agendaItems.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-black mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-gray-700 font-medium text-sm mb-2">{item.description}</p>
                      )}
                      {item.estimated_minutes && (
                        <p className="text-gray-600 text-xs">Estimat: {item.estimated_minutes} min</p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'skipped' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'completed' ? 'Fullført' :
                       item.status === 'in_progress' ? 'Pågår' :
                       item.status === 'skipped' ? 'Hoppet over' :
                       'Venter'}
                    </div>
                  </div>
                ))}
              </div>
            ) : meeting.agenda ? (
              <div className="space-y-4">
                {meeting.agenda.split('\n').map((item: string, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Ingen agenda ennå</h3>
                <p className="text-gray-600 font-medium mb-4">
                  Legg til agenda-punkter for å strukturere møtet
                </p>
                <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                  Legg til agenda
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meeting Leader */}
          <RotatingLeaderWrapper 
            members={members || []}
            currentLeader={meeting.meeting_leader}
          />

          {/* Group Members */}
          <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Medlemmer</h3>
            <div className="space-y-3">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-bold text-sm">
                      {member.user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-black text-sm">
                      {member.user?.email?.split('@')[0]}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {member.role === 'admin' ? 'Administrator' : 
                       member.role === 'leader' ? 'Leder' : 'Medlem'}
                    </p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Tasks */}
          <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
            <h3 className="text-lg font-bold text-black mb-4">Møteoppgaver</h3>
            {meetingTasks && meetingTasks.length > 0 ? (
              <div className="space-y-3">
                {meetingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <input type="checkbox" className="mt-1" />
                    <div className="flex-1">
                      <p className="font-bold text-black text-sm">{task.title}</p>
                      {task.description && (
                        <p className="text-gray-600 text-xs">{task.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 font-medium text-sm">Ingen oppgaver ennå</p>
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-black text-sm mb-1">AI Assistent</h4>
                <p className="text-gray-700 text-xs mb-3">
                  "Basert på notatene deres, foreslår jeg å fokusere på matriseoperasjoner og egenverdiproblemer."
                </p>
                <div className="flex flex-col space-y-2">
                  <button className="inline-flex items-center px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    Generer spørsmål
                  </button>
                  <button className="inline-flex items-center px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    Oppdater masterdokument
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Note-taking */}
      <LiveNotes 
        emneId={emneId}
        meetingId={moteId}
        userId={user.id}
      />
    </div>
  )
}
