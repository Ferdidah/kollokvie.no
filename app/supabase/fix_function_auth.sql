-- Fix the create_emne_with_membership function to handle authentication properly
-- This addresses the null created_by issue

-- =====================================================
-- STEP 1: Drop and recreate the function with better auth handling
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS create_emne_with_membership(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Create a better version that handles auth properly
CREATE OR REPLACE FUNCTION create_emne_with_membership(
    emne_title TEXT,
    emne_code TEXT DEFAULT NULL,
    emne_description TEXT DEFAULT NULL,
    emne_semester TEXT DEFAULT NULL,
    emne_goals TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_emne_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user - this should work when called from the app
    current_user_id := auth.uid();
    
    -- If no user is authenticated, raise an error
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to create emne';
    END IF;
    
    -- Create the emne
    INSERT INTO public.emne (title, code, description, semester, goals, created_by)
    VALUES (emne_title, emne_code, emne_description, emne_semester, emne_goals, current_user_id)
    RETURNING id INTO new_emne_id;
    
    -- Add creator as admin member
    INSERT INTO public.emne_members (emne_id, user_id, role)
    VALUES (new_emne_id, current_user_id, 'admin');
    
    RETURN new_emne_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_emne_with_membership(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- STEP 2: Create a test function for SQL editor testing
-- =====================================================

-- Create a test version that accepts user_id as parameter (for testing in SQL editor)
CREATE OR REPLACE FUNCTION create_emne_with_membership_test(
    emne_title TEXT,
    emne_code TEXT DEFAULT NULL,
    emne_description TEXT DEFAULT NULL,
    emne_semester TEXT DEFAULT NULL,
    emne_goals TEXT DEFAULT NULL,
    test_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_emne_id UUID;
    current_user_id UUID;
BEGIN
    -- Use provided user_id for testing, or auth.uid() for normal use
    current_user_id := COALESCE(test_user_id, auth.uid());
    
    -- If no user is provided, raise an error
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID must be provided for testing or user must be authenticated';
    END IF;
    
    -- Create the emne
    INSERT INTO public.emne (title, code, description, semester, goals, created_by)
    VALUES (emne_title, emne_code, emne_description, emne_semester, emne_goals, current_user_id)
    RETURNING id INTO new_emne_id;
    
    -- Add creator as admin member
    INSERT INTO public.emne_members (emne_id, user_id, role)
    VALUES (new_emne_id, current_user_id, 'admin');
    
    RETURN new_emne_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_emne_with_membership_test(TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Function authentication fix completed!';
    RAISE NOTICE '🔧 Fixed create_emne_with_membership() to handle auth properly';
    RAISE NOTICE '🧪 Created test version for SQL editor testing';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Usage:';
    RAISE NOTICE '   - From app: create_emne_with_membership(title, code, description, semester, goals)';
    RAISE NOTICE '   - For testing: create_emne_with_membership_test(title, code, description, semester, goals, user_id)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Emne creation should now work from the application!';
END $$;

