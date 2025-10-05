
import Link from 'next/link'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-black text-black mb-4 tracking-tight">
            Simple Notes & Todos
          </h1>
          <p className="text-xl text-black mb-12 max-w-2xl mx-auto leading-relaxed">
            Enkel, kraftig og sikker notater og todo-liste app bygget med moderne teknologi
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <div className="text-2xl mb-3">✅</div>
              <h3 className="font-bold text-black text-lg mb-2">Next.js + TypeScript</h3>
              <p className="text-black text-sm">Moderne React framework med type-sikkerhet</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="text-2xl mb-3">🔐</div>
              <h3 className="font-bold text-black text-lg mb-2">Supabase Auth</h3>
              <p className="text-black text-sm">Sikker autentisering og brukerbehandling</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
              <div className="text-2xl mb-3">🗄️</div>
              <h3 className="font-bold text-black text-lg mb-2">Real-time Database</h3>
              <p className="text-black text-sm">Synkroniserte data på tvers av enheter</p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="text-2xl mb-3">📝</div>
              <h3 className="font-bold text-black text-lg mb-2">Cloud Storage</h3>
              <p className="text-black text-sm">Dine notater lagres trygt i skyen</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"  
              className="inline-flex items-center justify-center py-4 px-8 rounded-2xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span>Kom i gang</span>
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center py-4 px-8 rounded-2xl text-lg font-bold text-black bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Se Dashboard
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-black font-medium">
            Bygget med ❤️ av studenter, for studenter
          </p>
        </div>
      </div>
    </div>
  )
}
