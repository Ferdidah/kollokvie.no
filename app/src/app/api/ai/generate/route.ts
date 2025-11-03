// API Route for AI document generation using OpenAI SDK

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

export const maxDuration = 60 // 60 seconds for AI generation

// Initialize OpenAI client
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in environment variables')
    throw new Error('OPENAI_API_KEY is not set in environment variables')
  }
  if (!apiKey.startsWith('sk-')) {
    console.warn('OPENAI_API_KEY does not start with "sk-", may be invalid')
  }
  return new OpenAI({ apiKey })
}

// Build system prompt based on type
function getSystemPrompt(type: string, emneTitle: string, goals?: string): string {
  switch (type) {
    case 'synthesize_notes':
      return `Du er en ekspert på å syntetisere og organisere kunnskap fra studiegrupper.

Din oppgave er å lage et masterdokument som samler og organiserer all kunnskap fra en studiegruppe (emne: "${emneTitle}").

${goals ? `Gruppens mål: ${goals}` : ''}

Retningslinjer:
1. Organiser innholdet logisk og strukturert
2. Identifiser hovedtemaer og nøkkelkonsepter
3. Fremhev viktige innsikter og sammenhenger
4. Bruk norsk språk
5. Vær presis og faktabasert
6. Inkluder anbefalinger for videre læring
7. Bruk markdown for struktur med overskrifter, lister og fremhevinger`

    case 'generate_questions':
      return `Du er en ekspert på å lage læringsorienterte diskusjonsspørsmål for studiegrupper.

Din oppgave er å generere relevante og utfordrende spørsmål basert på gruppens notater og diskusjoner (emne: "${emneTitle}").

Retningslinjer:
1. Spørsmålene skal stimulere dypere forståelse
2. Inkluder både teoretiske og praktiske spørsmål
3. Organiser spørsmålene i kategorier
4. Bruk norsk språk
5. Vær tydelig og presis
6. Generer 10-15 spørsmål totalt`

    case 'analyze_knowledge_gaps':
      return `Du er en ekspert på å analysere kunnskapshull og læringsprogresjon i studiegrupper.

Din oppgave er å analysere gruppens kunnskap og identifisere områder som trenger mer oppmerksomhet (emne: "${emneTitle}").

${goals ? `Gruppens mål: ${goals}` : ''}

Retningslinjer:
1. Identifiser sterke sider i gruppens kunnskap
2. Identifiser utviklingsområder og kunnskapshull
3. Gi konkrete anbefalinger for videre læring
4. Bruk norsk språk
5. Vær konstruktiv og støttende
6. Fokuser på læringsutbytte`

    default:
      return `Du er en AI-assistent som hjelper studiegrupper med å organisere og forstå kunnskap (emne: "${emneTitle}").`
  }
}

// Build user prompt with contributions
function buildUserPrompt(
  contributions: Array<{ title: string; content: string; type: string }>,
  customPrompt?: string,
  type?: string
): string {
  if (contributions.length === 0) {
    return customPrompt || 'Analyser emnets innhold og generer relevant informasjon.'
  }

  const contributionsText = contributions
    .map((c, i) => `## Bidrag ${i + 1}: ${c.title} (${c.type})\n${c.content}`)
    .join('\n\n---\n\n')

  const basePrompt = type === 'synthesize_notes'
    ? customPrompt || 'Synteser følgende bidrag til et strukturert masterdokument:'
    : type === 'generate_questions'
    ? customPrompt || 'Generer diskusjonsspørsmål basert på følgende notater:'
    : customPrompt || 'Analyser følgende bidrag og identifiser kunnskapshull:'

  return `${basePrompt}\n\n${contributionsText}`
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    // Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request
    const body = await request.json()
    const { type, emneId, prompt: customPrompt } = body

    if (!type || !emneId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, emneId' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['synthesize_notes', 'generate_questions', 'analyze_knowledge_gaps']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify emne membership
    const { data: membership, error: membershipError } = await supabase
      .from('emne_members')
      .select('*')
      .eq('emne_id', emneId)
      .eq('user_id', user.id)
      .single()

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Not a member of this emne' },
        { status: 403 }
      )
    }

    // Fetch emne info
    const { data: emne, error: emneError } = await supabase
      .from('emne')
      .select('title, goals')
      .eq('id', emneId)
      .single()

    if (emneError || !emne) {
      return NextResponse.json(
        { error: 'Emne not found' },
        { status: 404 }
      )
    }

    // Fetch contributions for context
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('id, title, content, type')
      .eq('emne_id', emneId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (contributionsError) {
      console.error('Error fetching contributions:', contributionsError)
    }

    // Initialize OpenAI
    let openai: OpenAI
    try {
      openai = getOpenAIClient()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.json(
        { error: `OpenAI configuration error: ${errorMessage}` },
        { status: 500 }
      )
    }

    // Build prompts
    const systemPrompt = getSystemPrompt(type, emne.title, emne.goals || undefined)
    const userPrompt = buildUserPrompt(contributions || [], customPrompt, type)

    console.log('Calling OpenAI API...', {
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      type,
      contributionsCount: contributions?.length || 0
    })

    // Call OpenAI API
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: parseInt(process.env.AI_MAX_TOKENS || '2000'),
        temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
      })
      console.log('OpenAI API call successful', {
        model: completion.model,
        usage: completion.usage
      })
    } catch (error) {
      console.error('OpenAI API error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Provide more helpful error messages
      if (errorMessage.includes('401') || errorMessage.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.' },
          { status: 500 }
        )
      }
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded. Please try again later.' },
          { status: 500 }
        )
      }
      if (errorMessage.includes('insufficient_quota')) {
        return NextResponse.json(
          { error: 'OpenAI account has insufficient quota. Please add credits to your account.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `AI generation failed: ${errorMessage}` },
        { status: 500 }
      )
    }

    const aiContent = completion.choices[0]?.message?.content
    if (!aiContent) {
      return NextResponse.json(
        { error: 'No content generated from AI' },
        { status: 500 }
      )
    }

    // Determine document title
    let documentTitle: string
    switch (type) {
      case 'synthesize_notes':
        documentTitle = `Masterdokument - ${emne.title}`
        break
      case 'generate_questions':
        documentTitle = `Diskusjonsspørsmål - ${emne.title}`
        break
      case 'analyze_knowledge_gaps':
        documentTitle = `Kunnskapsanalyse - ${emne.title}`
        break
      default:
        documentTitle = `AI-generert dokument - ${emne.title}`
    }

    // Save to database
    const { data: document, error: dbError } = await supabase
      .from('master_documents')
      .insert({
        emne_id: emneId,
        title: documentTitle,
        content: aiContent,
        ai_prompt: customPrompt || 'Standard generering',
        source_contributions: JSON.stringify((contributions || []).map(c => c.id))
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      document: document,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      }
    })

  } catch (error) {
    console.error('AI generation API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

