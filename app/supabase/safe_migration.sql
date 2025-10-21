-- Safe Migration Script for Kollokvie.no
-- This script can be run multiple times safely - it handles existing objects

-- =====================================================
-- STEP 1: Drop existing triggers and functions (if they exist)
-- =====================================================

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_emne_updated_at ON public.emne;
DROP TRIGGER IF EXISTS update_meetings_updated_at ON public.meetings;
DROP TRIGGER IF EXISTS update_agenda_items_updated_at ON public.agenda_items;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_contributions_updated_at ON public.contributions;
DROP TRIGGER IF EXISTS update_master_documents_updated_at ON public.master_documents;
DROP TRIGGER IF EXISTS update_progress_goals_updated_at ON public.progress_goals;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_user_emner(UUID);
DROP FUNCTION IF EXISTS get_emne_stats(UUID);

-- =====================================================
-- STEP 2: Drop existing policies (if they exist)
-- =====================================================

-- Drop all existing policies for our tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: Create tables (with IF NOT EXISTS)
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create emne table (subjects/courses)
CREATE TABLE IF NOT EXISTS public.emne (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT, -- e.g., "MAT121"
    description TEXT,
    semester TEXT, -- e.g., "Høst 2024"
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goals TEXT, -- Group learning goals
    syllabus_url TEXT,
    meeting_schedule TEXT, -- JSON for meeting schedule preferences
    ai_settings TEXT, -- JSON for AI workflow settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create emne_members table (user membership in emne)
CREATE TABLE IF NOT EXISTS public.emne_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'leader')),
    preferences TEXT, -- JSON for user preferences
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE,
    UNIQUE(emne_id, user_id)
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    agenda TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    meeting_leader UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT, -- Meeting notes/summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agenda_items table
CREATE TABLE IF NOT EXISTS public.agenda_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 15,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table (replaces individual todos with emne-based tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for shared tasks
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table (replaces individual notes with emne-based contributions)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES public.meetings(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'question', 'insight', 'summary')),
    tags TEXT, -- JSON array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create master_documents table (AI-generated knowledge base)
CREATE TABLE IF NOT EXISTS public.master_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_prompt TEXT,
    source_contributions TEXT, -- JSON array of contribution IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress_goals table
