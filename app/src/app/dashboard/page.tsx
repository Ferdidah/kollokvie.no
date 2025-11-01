import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
//import { NotesSection } from './NotesSection'
//import { TodosSection } from './TodosSection'
import type { Todo } from '@/types/database'

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Fetch user's notes and todos
  const { data: notes, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })

  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (notesError) console.error('Error fetching notes:', notesError)
  if (todosError) console.error('Error fetching todos:', todosError)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black tracking-tight">Dashboard</h1>
          <p className="mt-3 text-lg text-black font-medium">Hei, {user.email?.split('@')[0]} 👋</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide">Notater</h3>
                <p className="text-3xl font-black text-black">{notes?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide">Todos</h3>
                <p className="text-3xl font-black text-black">{todos?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <h3 className="text-sm font-bold text-black uppercase tracking-wide">Fullført</h3>
                <p className="text-3xl font-black text-black">
                  {todos?.filter((todo: Todo) => todo.completed).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Notes Section */}
          {/* <NotesSection notes={notes || []} /> */}
          
          {/* Todos Section */}
          {/* <TodosSection todos={todos || []} /> */}
        </div>
      </div>
    </div>
  )
}