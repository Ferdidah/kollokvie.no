-- Get Member Emails Function
-- This function returns member information including emails for an emne
-- Only accessible by emne members

-- Drop the existing function first (in case return type changed)
DROP FUNCTION IF EXISTS public.get_emne_member_emails(UUID);

CREATE OR REPLACE FUNCTION public.get_emne_member_emails(p_emne_id UUID)
RETURNS TABLE (
    member_id UUID,
    member_user_id UUID,
    member_email TEXT,
    member_role TEXT,
    member_joined_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to access auth.users
AS $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated';
    END IF;

    -- Check if user is a member of this emne
    IF NOT EXISTS (
        SELECT 1 FROM public.emne_members
        WHERE emne_id = p_emne_id AND user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'User is not a member of this emne';
    END IF;

    -- Return members with emails
    -- Use different column names in RETURNS TABLE to avoid ambiguity
    RETURN QUERY
    SELECT 
        em.id AS member_id,
        em.user_id AS member_user_id,
        u.email::TEXT AS member_email,
        em.role::TEXT AS member_role,
        em.joined_at AS member_joined_at
    FROM public.emne_members em
    JOIN auth.users u ON em.user_id = u.id
    WHERE em.emne_id = p_emne_id
    ORDER BY em.joined_at ASC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_emne_member_emails(UUID) TO authenticated;

-- Add a comment explaining the function
COMMENT ON FUNCTION public.get_emne_member_emails(UUID) IS 'Returns member information including emails for an emne. Only accessible by emne members.';
