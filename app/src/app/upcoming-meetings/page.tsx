export default function UpcomingMeetingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Kommende Møter</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Oversikt over alle kommende møter på tvers av emner
        </p>
      </div>

      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Kommende møter kommer snart</h3>
        <p className="text-black font-medium">
          Her vil du se alle kommende møter på tvers av alle dine emner.
        </p>
      </div>
    </div>
  )
}

