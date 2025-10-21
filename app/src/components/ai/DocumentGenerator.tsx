'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { aiService, type AIPrompt } from '@/lib/ai-service'

interface DocumentGeneratorProps {
  emneId: string
  onDocumentGenerated?: (documentId: string) => void
}

export function DocumentGenerator({ emneId, onDocumentGenerated }: DocumentGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generationType, setGenerationType] = useState<'synthesize' | 'questions' | 'analysis'>('synthesize')
  const supabase = createClient()

  const handleGenerate = async () => {
    setLoading(true)
    
    try {
      // Fetch recent contributions for context
      const { data: contributions } = await supabase
        .from('contributions')
        .select('*')
        .eq('emne_id', emneId)
        .order('created_at', { ascending: false })
        .limit(20)

      // Fetch emne goals
      const { data: emne } = await supabase
        .from('emne')
        .select('goals, title')
        .eq('id', emneId)
        .single()

      // Prepare AI prompt
      const aiPrompt: AIPrompt = {
        type: generationType === 'synthesize' ? 'synthesize_notes' : 
              generationType === 'questions' ? 'generate_questions' : 'analyze_knowledge_gaps',
        context: prompt || `Synteser av notater for ${emne?.title || 'emnet'}`,
        contributions: contributions?.map(c => c.content) || [],
        emne_goals: emne?.goals || undefined
      }

      // Generate content with AI
      const aiResponse = await aiService.generateMasterDocument(aiPrompt)

      // Create master document
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: newDoc, error } = await supabase
        .from('master_documents')
        .insert({
          emne_id: emneId,
          title: generationType === 'synthesize' ? `Masterdokument - ${emne?.title}` :
                 generationType === 'questions' ? `Diskusjonsspørsmål - ${emne?.title}` :
                 `Kunnskapsanalyse - ${emne?.title}`,
          content: aiResponse.content,
          ai_prompt: prompt || 'Standard syntese',
          source_contributions: JSON.stringify(contributions?.map(c => c.id) || [])
        })
        .select()
        .single()

      if (error) throw error

      // Reset form
      setPrompt('')
      
      // Notify parent component
      if (onDocumentGenerated) {
        onDocumentGenerated(newDoc.id)
      }

      alert('Masterdokument generert successfully!')
      
    } catch (error: any) {
      console.error('Error generating document:', error)
      alert('Kunne ikke generere dokument: ' + (error.message || 'Ukjent feil'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
      <h3 className="text-lg font-bold text-black mb-4">AI Dokumentgenerator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Genereringstype
          </label>
          <select
            value={generationType}
            onChange={(e) => setGenerationType(e.target.value as 'synthesize' | 'questions' | 'analysis')}
            className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="synthesize">Synteser notater til masterdokument</option>
            <option value="questions">Generer diskusjonsspørsmål</option>
            <option value="analysis">Analyser kunnskapshull</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">
            AI Prompt (valgfri)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Beskriv hva du ønsker AI-en skal fokusere på..."
            className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
            rows={3}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full inline-flex justify-center items-center py-3 px-6 border-2 border-transparent shadow-lg text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Genererer...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Generer med AI
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-blue-800 font-medium text-sm">
          💡 AI-en analyserer gruppens notater og genererer strukturert innhold basert på kollektiv kunnskap.
        </p>
      </div>
    </div>
  )
}

