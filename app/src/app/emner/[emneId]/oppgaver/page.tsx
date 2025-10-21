export default function TasksPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Oppgaver</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Felles- og personlige oppgaver med filtre og eierskap
        </p>
      </div>

      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Oppgavesystem kommer snart</h3>
        <p className="text-black font-medium">
          Her vil du kunne administrere felles og personlige oppgaver med avanserte filtre.
        </p>
      </div>
    </div>
  )
}

