'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
    })

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        router.push('/dashboard') // Redirect to dashboard after login
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [supabase, router])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) throw error
      
      // User will be redirected by the auth state change listener
    } catch (err: any) {
      alert(err.message ?? 'Feil ved innlogging')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) throw error

      if (data?.user) {
        await supabase.from('profiles').insert([
          { id: data.user.id, username }
        ])
      }

      alert('Registrering vellykket! Vennligst sjekk e-posten din for å bekrefte kontoen.')
    } catch (err: any) {
      alert(err.message ?? 'Feil ved registrering')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.refresh()
    } catch (err: any) {
      alert(err.message ?? 'Feil ved utlogging')
    } finally {
      setLoading(false)
    }
  }

  // If user is logged in, show logged in state
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-black mb-3">Velkommen!</h2>
            <p className="text-lg text-black font-medium">Logget inn som: <span className="font-bold">{user.email}</span></p>
            {user.user_metadata.username && (
              <p className="text-sm text-gray-600 mt-2">Brukernavn: <span className="font-semibold">{user.user_metadata.username}</span></p>
            )}
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center py-4 px-6 border-2 border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Gå til Dashboard
            </button>
            
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center justify-center py-4 px-6 border-2 border-gray-300 rounded-2xl shadow-lg text-lg font-bold text-black bg-white hover:bg-gray-50 hover:border-gray-400 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logger ut...
                </>
              ) : (
                'Logg ut'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Login/Signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-black mb-3">Notes & Todos</h2>
          <p className="text-lg text-black font-medium">Enkel og sikker notat-app</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-3 px-6 text-base font-bold rounded-xl transition-all duration-200 ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            Logg Inn
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 px-6 text-base font-bold rounded-xl transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'text-black hover:bg-gray-200'
            }`}
          >
            Registrer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-6">
          {mode === 'signup' && (
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-black mb-2">
              Brukernavn
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-black font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              placeholder="Ditt Brukernavn"
            />
          </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
              E-post
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-black font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              placeholder="din@epost.no"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-black mb-2">
              Passord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-black font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-6 border-2 border-transparent rounded-2xl shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'signin' ? 'Logger inn...' : 'Registrerer...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {mode === 'signin' ? 'Logg Inn' : 'Opprett Konto'}
              </>
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-8">
          {mode === 'signin' ? (
            <p className="text-black font-medium">
              Har du ikke konto?{' '}
              <button
                onClick={() => setMode('signup')}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline transition-colors duration-200"
              >
                Registrer deg her
              </button>
            </p>
          ) : (
            <p className="text-black font-medium">
              Har du allerede konto?{' '}
              <button
                onClick={() => setMode('signin')}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline transition-colors duration-200"
              >
                Logg inn her
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
