export default function MineBidragPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Mine Bidrag</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Personlig feed med alle dine bidrag på tvers av emner
        </p>
      </div>

      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Mine bidrag kommer snart</h3>
        <p className="text-black font-medium">
          Her vil du se alle dine notater, spørsmål og innsikter på tvers av alle emner.
        </p>
      </div>
    </div>
  )
}

