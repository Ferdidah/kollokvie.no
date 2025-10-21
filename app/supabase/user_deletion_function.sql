-- User Account Deletion Function
-- This function safely deletes a user account and all associated data

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to delete user data
AS $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to delete account';
    END IF;

    -- Delete user's tasks
    DELETE FROM public.tasks WHERE user_id = current_user_id;
    
    -- Delete user's contributions
    DELETE FROM public.contributions WHERE user_id = current_user_id;
    
    -- Delete user's emne memberships
    DELETE FROM public.emne_members WHERE user_id = current_user_id;
    
    -- Delete emnes created by the user (this will cascade delete related data)
    DELETE FROM public.emne WHERE created_by = current_user_id;
    
    -- Delete user's notes (legacy table)
    DELETE FROM public.notes WHERE user_id = current_user_id;
    
    -- Delete user's todos (legacy table)
    DELETE FROM public.todos WHERE user_id = current_user_id;

    -- Note: The actual auth.users record will be deleted by Supabase Auth
    -- when the user signs out after this function completes
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.delete_user_account() IS 'Safely deletes a user account and all associated data. Must be called by the authenticated user.';
