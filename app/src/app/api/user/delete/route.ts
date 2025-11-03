import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Check if service role key is available
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json(
        { error: 'Server configuration error: Service role key missing' },
        { status: 500 }
      )
    }

    // Initialize Supabase Admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // STEP 1: Clean up user data BEFORE deleting from auth
    // Must delete in correct order to respect foreign key constraints
    // Using admin client, we bypass RLS
    try {
      console.log(`Cleaning up data for user ${userId}...`)
      
      // Delete in correct order (respecting foreign keys)
      // Tasks first (no dependencies)
      const { error: tasksError } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('user_id', userId)
      if (tasksError) console.warn('Tasks cleanup warning:', tasksError.message)
      
      // Contributions
      const { error: contributionsError } = await supabaseAdmin
        .from('contributions')
        .delete()
        .eq('user_id', userId)
      if (contributionsError) console.warn('Contributions cleanup warning:', contributionsError.message)
      
      // Emne memberships
      const { error: membersError } = await supabaseAdmin
        .from('emne_members')
        .delete()
        .eq('user_id', userId)
      if (membersError) console.warn('Members cleanup warning:', membersError.message)
      
      // Emner created by user (will cascade delete related data via ON DELETE CASCADE)
      const { error: emnerError } = await supabaseAdmin
        .from('emne')
        .delete()
        .eq('created_by', userId)
      if (emnerError) console.warn('Emner cleanup warning:', emnerError.message)
      
      // Legacy tables (might not exist)
      try {
        await supabaseAdmin.from('notes').delete().eq('user_id', userId)
      } catch {
        // Table might not exist, ignore
      }
      
      try {
        await supabaseAdmin.from('todos').delete().eq('user_id', userId)
      } catch {
        // Table might not exist, ignore
      }
      
      // Profiles will be handled by CASCADE, but delete explicitly to be sure
      try {
        await supabaseAdmin.from('profiles').delete().eq('id', userId)
      } catch {
        // Might already be deleted by CASCADE
      }
      
      console.log(`Data cleanup completed for user ${userId}`)
    } catch (cleanupErr: any) {
      console.error('Data cleanup error (non-fatal, continuing):', cleanupErr.message)
      // Continue with user deletion even if cleanup has errors
      // Foreign key CASCADE should handle it anyway
    }

    // STEP 2: Delete the user from Auth using admin API
    console.log(`Deleting user ${userId} from Auth...`)
    const { data, error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Delete user failed:', {
        status: deleteUserError.status,
        message: deleteUserError.message,
        code: (deleteUserError as any).code,
        details: JSON.stringify(deleteUserError, null, 2)
      })
      
      // Provide more helpful error messages
      let errorMessage = deleteUserError.message || 'Unknown error'
      if (errorMessage.includes('not found')) {
        errorMessage = 'User not found'
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorMessage = 'Permission denied. Please check that SUPABASE_SERVICE_ROLE_KEY is correctly configured.'
      } else if (errorMessage.includes('unexpected_failure')) {
        errorMessage = 'User deletion failed. This may be due to remaining database constraints. Check logs for details.'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? deleteUserError.message : undefined
        },
        { status: deleteUserError.status || 500 }
      )
    }

    console.log(`User ${userId} deleted successfully`)

    return NextResponse.json({ 
      message: 'User deleted successfully',
      data 
    })
  } catch (error: any) {
    console.error('Unexpected error in user deletion:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while deleting user' },
      { status: 500 }
    )
  }
}