CREATE TABLE IF NOT EXISTS public.progress_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    emne_id UUID NOT NULL REFERENCES public.emne(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 4: Create indexes (with IF NOT EXISTS)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_emne_created_by ON public.emne(created_by);
CREATE INDEX IF NOT EXISTS idx_emne_members_emne_id ON public.emne_members(emne_id);
CREATE INDEX IF NOT EXISTS idx_emne_members_user_id ON public.emne_members(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_emne_id ON public.meetings(emne_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON public.meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_agenda_items_meeting_id ON public.agenda_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_emne_id ON public.tasks(emne_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_meeting_id ON public.tasks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_contributions_emne_id ON public.contributions(emne_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_meeting_id ON public.contributions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_master_documents_emne_id ON public.master_documents(emne_id);
CREATE INDEX IF NOT EXISTS idx_progress_goals_emne_id ON public.progress_goals(emne_id);

-- =====================================================
-- STEP 5: Create triggers and functions
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_emne_updated_at BEFORE UPDATE ON public.emne FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agenda_items_updated_at BEFORE UPDATE ON public.agenda_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON public.contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_documents_updated_at BEFORE UPDATE ON public.master_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_goals_updated_at BEFORE UPDATE ON public.progress_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.emne ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emne_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_goals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: Create RLS policies
-- =====================================================

-- Emne policies
CREATE POLICY "Users can view emne they are members of" ON public.emne
    FOR SELECT USING (
        id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create emne" ON public.emne
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update emne they created or are admin of" ON public.emne
    FOR UPDATE USING (
        created_by = auth.uid() OR 
        id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Emne members policies
CREATE POLICY "Users can view emne members of emne they belong to" ON public.emne_members
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join emne" ON public.emne_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership" ON public.emne_members
    FOR UPDATE USING (user_id = auth.uid());

-- Meetings policies
CREATE POLICY "Users can view meetings of emne they belong to" ON public.meetings
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create meetings in emne they belong to" ON public.meetings
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meetings in emne they belong to" ON public.meetings
    FOR UPDATE USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

-- Agenda items policies
CREATE POLICY "Users can view agenda items of meetings they have access to" ON public.agenda_items
    FOR SELECT USING (
        meeting_id IN (
            SELECT m.id FROM public.meetings m
            JOIN public.emne_members em ON m.emne_id = em.emne_id
            WHERE em.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage agenda items of meetings they have access to" ON public.agenda_items
    FOR ALL USING (
        meeting_id IN (
            SELECT m.id FROM public.meetings m
            JOIN public.emne_members em ON m.emne_id = em.emne_id
            WHERE em.user_id = auth.uid()
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks of emne they belong to" ON public.tasks
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in emne they belong to" ON public.tasks
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        ) AND (user_id = auth.uid() OR user_id IS NULL)
    );

CREATE POLICY "Users can update their own tasks or shared tasks" ON public.tasks
    FOR UPDATE USING (
        user_id = auth.uid() OR user_id IS NULL
    );

-- Contributions policies
CREATE POLICY "Users can view contributions of emne they belong to" ON public.contributions
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create contributions in emne they belong to" ON public.contributions
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        ) AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own contributions" ON public.contributions
    FOR UPDATE USING (user_id = auth.uid());

-- Master documents policies
CREATE POLICY "Users can view master documents of emne they belong to" ON public.master_documents
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create master documents in emne they belong to" ON public.master_documents
    FOR INSERT WITH CHECK (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

-- Progress goals policies
CREATE POLICY "Users can view progress goals of emne they belong to" ON public.progress_goals
    FOR SELECT USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage progress goals in emne they belong to" ON public.progress_goals
    FOR ALL USING (
        emne_id IN (
            SELECT emne_id FROM public.emne_members 
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 8: Create helper functions and views
-- =====================================================

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
GRANT EXECUTE ON FUNCTION get_user_emner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_emne_stats(UUID) TO authenticated;

-- =====================================================
-- STEP 9: Migrate existing data (safe - only if not already migrated)
-- =====================================================

-- Create a default "Personal" emne for existing users (only if they don't have one)
INSERT INTO public.emne (title, description, created_by)
SELECT 
    'Personlige Notater og Todos',
    'Dine eksisterende notater og todos er flyttet hit',
    id
FROM auth.users
WHERE id NOT IN (
    SELECT DISTINCT created_by FROM public.emne
    WHERE title = 'Personlige Notater og Todos'
);

-- Add users as members of their personal emne (only if not already members)
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

-- Migrate existing notes to contributions (only if not already migrated)
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
WHERE NOT EXISTS (
    SELECT 1 FROM public.contributions c 
    WHERE c.emne_id = e.id 
    AND c.user_id = n.user_id 
    AND c.title = n.title 
    AND c.created_at = n.created_at
);

-- Migrate existing todos to tasks (only if not already migrated)
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
WHERE NOT EXISTS (
    SELECT 1 FROM public.tasks task 
    WHERE task.emne_id = e.id 
    AND task.user_id = t.user_id 
    AND task.title = t.title 
    AND task.created_at = t.created_at
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Kollokvie.no safe migration completed successfully!';
    RAISE NOTICE '📊 All tables, triggers, policies, and functions are now in place';
    RAISE NOTICE '🔒 Row Level Security (RLS) enabled for all tables';
    RAISE NOTICE '📈 Performance indexes created';
    RAISE NOTICE '🔄 Auto-update triggers configured';
    RAISE NOTICE '👥 Existing data safely migrated (if not already done)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your platform is now ready for emne-based collaboration!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run the verification script to confirm everything works';
    RAISE NOTICE '2. Test the application with the new structure';
    RAISE NOTICE '3. Create your first emne (subject) for group collaboration';
END $$;

