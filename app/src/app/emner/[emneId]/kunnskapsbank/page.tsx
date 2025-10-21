import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { DocumentGeneratorWrapper } from '@/components/ai/DocumentGeneratorWrapper'
import type { MasterDocument, Contribution } from '@/types/database'

interface KnowledgeBasePageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function KnowledgeBasePage({ params }: KnowledgeBasePageProps) {
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

  // Fetch master documents
  const { data: masterDocs, error: docsError } = await supabase
    .from('master_documents')
    .select('*')
    .eq('emne_id', emneId)
    .order('updated_at', { ascending: false })

  if (docsError) {
    console.error('Error fetching master documents:', docsError)
  }

  // Fetch recent contributions for context
  const { data: recentContributions } = await supabase
    .from('contributions')
    .select('*')
    .eq('emne_id', emneId)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Kunnskapsbank</h1>
          <p className="mt-3 text-lg text-black font-medium">
            AI-genererte masterdokumenter og søk i notater
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border-2 border-gray-300 shadow-lg text-sm font-bold rounded-xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Eksporter alle
          </button>
          <button className="inline-flex items-center px-4 py-2 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generer nytt dokument
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Totalt Dokumenter</h3>
            <p className="text-2xl font-black text-black">{masterDocs?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-purple-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Siste Oppdatering</h3>
            <p className="text-sm font-black text-black">
              {masterDocs && masterDocs.length > 0 
                ? new Date(masterDocs[0].updated_at).toLocaleDateString('nb-NO')
                : 'Aldri'
              }
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-emerald-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">Totalt Sider</h3>
            <p className="text-2xl font-black text-black">
              {masterDocs?.reduce((total, doc) => total + Math.ceil(doc.content.length / 2000), 0) || 0}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-orange-100 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-black uppercase tracking-wide">AI Genereringer</h3>
            <p className="text-2xl font-black text-black">{masterDocs?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Søk i masterdokumenter og notater..."
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>
          <button className="inline-flex items-center px-4 py-3 border-2 border-transparent shadow-lg text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Søk
          </button>
        </div>
      </div>

      {/* AI Document Generator */}
      <div className="mb-8">
        <DocumentGeneratorWrapper emneId={emneId} />
      </div>

      {/* Documents List */}
      {masterDocs && masterDocs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {masterDocs.map((doc) => (
            <Link key={doc.id} href={`/emner/${emneId}/kunnskapsbank/${doc.id}`}>
              <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-200 hover:border-blue-200 transform hover:scale-105 cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-black mb-1">{doc.title}</h3>
                      <p className="text-sm text-gray-600">
                        Versjon {doc.version} • {Math.ceil(doc.content.length / 2000)} sider
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(doc.updated_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 font-medium mb-4 line-clamp-3">
                  {doc.content.substring(0, 200)}...
                </p>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI-generert</span>
                  </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Ingen dokumenter ennå</h3>
          <p className="text-black font-medium mb-6">
            Bruk AI-generatoren over for å lage ditt første masterdokument basert på gruppens notater.
          </p>
        </div>
      )}

      {/* Recent Contributions */}
      {recentContributions && recentContributions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-black mb-6">Nylige Bidrag</h2>
          <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
            <div className="space-y-4">
              {recentContributions.map((contribution) => (
                <div key={contribution.id} className="flex items-start space-x-3 p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      {contribution.type === 'note' ? '📝' :
                       contribution.type === 'question' ? '❓' :
                       contribution.type === 'insight' ? '💡' : '📋'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-black text-sm mb-1">{contribution.title}</h3>
                    <p className="text-gray-700 font-medium text-sm mb-2 line-clamp-2">
                      {contribution.content}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {new Date(contribution.created_at).toLocaleDateString('nb-NO')} • 
                      {contribution.type === 'note' ? 'Notat' :
                       contribution.type === 'question' ? 'Spørsmål' :
                       contribution.type === 'insight' ? 'Innsikt' : 'Sammendrag'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-xl rounded-2xl p-6 mt-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-black mb-2">AI Kunnskapsanalyse</h3>
            <p className="text-gray-700 font-medium mb-4">
              "Basert på gruppens notater identifiserer jeg følgende kunnskapsområder: 
              Sterk forståelse av derivasjon, men trenger mer arbeid med integrasjon. 
              Foreslår fokus på substitusjonsmetoder for neste møte."
            </p>
            <div className="flex items-center space-x-4">
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Se detaljert analyse
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Generer øvelsesproblemer
              </button>
              <button className="inline-flex items-center px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200">
                Oppdater kunnskapskart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
