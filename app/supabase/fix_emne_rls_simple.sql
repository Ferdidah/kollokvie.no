-- Simple fix for emne RLS policies - handles existing policies
-- This will drop and recreate policies to eliminate recursion

-- =====================================================
-- STEP 1: Drop ALL existing emne policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can create emne" ON public.emne;
DROP POLICY IF EXISTS "Users can update emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can view emne they created or are members of" ON public.emne;

-- =====================================================
-- STEP 2: Create simple, non-recursive emne policies
-- =====================================================

-- Simple policy: Users can view emne they created
CREATE POLICY "Users can view emne they created" ON public.emne
    FOR SELECT USING (created_by = auth.uid());

-- Simple policy: Users can create emne
CREATE POLICY "Users can create emne" ON public.emne
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Simple policy: Users can update emne they created
CREATE POLICY "Users can update emne they created" ON public.emne
    FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Emne RLS policies fixed!';
    RAISE NOTICE '🔧 Eliminated infinite recursion';
    RAISE NOTICE '🚀 Policies now only check ownership, not membership';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now create new emner without recursion errors!';
END $$;
