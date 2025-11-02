import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  // Initialize Supabase Admin client with service role key
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Delete the user from Auth
  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (deleteUserError) {
    console.error('Delete user failed:', deleteUserError)
    return NextResponse.json({ error: deleteUserError.message }, { status: 500 })
  }

  // Optionally clean up related tables
  const tablesToClean = ['profiles', 'tasks', 'contributions', 'emne_members']
  for (const table of tablesToClean) {
    await supabaseAdmin.from(table).delete().eq('user_id', userId)
  }

  return NextResponse.json({ message: 'User deleted successfully' })
}
