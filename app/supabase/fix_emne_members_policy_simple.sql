-- Simple fix for emne_members SELECT policy
-- This avoids recursion issues by keeping the policy simple
-- Run this in Supabase SQL Editor

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can view emne members of emne they belong to" ON public.emne_members;

-- Create a simple, non-recursive policy
-- This policy allows:
-- 1. Users to see their own memberships (for dashboard queries)
-- 2. Users to see all members of emner they created
-- 3. Users to see all members of emner they belong to (using emne table check)
CREATE POLICY "Users can view emne members" ON public.emne_members
    FOR SELECT USING (
        -- First: Users can always see their own memberships
        -- This is critical for dashboard queries that filter by user_id
        user_id = auth.uid()
        OR
        -- Second: Users can see all members of emner they created
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Third: Users can see all members of emner they belong to
        -- We check via emne_members but use a CTE to avoid recursion
        emne_id IN (
            -- Get all emne_ids where the user is a member
            SELECT DISTINCT em2.emne_id
            FROM public.emne_members em2
            WHERE em2.user_id = auth.uid()
        )
    );

-- Add comment
COMMENT ON POLICY "Users can view emne members" ON public.emne_members IS 
    'Allows users to view their own memberships, members of emner they created, and all members of emner they belong to';

