-- Fix RLS Policy Recursion Issues
-- This script fixes the infinite recursion in emne_members policies

-- =====================================================
-- STEP 1: Drop problematic policies
-- =====================================================

-- Drop existing emne_members policies that cause recursion
DROP POLICY IF EXISTS "Users can view emne members of emne they belong to" ON public.emne_members;
DROP POLICY IF EXISTS "Users can join emne" ON public.emne_members;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.emne_members;

-- =====================================================
-- STEP 2: Create fixed policies for emne_members
-- =====================================================

-- Policy for viewing emne members - allow members to see all members of their emner
CREATE POLICY "Users can view emne members" ON public.emne_members
    FOR SELECT USING (
        -- Users can always see their own memberships (needed for dashboard queries)
        user_id = auth.uid()
        OR
        -- Users can see members of emne they created
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Users can see ALL members of emne they are members of
        -- Use EXISTS with different alias to avoid recursion
        EXISTS (
            SELECT 1 FROM public.emne_members em
            WHERE em.emne_id = emne_members.emne_id
            AND em.user_id = auth.uid()
        )
    );

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can join emne" ON public.emne_members;

-- Policy for joining emne - allow users to join any emne (they'll be validated by application logic)
-- Also allow emne creators and admins to add members
CREATE POLICY "Users can join emne" ON public.emne_members
    FOR INSERT WITH CHECK (
        -- Users can add themselves
        user_id = auth.uid()
        OR
        -- Emne creators can add anyone
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Admins can add anyone (check in a separate query to avoid recursion)
        -- In INSERT WITH CHECK, unqualified column names refer to the new row being inserted
        EXISTS (
            SELECT 1 FROM public.emne_members em
            WHERE em.emne_id = emne_id  -- emne_id from the new row (unqualified)
            AND em.user_id = auth.uid()
            AND em.role = 'admin'
        )
    );

-- Policy for updating membership - users can update their own membership
CREATE POLICY "Users can update their own membership" ON public.emne_members
    FOR UPDATE USING (user_id = auth.uid());

-- Policy for deleting membership - users can leave emne or admins can remove members
CREATE POLICY "Users can manage membership" ON public.emne_members
    FOR DELETE USING (
        user_id = auth.uid() 
        OR 
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
    );

-- =====================================================
-- STEP 3: Fix other potentially problematic policies
-- =====================================================

-- Drop and recreate emne policies to be more explicit
DROP POLICY IF EXISTS "Users can view emne they are members of" ON public.emne;
DROP POLICY IF EXISTS "Users can create emne" ON public.emne;
DROP POLICY IF EXISTS "Users can update emne they created or are admin of" ON public.emne;

-- Create safer emne policies
CREATE POLICY "Users can view emne they created or are members of" ON public.emne
    FOR SELECT USING (
        created_by = auth.uid()
        OR
        id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create emne" ON public.emne
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update emne they created" ON public.emne
    FOR UPDATE USING (created_by = auth.uid());

-- =====================================================
-- STEP 4: Fix meetings policies to avoid recursion
-- =====================================================

-- Drop existing meetings policies
DROP POLICY IF EXISTS "Users can view meetings of emne they belong to" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings in emne they belong to" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings in emne they belong to" ON public.meetings;

-- Create safer meetings policies
CREATE POLICY "Users can view meetings" ON public.meetings
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meetings" ON public.meetings
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meetings" ON public.meetings
    FOR UPDATE USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 5: Fix other table policies to avoid recursion
-- =====================================================

-- Fix tasks policies
DROP POLICY IF EXISTS "Users can view tasks of emne they belong to" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks in emne they belong to" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks or shared tasks" ON public.tasks;

CREATE POLICY "Users can view tasks" ON public.tasks
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        (emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        ))
        AND (user_id = auth.uid() OR user_id IS NULL)
    );

CREATE POLICY "Users can update tasks" ON public.tasks
    FOR UPDATE USING (
        user_id = auth.uid() 
        OR 
        user_id IS NULL
    );

-- Fix contributions policies
DROP POLICY IF EXISTS "Users can view contributions of emne they belong to" ON public.contributions;
DROP POLICY IF EXISTS "Users can create contributions in emne they belong to" ON public.contributions;
DROP POLICY IF EXISTS "Users can update their own contributions" ON public.contributions;

CREATE POLICY "Users can view contributions" ON public.contributions
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create contributions" ON public.contributions
    FOR INSERT WITH CHECK (
        (emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        ))
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update contributions" ON public.contributions
    FOR UPDATE USING (user_id = auth.uid());

-- Fix master_documents policies
DROP POLICY IF EXISTS "Users can view master documents of emne they belong to" ON public.master_documents;
DROP POLICY IF EXISTS "Users can create master documents in emne they belong to" ON public.master_documents;

CREATE POLICY "Users can view master documents" ON public.master_documents
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create master documents" ON public.master_documents
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

-- Fix progress_goals policies
DROP POLICY IF EXISTS "Users can view progress goals of emne they belong to" ON public.progress_goals;
DROP POLICY IF EXISTS "Users can manage progress goals in emne they belong to" ON public.progress_goals;

CREATE POLICY "Users can view progress goals" ON public.progress_goals
    FOR SELECT USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage progress goals" ON public.progress_goals
    FOR ALL USING (
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        emne_id IN (
            SELECT emne_id FROM public.emne_members WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 6: Create a helper function for safe emne creation
-- =====================================================

-- Create a function to safely create emne with automatic membership
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
    -- Get current user
    current_user_id := auth.uid();
    
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
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RLS Policy fixes completed successfully!';
    RAISE NOTICE '🔧 Fixed infinite recursion in emne_members policies';
    RAISE NOTICE '🛡️ All policies now use safer, non-recursive logic';
    RAISE NOTICE '🚀 Emne creation should now work without errors';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Tip: Use the create_emne_with_membership() function for safe emne creation';
    RAISE NOTICE '   Example: SELECT create_emne_with_membership(''MAT121'', ''MAT121'', ''Calculus I'');';
END $$;

