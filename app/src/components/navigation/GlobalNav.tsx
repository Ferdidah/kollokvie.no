'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function GlobalNav() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <nav className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 border-r-2 border-blue-100 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b-2 border-blue-100 bg-gradient-to-r from-indigo-600 to-blue-600 mx-4 mt-4 rounded-2xl shadow-lg">
        <Link href="/dashboard/emner" className="text-white font-black text-lg tracking-tight">
          📚 Kollokvie.no
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6">
        {/* Navigation Menu */}
        <nav className="space-y-3 mt-4">
          {/* <Link
            href="/dashboard/emner"
            className="flex items-center px-4 py-3 text-base font-bold text-black rounded-2xl hover:bg-blue-50 hover:border-blue-200 border-2 border-transparent transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            Mine Emner
          </Link> */}
          
          <Link
            href="/dashboard/upcoming-meetings"
            className="flex items-center px-4 py-3 text-base font-bold text-black rounded-2xl hover:bg-purple-50 hover:border-purple-200 border-2 border-transparent transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Kommende Møter
          </Link>
          
          <Link
            href="/dashboard/mine-bidrag"
            className="flex items-center px-4 py-3 text-base font-bold text-black rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 border-2 border-transparent transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-emerald-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            Mine Bidrag
          </Link>
          
          <Link
            href="/dashboard/profile"
            className="flex items-center px-4 py-3 text-base font-bold text-black rounded-2xl hover:bg-amber-50 hover:border-amber-200 border-2 border-transparent transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-amber-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Profil
          </Link>
        </nav>

        {/* Sign Out Button */}
        <div className="border-t-2 border-gray-200 pt-6">
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="flex w-full items-center px-4 py-3 text-base font-bold text-red-700 rounded-2xl hover:bg-red-50 hover:border-red-200 border-2 border-transparent transition-all duration-200 group disabled:opacity-50"
          >
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            {loading ? 'Logger ut...' : 'Logg ut'}
          </button>
        </div>
      </div>
    </nav>
  )
}

