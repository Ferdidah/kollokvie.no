import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Emne } from '@/types/database'

// Disable static caching for this page to ensure member counts are fresh
export const dynamic = 'force-dynamic'

interface EmneDashboardPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function EmneDashboardPage({ params }: EmneDashboardPageProps) {
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

  // Fetch next meeting
  const { data: nextMeeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('emne_id', emneId)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  // Fetch total meetings count
  const { data: allMeetings, error: meetingsCountError } = await supabase
    .from('meetings')
    .select('id')
    .eq('emne_id', emneId)
  
  const meetingsCount = allMeetings?.length || 0

  // Fetch all tasks for this emne (both personal and shared - all members can see all tasks)
  const { data: allTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('emne_id', emneId)
    .order('created_at', { ascending: false })
    .limit(10)

  // Separate tasks into categories
  const userTasks = allTasks?.filter(t => t.user_id === user.id && t.status !== 'completed') || []
  const sharedTasks = allTasks?.filter(t => t.user_id === null && t.status !== 'completed') || []
  const completedTasks = allTasks?.filter(t => t.status === 'completed').length || 0
  const totalActiveTasks = allTasks?.filter(t => t.status !== 'completed').length || 0

  // Fetch recent contributions
  const { data: recentContributions } = await supabase
    .from('contributions')
    .select('*')
    .eq('emne_id', emneId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch latest master document
  const { data: latestMasterDoc } = await supabase
    .from('master_documents')
    .select('*')
    .eq('emne_id', emneId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch member count - get all members and count them
  // The creator should already be included since create_emne_with_membership adds them
  const { data: allMembers, error: membersError } = await supabase
    .from('emne_members')
    .select('id')
    .eq('emne_id', emneId)
  
  if (membersError) {
    console.error('Error fetching member count:', membersError)
  }
  
  const memberCount = allMembers?.length || 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">{emne.title}</h1>
        <p className="mt-3 text-lg text-black font-medium">
          {emne.code && `${emne.code} • `}
          {emne.semester && `${emne.semester} • `}
          {emne.description || 'Kollokvie-gruppe'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Medlemmer</h3>
            <p className="text-2xl font-black text-black">{memberCount || 0}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Aktive Oppgaver</h3>
            <p className="text-2xl font-black text-black">{totalActiveTasks}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Bidrag</h3>
            <p className="text-2xl font-black text-black">{recentContributions?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-orange-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Møter</h3>
            <p className="text-2xl font-black text-black">{meetingsCount}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Meeting */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Neste Møte</h2>
            {nextMeeting && (
              <Link href={`/dashboard/emner/${emneId}/mote/${nextMeeting.id}`}>
                <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                  Gå til møte
                </button>
              </Link>
            )}
          </div>

          {nextMeeting ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-800 mb-2">{nextMeeting.title}</h3>
                <p className="text-blue-700 font-medium">
                  {new Date(nextMeeting.scheduled_at).toLocaleDateString('nb-NO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {nextMeeting.agenda && (
                <div>
                  <h4 className="font-bold text-black mb-2">Agenda</h4>
                  <p className="text-gray-700 font-medium text-sm">{nextMeeting.agenda}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Ingen møter planlagt</h3>
              <p className="text-gray-600 font-medium mb-4">
                Planlegg ditt første møte for å komme i gang
              </p>
              <Link href={`/dashboard/emner/${emneId}/mote/new`}>
                <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                  Planlegg møte
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Tasks Overview */}
        <div className="bg-white border-2 border-purple-100 shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Oppgaver</h2>
            <Link href={`/dashboard/emner/${emneId}/oppgaver`}>
              <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                Se alle
              </button>
            </Link>
          </div>

          {totalActiveTasks > 0 ? (
            <div className="space-y-3">
              {userTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Mine oppgaver</h3>
                  <div className="space-y-2">
                    {userTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              readOnly
                              className="w-4 h-4 text-purple-600 border-gray-300 rounded"
                            />
                            <span className="font-bold text-black text-sm">{task.title}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sharedTasks.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-black mb-2">Felles oppgaver</h3>
                  <div className="space-y-2">
                    {sharedTasks.slice(0, 3).map((task) => (
                      <div key={task.id} className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={false}
                              readOnly
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="font-bold text-black text-sm">{task.title}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority === 'high' ? 'Høy' : task.priority === 'medium' ? 'Medium' : 'Lav'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Ingen oppgaver ennå</h3>
              <p className="text-gray-600 font-medium mb-4">
                Opprett din første oppgave for å komme i gang
              </p>
              <Link href={`/dashboard/emner/${emneId}/oppgaver`}>
                <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                  Opprett oppgave
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Master Documents */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-black">Kunnskapsbase</h2>
            <Link href={`/dashboard/emner/${emneId}/kunnskapsbank`}>
              <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                Se alle
              </button>
            </Link>
          </div>

          {latestMasterDoc ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                <h3 className="font-bold text-black mb-1">{latestMasterDoc.title}</h3>
                <p className="text-gray-600 font-medium text-sm mb-2">
                  Versjon {latestMasterDoc.version} • {new Date(latestMasterDoc.updated_at).toLocaleDateString('nb-NO')}
                </p>
                <p className="text-gray-700 font-medium text-sm line-clamp-2">
                  {latestMasterDoc.content.substring(0, 100)}...
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">Ingen dokumenter ennå</h3>
              <p className="text-gray-600 font-medium mb-4">
                AI vil generere masterdokumenter basert på gruppens notater
              </p>
              <button className="inline-flex items-center px-3 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
                Generer dokument
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Placeholder */}
      <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-200 shadow-lg hover:shadow-xl rounded-2xl p-6 mt-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-black mb-2">AI Insights</h3>
            <p className="text-gray-700 font-medium">
              "Gruppen viser god forståelse av kalkulus, men trenger mer fokus på lineær algebra. 
              Foreslår: Ekstra øvelsesproblemer for neste møte."
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Generer spørsmål
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Oppdater masterdokument
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}