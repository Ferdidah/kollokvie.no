import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { MasterDocument } from '@/types/database'

interface DocumentViewPageProps {
  params: {
    emneId: string
    docId: string
  }
}

export default async function DocumentViewPage({ params }: DocumentViewPageProps) {
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
    .eq('id', params.emneId)
    .single()

  if (emneError || !emne) {
    notFound()
  }

  // Check if user is a member of this emne
  const { data: membership } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', params.emneId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/emner')
  }

  // Fetch document details
  const { data: document, error: docError } = await supabase
    .from('master_documents')
    .select('*')
    .eq('id', params.docId)
    .eq('emne_id', params.emneId)
    .single()

  if (docError || !document) {
    notFound()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Link 
              href={`/dashboard/emner/${params.emneId}/kunnskapsbank`}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Kunnskapsbank
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{document.title}</span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">{document.title}</h1>
          <p className="mt-3 text-lg text-black font-medium">
            Versjon {document.version} • {new Date(document.updated_at).toLocaleDateString('nb-NO')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Eksporter
          </button>
          <button className="inline-flex items-center px-4 py-2 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Oppdater
          </button>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-2">Generert</h3>
            <p className="text-gray-700 font-medium">
              {new Date(document.generated_at).toLocaleDateString('nb-NO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-2">Lengde</h3>
            <p className="text-gray-700 font-medium">
              {Math.ceil(document.content.length / 2000)} sider • {document.content.length} tegn
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide mb-2">AI Prompt</h3>
            <p className="text-gray-700 font-medium text-sm">
              {document.ai_prompt || 'Standard syntese av gruppens notater'}
            </p>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-8 mb-8">
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 font-medium leading-relaxed">
            {document.content}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-black mb-2">AI Analyse av Dette Dokumentet</h3>
            <p className="text-gray-700 font-medium mb-4">
              "Dette dokumentet dekker hovedområdene godt, men jeg identifiserer noen kunnskapshull 
              i avanserte integrasjonsteknikker. Foreslår å fokusere på partiel integrasjon og 
              trigonometriske substitusjoner i neste møte."
            </p>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Se kunnskapshull
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Generer øvelsesproblemer
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Foreslå forbedringer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
        <h3 className="text-lg font-bold text-black mb-4">Versjonshistorikk</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <div>
              <p className="font-bold text-blue-800">Versjon {document.version}</p>
              <p className="text-blue-700 text-sm">
                {new Date(document.updated_at).toLocaleDateString('nb-NO')} • Nåværende versjon
              </p>
            </div>
            <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
              Se endringer
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
            <div>
              <p className="font-bold text-gray-800">Versjon {document.version - 1}</p>
              <p className="text-gray-700 text-sm">
                {new Date(document.created_at).toLocaleDateString('nb-NO')} • Første versjon
              </p>
            </div>
            <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
              Se versjon
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

