-- Migration: Create emne-based tables for Kollokvie.no
-- This migration creates the new domain model tables for the emne-centric platform

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

-- Create indexes for better performance
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.emne ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emne_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

