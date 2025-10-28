import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { EmneDeletion } from '@/components/emner/EmneDeletion'

interface SettingsPageProps {
  params: Promise<{
    emneId: string
  }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { emneId } = await params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Fetch emne details
  const { data: emne, error: emneError } = await supabase
    .from('emne')
    .select('*')
    .eq('id', emneId)
    .single()

  if (emneError || !emne) {
    notFound()
  }

  // Check if user is the creator
  const isCreator = emne.created_by === user.id

  // Fetch membership info for additional checks
  const { data: membership } = await supabase
    .from('emne_members')
    .select('role')
    .eq('emne_id', emneId)
    .eq('user_id', user.id)
    .single()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-black tracking-tight">Emneinnstillinger</h1>
        <p className="mt-3 text-lg text-black font-medium">
          Konfigurer emne, plan/semesterperioder og AI-innstillinger
        </p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Emne Information */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold text-black mb-4">Emneinformasjon</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tittel</label>
              <p className="text-black font-medium">{emne.title}</p>
            </div>
            {emne.code && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emnekode</label>
                <p className="text-black font-medium">{emne.code}</p>
              </div>
            )}
            {emne.description && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Beskrivelse</label>
                <p className="text-black font-medium">{emne.description}</p>
              </div>
            )}
            {emne.semester && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Semester</label>
                <p className="text-black font-medium">{emne.semester}</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white border-2 border-blue-100 shadow-xl rounded-2xl p-6">
          <h2 className="text-xl font-bold text-black mb-4">AI-innstillinger</h2>
          <div className="text-center py-8 text-gray-500">
            <p>AI-innstillinger kommer snart</p>
          </div>
        </div>

        {/* Delete Emne */}
        <EmneDeletion 
          emneId={emne.id} 
          emneTitle={emne.title}
          isCreator={isCreator}
        />
      </div>
    </div>
  )
}

