export default function MembersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Medlemmer & Roller</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Administrer medlemmer, invitasjoner og roterende roller
        </p>
      </div>

      <div className="text-center py-16">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-black mb-2">Medlemsadministrasjon kommer snart</h3>
        <p className="text-black font-medium">
          Her vil du kunne invitere medlemmer, administrere roller og se rulleringsplan.
        </p>
      </div>
    </div>
  )
}

