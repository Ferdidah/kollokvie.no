-- Test script to verify emne creation works correctly
-- Run this to check if the function and data are working

-- =====================================================
-- STEP 1: Check if function exists
-- =====================================================

SELECT 'Function Check' as test_name;
SELECT 
    proname as function_name,
    CASE 
        WHEN proname = 'create_emne_with_membership' 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM pg_proc 
WHERE proname = 'create_emne_with_membership';

-- =====================================================
-- STEP 2: Check existing emne and members
-- =====================================================

SELECT 'Existing Data Check' as test_name;
SELECT 
    'emne' as table_name,
    COUNT(*) as count
FROM public.emne
UNION ALL
SELECT 
    'emne_members' as table_name,
    COUNT(*) as count
FROM public.emne_members;

-- =====================================================
-- STEP 3: Check if we have any users
-- =====================================================

SELECT 'Users Check' as test_name;
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- STEP 4: Test emne creation with a specific user (if available)
-- =====================================================

-- Get the first user for testing
DO $$
DECLARE
    test_user_id UUID;
    new_emne_id UUID;
BEGIN
    -- Get a user ID for testing
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing emne creation with user: %', test_user_id;
        
        -- Test the function
        SELECT create_emne_with_membership_test(
            'Test Emne for Debugging',
            'TEST001',
            'This is a test emne to verify the creation process',
            'Høst 2024',
            'Test the emne creation functionality',
            test_user_id
        ) INTO new_emne_id;
        
        RAISE NOTICE '✅ Test emne created successfully with ID: %', new_emne_id;
        
        -- Verify the emne was created
        IF EXISTS (SELECT 1 FROM public.emne WHERE id = new_emne_id) THEN
            RAISE NOTICE '✅ Emne exists in database';
        ELSE
            RAISE NOTICE '❌ Emne not found in database';
        END IF;
        
        -- Verify membership was created
        IF EXISTS (SELECT 1 FROM public.emne_members WHERE emne_id = new_emne_id AND user_id = test_user_id) THEN
            RAISE NOTICE '✅ Membership created successfully';
        ELSE
            RAISE NOTICE '❌ Membership not found';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ No users found for testing';
    END IF;
END $$;

-- =====================================================
-- STEP 5: Show recent emne and memberships
-- =====================================================

SELECT 'Recent Emne' as test_name;
SELECT 
    e.id,
    e.title,
    e.code,
    e.created_by,
    e.created_at,
    em.role,
    u.email
FROM public.emne e
LEFT JOIN public.emne_members em ON e.id = em.emne_id
LEFT JOIN auth.users u ON e.created_by = u.id
ORDER BY e.created_at DESC
LIMIT 5;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Emne creation test completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see ✅ messages above, the function is working correctly.';
    RAISE NOTICE 'If you see ❌ messages, there may be an issue with the setup.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check the browser console for detailed error messages';
    RAISE NOTICE '2. Try creating an emne from the application';
    RAISE NOTICE '3. Check the network tab for any failed requests';
END $$;

