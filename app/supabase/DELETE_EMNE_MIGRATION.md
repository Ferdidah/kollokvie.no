# Emne Deletion Migration

This migration adds the ability to safely delete emner (subjects) from the platform.

## Overview

- **Created by:** Handles emne deletion for the creator only
- **Security:** Only the original creator can delete their emne
- **Cascade cleanup:** Automatically deletes all related data (meetings, tasks, contributions, documents)
- **UI:** Integrated into the settings page at `/emner/[emneId]/innstillinger`

## Migration Steps

### 1. Run the SQL Migration

Execute the following SQL in your Supabase SQL editor:

```sql
-- See: app/supabase/delete_emne_function.sql
```

This will:
1. Create the `delete_emne()` function with proper security checks
2. Add a DELETE policy for emne table
3. Grant execution permissions

### 2. Verify Migration

After running the SQL, verify that:

```sql
-- Check function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'delete_emne';

-- Check RLS policy exists
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'emne' 
AND policyname LIKE '%delete%';
```

## How It Works

### Database Function

The `delete_emne(p_emne_id UUID)` function:
- ✅ Checks if user is authenticated
- ✅ Verifies user is the creator of the emne
- ✅ Deletes the emne (CASCADE handles related data)
- ✅ Uses `SECURITY DEFINER` to bypass RLS for proper cleanup

### CASCADE Deletion

When an emne is deleted, the following related data is automatically removed:
- All `emne_members` (all memberships)
- All `meetings` (and their `agenda_items`)
- All `tasks`
- All `contributions`
- All `master_documents`
- All `progress_goals`

This ensures no orphaned data remains.

### User Interface

**Location:** `/emner/[emneId]/innstillinger`

**Component:** `EmneDeletion` (`app/src/components/emner/EmneDeletion.tsx`)

**Features:**
- Only visible to the emne creator
- Two-step confirmation process
- Clear warning about permanent deletion
- Redirects to `/emner` after successful deletion

## Usage

1. Navigate to your emne's settings page
2. Scroll to the "Farlig sone" section (only visible to creator)
3. Click "Slett emne"
4. Review the warning
5. Click "Bekreft sletting" to delete

## Security

- ✅ Only emne creator can delete
- ✅ Requires authentication
- ✅ Proper error handling and user feedback
- ✅ Cannot be undone (as designed)

## Testing

To test the deletion feature:

1. Create a test emne
2. Verify you're the creator
3. Navigate to settings
4. Attempt deletion
5. Confirm successful deletion and redirect

## Rollback

If needed, you can remove the deletion functionality:

```sql
-- Drop the function
DROP FUNCTION IF EXISTS delete_emne(UUID);

-- Drop the policy
DROP POLICY IF EXISTS "Users can delete emne they created" ON public.emne;
```

## Files Changed

1. **Database:** `app/supabase/delete_emne_function.sql` (new)
2. **Component:** `app/src/components/emner/EmneDeletion.tsx` (new)
3. **Page:** `app/src/app/emner/[emneId]/innstillinger/page.tsx` (updated)
4. **Documentation:** `app/supabase/DELETE_EMNE_MIGRATION.md` (this file)

