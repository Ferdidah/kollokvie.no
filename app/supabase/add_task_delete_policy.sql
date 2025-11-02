-- Add DELETE policy for tasks
-- Allows users to delete their own tasks or shared tasks

DROP POLICY IF EXISTS "Users can delete tasks" ON public.tasks;

CREATE POLICY "Users can delete tasks" ON public.tasks
    FOR DELETE USING (
        -- Users can delete their own tasks
        user_id = auth.uid()
        OR
        -- Users can delete shared tasks (user_id IS NULL)
        user_id IS NULL
    );

COMMENT ON POLICY "Users can delete tasks" ON public.tasks IS 
    'Allows users to delete their own tasks or shared tasks (where user_id is NULL)';

