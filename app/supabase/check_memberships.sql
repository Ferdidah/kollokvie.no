-- Check if memberships were created properly for the test emne
-- This will help us understand if the membership creation is working

-- =====================================================
-- STEP 1: Check all emne and their memberships
-- =====================================================

SELECT 'All Emne with Memberships' as test_name;
SELECT 
    e.id as emne_id,
    e.title,
    e.code,
    e.created_by,
    em.user_id,
    em.role,
    u.email as user_email
FROM public.emne e
LEFT JOIN public.emne_members em ON e.id = em.emne_id
LEFT JOIN auth.users u ON em.user_id = u.id
ORDER BY e.created_at DESC;

-- =====================================================
-- STEP 2: Check specifically the test emne
-- =====================================================

SELECT 'Test Emne Details' as test_name;
SELECT 
    e.id,
    e.title,
    e.code,
    e.created_by,
    e.created_at
FROM public.emne e
WHERE e.title = 'Test Emne for Debugging';

-- =====================================================
-- STEP 3: Check membership for test emne
-- =====================================================

SELECT 'Test Emne Membership' as test_name;
SELECT 
    em.emne_id,
    em.user_id,
    em.role,
    em.joined_at,
    u.email
FROM public.emne_members em
JOIN public.emne e ON em.emne_id = e.id
JOIN auth.users u ON em.user_id = u.id
WHERE e.title = 'Test Emne for Debugging';

-- =====================================================
-- STEP 4: Check if there are any RLS policy issues
-- =====================================================

SELECT 'RLS Policies Check' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('emne', 'emne_members')
ORDER BY tablename, policyname;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Membership check completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Look for:';
    RAISE NOTICE '1. If the test emne has a membership record';
    RAISE NOTICE '2. If the user_id matches the created_by field';
    RAISE NOTICE '3. If the role is set to "admin"';
    RAISE NOTICE '';
    RAISE NOTICE 'If membership is missing, the function may not be working correctly.';
END $$;

