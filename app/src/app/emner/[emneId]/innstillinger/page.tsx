export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Emneinnstillinger</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Konfigurer emne, plan/semesterperioder og AI-innstillinger
        </p>
      </div>

      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Innstillinger kommer snart</h3>
        <p className="text-black font-medium">
          Her vil du kunne konfigurere emne-innstillinger, AI-arbeidsflyt og semesterplaner.
        </p>
      </div>
    </div>
  )
}

