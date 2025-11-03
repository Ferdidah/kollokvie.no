-- Complete RLS Fix for Members to View Emner They Belong To
-- This ensures members can see emner they were added to
-- Uses SECURITY DEFINER functions to avoid recursion

-- =====================================================
-- STEP 1: Drop ALL policies that depend on the function FIRST
-- =====================================================

-- Drop emne policies
DROP POLICY IF EXISTS "Users can view emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can view emne they are members of" ON public.emne;
DROP POLICY IF EXISTS "Users can view emne they created or are members of" ON public.emne;
DROP POLICY IF EXISTS "Users can create emne" ON public.emne;
DROP POLICY IF EXISTS "Users can update emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can update emne they created or are admin of" ON public.emne;

-- Drop emne_members policies that use the function
DROP POLICY IF EXISTS "Users can view emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can view emne members of emne they belong to" ON public.emne_members;
DROP POLICY IF EXISTS "Users can join emne" ON public.emne_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.emne_members;
DROP POLICY IF EXISTS "Users can create emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can update emne members" ON public.emne_members;

-- Drop meetings policies
DROP POLICY IF EXISTS "Users can view meetings of emne they belong to" ON public.meetings;
DROP POLICY IF EXISTS "Users can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings in emne they belong to" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings in emne they belong to" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings" ON public.meetings;

-- Drop tasks policies
DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks of emne they belong to" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in emne they belong to" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks in emne they belong to" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON public.tasks;

-- Drop contributions policies
DROP POLICY IF EXISTS "Users can view contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can view contributions of emne they belong to" ON public.contributions;
DROP POLICY IF EXISTS "Users can create contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can create contributions in emne they belong to" ON public.contributions;
DROP POLICY IF EXISTS "Users can update contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can update contributions in emne they belong to" ON public.contributions;

-- =====================================================
-- STEP 2: NOW we can safely drop and recreate the function
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
-- STEP 3: Create emne policies (creators AND members can view)
-- =====================================================
-- Note: All policies were dropped in STEP 1, now we create them fresh

-- Users can view emner they created OR are members of
CREATE POLICY "Users can view emne they created or are members of" ON public.emne
    FOR SELECT USING (
        -- Users can view emner they created
        created_by = auth.uid()
        OR
        -- Users can view emner they are members of (using helper function to avoid recursion)
        public.user_is_emne_member(auth.uid(), id) = TRUE
    );

-- Users can create emner
CREATE POLICY "Users can create emne" ON public.emne
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update emner they created or are admin of
CREATE POLICY "Users can update emne they created or are admin of" ON public.emne
    FOR UPDATE USING (
        created_by = auth.uid()
        OR
        (
            public.user_is_emne_member(auth.uid(), id) = TRUE
            AND EXISTS (
                SELECT 1 FROM public.emne_members
                WHERE emne_id = id
                AND user_id = auth.uid()
                AND role = 'admin'
            )
        )
    );

-- =====================================================
-- STEP 4: Fix emne_members policies (policies already dropped in STEP 1)
-- =====================================================

-- Users can view members of emner they created OR belong to
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
        -- Users can see all members of emner they belong to (using helper function)
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Users can be added to emner by creators/admins, or add themselves
CREATE POLICY "Users can join emne" ON public.emne_members
    FOR INSERT WITH CHECK (
        -- Users can add themselves
        user_id = auth.uid()
        OR
        -- Emne creators can add members
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Admins can add members (using helper function)
        (
            public.user_is_emne_member(auth.uid(), emne_id) = TRUE
            AND EXISTS (
                SELECT 1 FROM public.emne_members
                WHERE emne_id = emne_members.emne_id
                AND user_id = auth.uid()
                AND role = 'admin'
            )
        )
    );

-- Users can update their own membership, or admins can update memberships
CREATE POLICY "Users can update emne members" ON public.emne_members
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        (
            public.user_is_emne_member(auth.uid(), emne_id) = TRUE
            AND EXISTS (
                SELECT 1 FROM public.emne_members
                WHERE emne_id = emne_members.emne_id
                AND user_id = auth.uid()
                AND role = 'admin'
            )
        )
    );

-- =====================================================
-- STEP 5: Fix meetings policies (policies already dropped in STEP 1)
-- =====================================================

-- Members can view meetings of emner they belong to
CREATE POLICY "Users can view meetings of emne they belong to" ON public.meetings
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can create meetings in emner they belong to
CREATE POLICY "Users can create meetings in emne they belong to" ON public.meetings
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can update meetings in emner they belong to
CREATE POLICY "Users can update meetings in emne they belong to" ON public.meetings
    FOR UPDATE USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- =====================================================
-- STEP 6: Fix tasks policies (policies already dropped in STEP 1)
-- =====================================================

-- Members can view tasks of emner they belong to
CREATE POLICY "Users can view tasks of emne they belong to" ON public.tasks
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can create tasks in emner they belong to
CREATE POLICY "Users can create tasks in emne they belong to" ON public.tasks
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can update tasks in emner they belong to
CREATE POLICY "Users can update tasks in emne they belong to" ON public.tasks
    FOR UPDATE USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can delete their own tasks or tasks in emner they belong to
CREATE POLICY "Users can delete tasks" ON public.tasks
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- =====================================================
-- STEP 7: Fix contributions policies (policies already dropped in STEP 1)
-- =====================================================

-- Members can view contributions of emner they belong to
CREATE POLICY "Users can view contributions of emne they belong to" ON public.contributions
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can create contributions in emner they belong to
CREATE POLICY "Users can create contributions in emne they belong to" ON public.contributions
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- Members can update their own contributions
CREATE POLICY "Users can update contributions in emne they belong to" ON public.contributions
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        public.user_is_emne_member(auth.uid(), emne_id) = TRUE
    );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Complete RLS fix applied for members!';
    RAISE NOTICE '🔧 Members can now view emner they belong to';
    RAISE NOTICE '🚀 Using SECURITY DEFINER function to avoid recursion';
    RAISE NOTICE '';
    RAISE NOTICE 'All members added to emner should now be able to see them!';
END $$;

