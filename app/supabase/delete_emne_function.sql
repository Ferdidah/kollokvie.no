-- Function to safely delete an emne and all related data
-- Only the creator of the emne can delete it
-- This function uses SECURITY DEFINER to bypass RLS for proper cleanup

CREATE OR REPLACE FUNCTION delete_emne(p_emne_id UUID)
RETURNS VOID AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to delete emne';
    END IF;
    
    -- Check if user is the creator of the emne
    IF NOT EXISTS (
        SELECT 1 FROM public.emne 
        WHERE id = p_emne_id AND created_by = current_user_id
    ) THEN
        RAISE EXCEPTION 'Only the creator of the emne can delete it';
    END IF;
    
    -- Delete the emne (this will cascade delete all related data due to CASCADE constraints)
    -- The CASCADE will automatically delete:
    -- - emne_members
    -- - meetings (and their agenda_items)
    -- - tasks
    -- - contributions
    -- - master_documents
    -- - progress_goals
    DELETE FROM public.emne WHERE id = p_emne_id;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_emne(UUID) TO authenticated;

-- =====================================================
-- Add DELETE policy for emne
-- =====================================================

-- Only the creator can delete their emne
CREATE POLICY "Users can delete emne they created" ON public.emne
    FOR DELETE USING (created_by = auth.uid());

