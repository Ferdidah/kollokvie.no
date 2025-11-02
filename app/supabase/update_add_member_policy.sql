-- Update RLS Policy to Allow Adding Members
-- Run this in Supabase SQL Editor to enable creators and admins to add members

-- Drop existing policy first
DROP POLICY IF EXISTS "Users can join emne" ON public.emne_members;

-- Create updated policy that allows creators and admins to add members
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

