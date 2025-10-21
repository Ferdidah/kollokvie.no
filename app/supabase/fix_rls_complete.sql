-- Complete RLS fix for Kollokvie.no
-- This will fix all RLS recursion issues

-- =====================================================
-- STEP 1: Drop ALL existing policies
-- =====================================================

-- Drop emne policies
DROP POLICY IF EXISTS "Users can view emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can create emne" ON public.emne;
DROP POLICY IF EXISTS "Users can update emne they created" ON public.emne;
DROP POLICY IF EXISTS "Users can view emne they created or are members of" ON public.emne;

-- Drop emne_members policies
DROP POLICY IF EXISTS "Users can view emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can create emne members" ON public.emne_members;
DROP POLICY IF EXISTS "Users can update emne members" ON public.emne_members;

-- Drop other table policies
DROP POLICY IF EXISTS "Users can view meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings" ON public.meetings;

DROP POLICY IF EXISTS "Users can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;

DROP POLICY IF EXISTS "Users can view contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can create contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can update contributions" ON public.contributions;

DROP POLICY IF EXISTS "Users can view master documents" ON public.master_documents;
DROP POLICY IF EXISTS "Users can create master documents" ON public.master_documents;

DROP POLICY IF EXISTS "Users can view progress goals" ON public.progress_goals;
DROP POLICY IF EXISTS "Users can manage progress goals" ON public.progress_goals;

-- =====================================================
-- STEP 2: Create simple, non-recursive policies
-- =====================================================

-- Emne policies (only check ownership)
CREATE POLICY "Users can view emne they created" ON public.emne
    FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create emne" ON public.emne
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update emne they created" ON public.emne
    FOR UPDATE USING (created_by = auth.uid());

-- Emne members policies (simple ownership check)
CREATE POLICY "Users can view emne members" ON public.emne_members
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create emne members" ON public.emne_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update emne members" ON public.emne_members
    FOR UPDATE USING (user_id = auth.uid());

-- Meeting policies (check emne ownership)
CREATE POLICY "Users can view meetings" ON public.meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create meetings" ON public.meetings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update meetings" ON public.meetings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

-- Task policies (check emne ownership)
CREATE POLICY "Users can view tasks" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks" ON public.tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

-- Contribution policies (check emne ownership)
CREATE POLICY "Users can view contributions" ON public.contributions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create contributions" ON public.contributions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update contributions" ON public.contributions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

-- Master document policies (check emne ownership)
CREATE POLICY "Users can view master documents" ON public.master_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can create master documents" ON public.master_documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

-- Progress goal policies (check emne ownership)
CREATE POLICY "Users can view progress goals" ON public.progress_goals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

CREATE POLICY "Users can manage progress goals" ON public.progress_goals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.emne 
            WHERE id = emne_id AND created_by = auth.uid()
        )
    );

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Complete RLS fix applied!';
    RAISE NOTICE '🔧 All policies now use simple ownership checks';
    RAISE NOTICE '🚀 No more infinite recursion';
    RAISE NOTICE '';
    RAISE NOTICE 'You should now be able to access all your emner!';
END $$;
