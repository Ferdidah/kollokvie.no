-- Fix RLS Policy for viewing emne members with NO RECURSION
-- Uses a SECURITY DEFINER function to check membership without triggering RLS
-- Run this in Supabase SQL Editor

-- IMPORTANT: This fixes infinite recursion by using a helper function

-- =====================================================
-- STEP 1: Create helper function
-- =====================================================

DROP FUNCTION IF EXISTS public.user_is_emne_member(UUID, UUID);

CREATE OR REPLACE FUNCTION public.user_is_emne_member(
    p_user_id UUID,
    p_emne_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to avoid recursion
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

GRANT EXECUTE ON FUNCTION public.user_is_emne_member(UUID, UUID) TO authenticated;

-- =====================================================
-- STEP 2: Drop old policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can view emne members of emne they belong to" ON public.emne_members;

-- =====================================================
-- STEP 3: Create new policy using helper function
-- =====================================================

CREATE POLICY "Users can view emne members" ON public.emne_members
    FOR SELECT USING (
        -- Users can always see their own memberships (needed for dashboard queries)
        user_id = auth.uid()
        OR
        -- Users can see all members of emner they created
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Users can see all members of emner they belong to
        -- Use SECURITY DEFINER function to avoid recursion
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

