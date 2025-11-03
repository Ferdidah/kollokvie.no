-- Robust fix for user creation issues in Supabase
-- This version handles all edge cases and ensures user creation never fails

-- =====================================================
-- STEP 1: Drop any existing problematic triggers/functions
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =====================================================
-- STEP 2: Ensure profiles table exists with correct structure
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Set up RLS policies for profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- STEP 4: Create ultra-safe trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_username TEXT;
BEGIN
    -- Extract username from metadata, with fallbacks
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.email,
        ''
    );
    
    -- Try to insert profile, but don't fail if it already exists or if there's any error
    BEGIN
        INSERT INTO public.profiles (id, username, created_at, updated_at)
        VALUES (
            NEW.id,
            v_username,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log error but don't fail user creation
            -- Use RAISE NOTICE instead of RAISE EXCEPTION to allow user creation to continue
            RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    END;
    
    -- Always return NEW to allow user creation to succeed
    RETURN NEW;
END;
$$;

-- =====================================================
-- STEP 5: Create the trigger
-- =====================================================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ User creation fix applied!';
    RAISE NOTICE '🔧 Trigger created with error handling';
    RAISE NOTICE '🚀 User creation will never fail due to profile issues';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now create users from Supabase UI without errors!';
END $$;

