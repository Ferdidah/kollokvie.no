'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { Emne } from '@/types/database'

interface NewMeetingPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default function NewMeetingPage({ params }: NewMeetingPageProps) {
  const { emneId } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    scheduled_at: '',
    duration_minutes: 60,
    agenda: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.scheduled_at) {
      alert('Tittel og tidspunkt er påkrevd')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          emne_id: emneId,
          title: formData.title.trim(),
          scheduled_at: formData.scheduled_at,
          duration_minutes: formData.duration_minutes,
          agenda: formData.agenda.trim() || null,
          status: 'scheduled'
        })
        .select()
        .single()

      if (meetingError) throw meetingError

      // Redirect to the meeting page
      router.push(`/emner/${emneId}/mote/${meeting.id}`)
      
    } catch (error: any) {
      console.error('Error creating meeting:', error)
      alert('Kunne ikke opprette møte: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Planlegg nytt møte</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Opprett et nytt kollokvie-møte for gruppen
        </p>
      </div>

      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
              Møtetittel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="F.eks. Kapittel 6 - Derivasjon, Lab 3 gjennomgang"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="scheduled_at" className="block text-sm font-bold text-black mb-2">
                Dato og tid *
              </label>
              <input
                type="datetime-local"
                id="scheduled_at"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="duration_minutes" className="block text-sm font-bold text-black mb-2">
                Varighet (minutter)
              </label>
              <select
                id="duration_minutes"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              >
                <option value={30}>30 minutter</option>
                <option value={60}>1 time</option>
                <option value={90}>1,5 timer</option>
                <option value={120}>2 timer</option>
                <option value={180}>3 timer</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="agenda" className="block text-sm font-bold text-black mb-2">
              Agenda (valgfri)
            </label>
            <textarea
              id="agenda"
              rows={6}
              value={formData.agenda}
              onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="Skriv inn agenda for møtet. Hver punkt på en egen linje:&#10;&#10;1. Gjennomgang av forrige møte&#10;2. Diskusjon av kapittel 6&#10;3. Gjennomgang av øvelser&#10;4. Planlegging av neste uke"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex justify-center items-center py-3 px-6 border-2 border-transparent shadow-lg text-base font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Oppretter...
                </>
              ) : (
                'Opprett møte'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex justify-center py-3 px-6 border-2 border-gray-300 shadow-lg text-base font-bold rounded-2xl text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100 hover:border-blue-200 shadow-lg hover:shadow-xl rounded-2xl p-6 mt-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-black mb-1">Tips for godt møte</h3>
            <p className="text-gray-700 font-medium text-sm">
              • Planlegg agenda på forhånd og del med gruppen<br/>
              • Tildel roller (leder, notatfører) før møtet<br/>
              • Sett tydelige mål for hva som skal oppnås<br/>
              • Avslutt med konkrete oppgaver for neste gang
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

