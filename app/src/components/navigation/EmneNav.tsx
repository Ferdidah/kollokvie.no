'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Emne } from '@/types/database'

interface EmneNavProps {
  emne: Emne
}

export function EmneNav({ emne }: EmneNavProps) {
  const pathname = usePathname()
  
  const navItems = [
    {
      href: `/dashboard/emner/${emne.id}`,
      label: 'Oversikt',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      href: `/dashboard/emner/${emne.id}/mote`,
      label: 'Møter',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      href: `/dashboard/emner/${emne.id}/kunnskapsbank`,
      label: 'Kunnskapsbank',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'emerald'
    },
    {
      href: `/dashboard/emner/${emne.id}/oppgaver`,
      label: 'Oppgaver',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'amber'
    },
    {
      href: `/dashboard/emner/${emne.id}/medlemmer`,
      label: 'Medlemmer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'indigo'
    },
    {
      href: `/dashboard/emner/${emne.id}/innstillinger`,
      label: 'Innstillinger',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'gray'
    }
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        hover: 'hover:bg-blue-50 hover:border-blue-200',
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        active: 'bg-blue-50 border-blue-200'
      },
      purple: {
        hover: 'hover:bg-purple-50 hover:border-purple-200',
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        active: 'bg-purple-50 border-purple-200'
      },
      emerald: {
        hover: 'hover:bg-emerald-50 hover:border-emerald-200',
        bg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        active: 'bg-emerald-50 border-emerald-200'
      },
      amber: {
        hover: 'hover:bg-amber-50 hover:border-amber-200',
        bg: 'bg-amber-100',
        icon: 'text-amber-600',
        active: 'bg-amber-50 border-amber-200'
      },
      indigo: {
        hover: 'hover:bg-indigo-50 hover:border-indigo-200',
        bg: 'bg-indigo-100',
        icon: 'text-indigo-600',
        active: 'bg-indigo-50 border-indigo-200'
      },
      gray: {
        hover: 'hover:bg-gray-50 hover:border-gray-200',
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        active: 'bg-gray-50 border-gray-200'
      }
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <nav className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 border-r-2 border-blue-100 shadow-lg w-64">
      {/* Emne Header */}
      <div className="flex items-center justify-center h-20 border-b-2 border-blue-100 bg-gradient-to-r from-indigo-600 to-blue-600 mx-4 mt-4 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {emne.code || emne.title.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white font-black text-sm tracking-tight">
              {emne.title}
            </span>
          </div>
          {emne.semester && (
            <p className="text-white text-xs opacity-80">{emne.semester}</p>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between p-6">
        {/* Navigation Menu */}
        <nav className="space-y-3 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const colorClasses = getColorClasses(item.color, isActive)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-base font-bold text-black rounded-2xl border-2 border-transparent transition-all duration-200 group ${
                  isActive ? colorClasses.active : colorClasses.hover
                }`}
              >
                <div className={`w-8 h-8 ${colorClasses.bg} rounded-xl flex items-center justify-center mr-3 group-hover:${colorClasses.bg.replace('100', '200')} transition-colors duration-200`}>
                  <div className={colorClasses.icon}>
                    {item.icon}
                  </div>
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Back to Global Navigation */}
        <div className="border-t-2 border-gray-200 pt-6">
          <Link
            href="/dashboard/emner"
            className="flex items-center px-4 py-3 text-base font-bold text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-gray-200 border-2 border-transparent transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-gray-200 transition-colors duration-200">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            Tilbake til oversikt
          </Link>
        </div>
      </div>
    </nav>
  )
}

