-- Verify that members can see their own memberships
-- Run this to check if the RLS policy is working correctly

-- Check if the helper function exists
SELECT 
    'Helper Function Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'user_is_emne_member'
        ) THEN '✅ Function exists'
        ELSE '❌ Function missing - run fix_emne_members_no_recursion.sql'
    END as status;

-- Check if the policy exists
SELECT 
    'RLS Policy Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'emne_members'
            AND policyname = 'Users can view emne members'
        ) THEN '✅ Policy exists'
        ELSE '❌ Policy missing - run fix_emne_members_no_recursion.sql'
    END as status;

-- Show current policy definition
SELECT 
    'Current Policy' as check_type,
    qual::text as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'emne_members'
AND policyname = 'Users can view emne members';

-- Test query: Show all memberships for current user (if logged in)
-- This should show your memberships if RLS is working
SELECT 
    'Your Memberships' as check_type,
    em.emne_id,
    e.title as emne_title,
    em.role,
    em.joined_at
FROM public.emne_members em
JOIN public.emne e ON em.emne_id = e.id
WHERE em.user_id = auth.uid()
ORDER BY em.joined_at DESC;

