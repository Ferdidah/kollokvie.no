'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { GroupInsert } from '@/types/database'

export default function CreateGroupPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: ''
  })

  // Norske fag-forslag
  const norwegianSubjects = [
    'Sosialpsykologi',
    'Utviklingspsykologi', 
    'Kognitiv psykologi',
    'Medisin - Anatomi',
    'Medisin - Fysiologi',
    'Jus - Sivilrett',
    'Jus - Straffrett',
    'Økonomi - Mikroøkonomi',
    'Økonomi - Makroøkonomi',
    'IT - Programmering',
    'IT - Databaser',
    'Annet'
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.subject) {
      alert('Vennligst fyll ut gruppenavn og fag')
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('Du må være logget inn for å opprette en gruppe')
        router.push('/login')
        return
      }

      // Create group
      const groupData: GroupInsert = {
        name: formData.name,
        subject: formData.subject,
        description: formData.description || null,
        created_by: user.id
      }

      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert(groupData)
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'leader'
        })

      if (memberError) throw memberError

      // Redirect to group page
      router.push(`/groups/${group.id}`)
      
    } catch (error: any) {
      console.error('Error creating group:', error)
      alert('Kunne ikke opprette gruppe: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Tilbake til Dashboard
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Opprett Ny Kollokv-gruppe</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start en ny studiegruppe med AI-støttet kollokv-metodikk
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Gruppenavn */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Gruppenavn *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="f.eks. 'Sosialpsykologi Vår 2024'"
              />
              <p className="mt-1 text-xs text-gray-500">
                Velg et beskrivende navn som alle medlemmer kjenner igjen
              </p>
            </div>

            {/* Fag */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Fag/Emne *
              </label>
              <select
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Velg fag...</option>
                {norwegianSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Velg fagområdet gruppen skal jobbe med
              </p>
            </div>

            {/* Beskrivelse */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Beskrivelse (valgfri)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Beskriv hva gruppen skal fokusere på, hvilke kapitler dere skal gjennom, etc..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Hjelp potensielle medlemmer å forstå gruppens mål og fokus
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oppretter gruppe...
                </>
              ) : (
                'Opprett Kollokv-gruppe'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Etter opprettelse får du en invitasjonslenke å dele med andre studenter
            </p>
          </div>
        </form>

        {/* Info om kollokv-metodikk */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Hvordan fungerer AI-kollokv?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Din gruppe vil følge en strukturert 4-fase syklus:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><strong>Delegering:</strong> Fordel fokusområder mellom medlemmene</li>
                  <li><strong>Forberedelse:</strong> Hver person skriver notater om sitt område</li>
                  <li><strong>Møte:</strong> AI lager agenda og spørsmål basert på notatene</li>
                  <li><strong>Dokumentasjon:</strong> AI sammenfatter til masterdokument</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

