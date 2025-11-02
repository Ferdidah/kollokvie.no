-- Fix RLS Policy for emne_members with NO RECURSION
-- Uses a SECURITY DEFINER function to check membership without triggering RLS

-- =====================================================
-- STEP 1: Create a helper function that bypasses RLS
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.user_is_emne_member(UUID, UUID);

-- Create a function that checks membership without triggering RLS recursion
-- SECURITY DEFINER allows it to bypass RLS when checking
CREATE OR REPLACE FUNCTION public.user_is_emne_member(
    p_user_id UUID,
    p_emne_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.emne_members
        WHERE user_id = p_user_id
        AND emne_id = p_emne_id
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_is_emne_member(UUID, UUID) TO authenticated;

-- =====================================================
-- STEP 2: Drop old policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can view emne members of emne they belong to" ON public.emne_members;

-- =====================================================
-- STEP 3: Create new policy using the helper function
-- =====================================================

CREATE POLICY "Users can view emne members" ON public.emne_members
    FOR SELECT USING (
        -- Users can always see their own memberships
        user_id = auth.uid()
        OR
        -- Users can see all members of emner they created
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Users can see all members of emner they belong to
        -- Use the SECURITY DEFINER function to avoid recursion
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Fixed emne_members RLS policy with NO RECURSION';
    RAISE NOTICE '✅ Created helper function: user_is_emne_member';
    RAISE NOTICE '✅ Policy now uses SECURITY DEFINER function to avoid recursion';
END $$;

