-- Migration: Migrate existing data to new emne-based structure
-- This migration helps transition from individual notes/todos to emne-based structure

-- Create a default "Personal" emne for existing users
INSERT INTO public.emne (title, description, created_by)
SELECT 
    'Personlige Notater og Todos',
    'Dine eksisterende notater og todos er flyttet hit',
    id
FROM auth.users
WHERE id NOT IN (
    SELECT DISTINCT created_by FROM public.emne
);

-- Add users as members of their personal emne
INSERT INTO public.emne_members (emne_id, user_id, role)
SELECT 
    e.id,
    e.created_by,
    'admin'
FROM public.emne e
WHERE e.title = 'Personlige Notater og Todos'
AND e.created_by NOT IN (
    SELECT user_id FROM public.emne_members WHERE emne_id = e.id
);

-- Migrate existing notes to contributions
INSERT INTO public.contributions (emne_id, user_id, title, content, type, created_at, updated_at)
SELECT 
    e.id as emne_id,
    n.user_id,
    n.title,
    COALESCE(n.content, '') as content,
    'note' as type,
    n.created_at,
    n.updated_at
FROM public.notes n
JOIN public.emne e ON e.created_by = n.user_id AND e.title = 'Personlige Notater og Todos'
WHERE n.id NOT IN (
    SELECT id FROM public.contributions WHERE type = 'note'
);

-- Migrate existing todos to tasks
INSERT INTO public.tasks (emne_id, user_id, title, description, status, due_date, created_at, updated_at)
SELECT 
    e.id as emne_id,
    t.user_id,
    t.title,
    t.description,
    CASE 
        WHEN t.completed THEN 'completed'
        ELSE 'todo'
    END as status,
    t.due_date,
    t.created_at,
    t.updated_at
FROM public.todos t
JOIN public.emne e ON e.created_by = t.user_id AND e.title = 'Personlige Notater og Todos'
WHERE t.id NOT IN (
    SELECT id FROM public.tasks WHERE emne_id = e.id
);

-- Create a function to help with data migration
CREATE OR REPLACE FUNCTION migrate_user_data(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    personal_emne_id UUID;
    notes_count INTEGER;
    todos_count INTEGER;
BEGIN
    -- Get or create personal emne
    SELECT id INTO personal_emne_id
    FROM public.emne 
    WHERE created_by = user_uuid AND title = 'Personlige Notater og Todos';
    
    IF personal_emne_id IS NULL THEN
        INSERT INTO public.emne (title, description, created_by)
        VALUES ('Personlige Notater og Todos', 'Dine eksisterende notater og todos', user_uuid)
        RETURNING id INTO personal_emne_id;
        
        INSERT INTO public.emne_members (emne_id, user_id, role)
        VALUES (personal_emne_id, user_uuid, 'admin');
    END IF;
    
    -- Migrate notes
    INSERT INTO public.contributions (emne_id, user_id, title, content, type, created_at, updated_at)
    SELECT 
        personal_emne_id,
        user_id,
        title,
        COALESCE(content, ''),
        'note',
        created_at,
        updated_at
    FROM public.notes 
    WHERE user_id = user_uuid
    AND id NOT IN (
        SELECT id FROM public.contributions 
        WHERE emne_id = personal_emne_id AND user_id = user_uuid
    );
    
    GET DIAGNOSTICS notes_count = ROW_COUNT;
    
    -- Migrate todos
    INSERT INTO public.tasks (emne_id, user_id, title, description, status, due_date, created_at, updated_at)
    SELECT 
        personal_emne_id,
        user_id,
        title,
        description,
        CASE WHEN completed THEN 'completed' ELSE 'todo' END,
        due_date,
        created_at,
        updated_at
    FROM public.todos 
    WHERE user_id = user_uuid
    AND id NOT IN (
        SELECT id FROM public.tasks 
        WHERE emne_id = personal_emne_id AND user_id = user_uuid
    );
    
    GET DIAGNOSTICS todos_count = ROW_COUNT;
    
    RETURN format('Migrated %s notes and %s todos for user %s', notes_count, todos_count, user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for easy access to user's personal emne
CREATE OR REPLACE VIEW public.user_personal_emne AS
SELECT 
    e.*,
    em.role,
    em.joined_at
FROM public.emne e
JOIN public.emne_members em ON e.id = em.emne_id
WHERE e.title = 'Personlige Notater og Todos'
AND em.user_id = auth.uid();

-- Grant permissions on the view
GRANT SELECT ON public.user_personal_emne TO authenticated;

-- Create helper functions for common queries
CREATE OR REPLACE FUNCTION get_user_emner(user_uuid UUID)
RETURNS TABLE (
    emne_id UUID,
    title TEXT,
    code TEXT,
    description TEXT,
    semester TEXT,
    role TEXT,
    member_count BIGINT,
    next_meeting_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.code,
        e.description,
        e.semester,
        em.role,
        (SELECT COUNT(*) FROM public.emne_members WHERE emne_id = e.id) as member_count,
        (SELECT MIN(scheduled_at) FROM public.meetings 
         WHERE emne_id = e.id AND status = 'scheduled' AND scheduled_at > NOW()) as next_meeting_date
    FROM public.emne e
    JOIN public.emne_members em ON e.id = em.emne_id
    WHERE em.user_id = user_uuid
    ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get emne statistics
CREATE OR REPLACE FUNCTION get_emne_stats(emne_uuid UUID)
RETURNS TABLE (
    total_members BIGINT,
    total_meetings BIGINT,
    total_contributions BIGINT,
    total_tasks BIGINT,
    completed_tasks BIGINT,
    total_master_docs BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.emne_members WHERE emne_id = emne_uuid) as total_members,
        (SELECT COUNT(*) FROM public.meetings WHERE emne_id = emne_uuid) as total_meetings,
        (SELECT COUNT(*) FROM public.contributions WHERE emne_id = emne_uuid) as total_contributions,
        (SELECT COUNT(*) FROM public.tasks WHERE emne_id = emne_uuid) as total_tasks,
        (SELECT COUNT(*) FROM public.tasks WHERE emne_id = emne_uuid AND status = 'completed') as completed_tasks,
        (SELECT COUNT(*) FROM public.master_documents WHERE emne_id = emne_uuid) as total_master_docs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION migrate_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_emner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emne_stats(UUID) TO authenticated;

