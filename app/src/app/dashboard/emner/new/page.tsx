'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NewEmnePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    semester: '',
    goals: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Tittel er påkrevd')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      console.log('Creating emne with data:', formData)

      // Create emne using the safe helper function (avoids RLS recursion)
      const { data: emneId, error: emneError } = await supabase
        .rpc('create_emne_with_membership', {
          emne_title: formData.title.trim(),
          emne_code: formData.code.trim() || null,
          emne_description: formData.description.trim() || null,
          emne_semester: formData.semester.trim() || null,
          emne_goals: formData.goals.trim() || null
        })

             if (emneError) {
               throw emneError
             }

             if (!emneId) {
               throw new Error('Failed to create emne - no ID returned')
             }

      // Redirect to the new emne dashboard
      router.push(`/dashboard/emner/${emneId}`)
      
    } catch (error: any) {
      console.error('Error creating emne:', error)
      alert('Kunne ikke opprette emne: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Opprett nytt emne</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Start en ny kollokvie-gruppe for ditt fag
        </p>
      </div>

      <div className="bg-white border-2 border-blue-100 shadow-xl rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-black mb-2">
              Emne-tittel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="F.eks. Matematikk 1, Fysikk 2, etc."
              required
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-bold text-black mb-2">
              Emne-kode (valgfri)
            </label>
            <input
              type="text"
              id="code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="F.eks. MAT121, FYS200"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-black mb-2">
              Beskrivelse (valgfri)
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="Beskriv hva emnet handler om..."
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-bold text-black mb-2">
              Semester (valgfri)
            </label>
            <input
              type="text"
              id="semester"
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="F.eks. Høst 2024, Vår 2025"
            />
          </div>

          <div>
            <label htmlFor="goals" className="block text-sm font-bold text-black mb-2">
              Gruppens mål (valgfri)
            </label>
            <textarea
              id="goals"
              rows={3}
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="Hva ønsker gruppen å oppnå? F.eks. 'Forstå kalkulus, forberede til eksamen'"
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
                'Opprett emne'
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
            <h3 className="font-bold text-black mb-1">Hva skjer etterpå?</h3>
            <p className="text-gray-700 font-medium text-sm">
              Etter at du oppretter emnet, kan du invitere medlemmer, planlegge møter, 
              og begynne å bygge opp gruppens kunnskapsbase sammen.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
