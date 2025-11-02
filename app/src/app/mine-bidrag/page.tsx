import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Contribution } from '@/types/database'

export default async function MineBidragPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all user's contributions
  const { data: contributions, error: contributionsError } = await supabase
    .from('contributions')
    .select('*, emne:emne_id(title, code, id)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (contributionsError) {
    console.error('Error fetching contributions:', contributionsError)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note':
        return 'Notat'
      case 'question':
        return 'Spørsmål'
      case 'insight':
        return 'Innsikt'
      case 'summary':
        return 'Sammendrag'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-700'
      case 'question':
        return 'bg-yellow-100 text-yellow-700'
      case 'insight':
        return 'bg-purple-100 text-purple-700'
      case 'summary':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Mine Bidrag</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Personlig feed med alle dine bidrag på tvers av emner
        </p>
      </div>

      {contributions && contributions.length > 0 ? (
        <div className="space-y-6">
          {contributions.map((contribution: any) => {
            const emne = contribution.emne as { id: string; title: string; code: string | null } | null
            
            return (
              <div
                key={contribution.id}
                className="bg-white border-2 border-gray-200 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(contribution.type)}`}>
                        {getTypeLabel(contribution.type)}
                      </span>
                      {emne && (
                        <Link
                          href={`/dashboard/emner/${emne.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          {emne.title}
                          {emne.code && ` (${emne.code})`}
                        </Link>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-2">{contribution.title}</h3>
                    <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                      {contribution.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    {new Date(contribution.created_at).toLocaleDateString('nb-NO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {contribution.meeting_id && (
                    <Link
                      href={`/dashboard/emner/${emne?.id}/mote/${contribution.meeting_id}`}
                      className="text-sm text-gray-600 hover:text-blue-600 font-medium"
                    >
                      Se møte →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-black mb-2">Ingen bidrag ennå</h3>
          <p className="text-black font-medium">
            Dine bidrag, notater og spørsmål vil vises her når du oppretter dem i emnene dine.
          </p>
        </div>
      )}
    </div>
  )
}

