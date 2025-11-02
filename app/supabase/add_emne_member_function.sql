-- Add Member to Emne Function
-- This function securely adds a user to an emne by email
-- Only emne creators or admins can add members

CREATE OR REPLACE FUNCTION public.add_emne_member(
    p_emne_id UUID,
    p_user_email TEXT,
    p_role TEXT DEFAULT 'member'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to access auth.users
AS $$
DECLARE
    current_user_id UUID := auth.uid();
    target_user_id UUID;
    emne_creator_id UUID;
    current_user_role TEXT;
    new_membership_id UUID;
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to add members';
    END IF;

    -- Validate role
    IF p_role NOT IN ('admin', 'member', 'leader') THEN
        RAISE EXCEPTION 'Invalid role. Must be admin, member, or leader';
    END IF;

    -- Get emne creator
    SELECT created_by INTO emne_creator_id
    FROM public.emne
    WHERE id = p_emne_id;

    IF emne_creator_id IS NULL THEN
        RAISE EXCEPTION 'Emne not found';
    END IF;

    -- Check if current user is creator or admin
    SELECT role INTO current_user_role
    FROM public.emne_members
    WHERE emne_id = p_emne_id AND user_id = current_user_id;

    IF current_user_role IS NULL AND emne_creator_id != current_user_id THEN
        RAISE EXCEPTION 'Only emne creators or admins can add members';
    END IF;

    IF current_user_role IS NOT NULL AND current_user_role != 'admin' AND emne_creator_id != current_user_id THEN
        RAISE EXCEPTION 'Only emne creators or admins can add members';
    END IF;

    -- Find user by email in auth.users (requires SECURITY DEFINER)
    -- Note: This is a simplified approach. In production, you might want to use
    -- Supabase Admin API on the client side for better security
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = LOWER(TRIM(p_user_email))
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', p_user_email;
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM public.emne_members
        WHERE emne_id = p_emne_id AND user_id = target_user_id
    ) THEN
        RAISE EXCEPTION 'User is already a member of this emne';
    END IF;

    -- Add member
    INSERT INTO public.emne_members (emne_id, user_id, role)
    VALUES (p_emne_id, target_user_id, p_role)
    RETURNING id INTO new_membership_id;

    RETURN new_membership_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.add_emne_member(UUID, TEXT, TEXT) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.add_emne_member(UUID, TEXT, TEXT) IS 'Adds a user to an emne by email. Only emne creators or admins can add members.';
