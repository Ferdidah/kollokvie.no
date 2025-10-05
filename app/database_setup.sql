-- Kollokvie.no MVP Database Setup
-- Kjør disse kommandoene i Supabase SQL Editor

-- 1. Grupper tabellen
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  description TEXT,
  invite_code VARCHAR(8) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Gruppe-medlemskap
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'member', -- 'member', 'leader'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 3. Kollokv-sykluser  
CREATE TABLE IF NOT EXISTS kollokv_cycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  topic VARCHAR NOT NULL,
  meeting_date TIMESTAMPTZ,
  leader_id UUID REFERENCES auth.users(id),
  status VARCHAR DEFAULT 'planning', -- 'planning', 'preparation', 'meeting', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Fokusområde-tildeling
CREATE TABLE IF NOT EXISTS focus_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID REFERENCES kollokv_cycles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_area VARCHAR NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bidrag/Notater (for senere)
CREATE TABLE IF NOT EXISTS contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES focus_assignments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  questions TEXT,
  key_points TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kollokv_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can create groups" ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group members can view their groups" ON groups FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group creators can update their groups" ON groups FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for group_members
CREATE POLICY "Users can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view group memberships" ON group_members FOR SELECT USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM group_members gm2 
    WHERE gm2.group_id = group_members.group_id 
    AND gm2.user_id = auth.uid()
  )
);

-- RLS Policies for kollokv_cycles
CREATE POLICY "Group members can manage cycles" ON kollokv_cycles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = kollokv_cycles.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- RLS Policies for focus_assignments
CREATE POLICY "Group members can manage assignments" ON focus_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM kollokv_cycles 
    JOIN group_members ON group_members.group_id = kollokv_cycles.group_id
    WHERE kollokv_cycles.id = focus_assignments.cycle_id 
    AND group_members.user_id = auth.uid()
  )
);

-- RLS Policies for contributions  
CREATE POLICY "Users can manage their contributions" ON contributions FOR ALL USING (auth.uid() = user_id);

-- Function to generate random invite codes
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS VARCHAR(8) AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite codes
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER groups_invite_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW EXECUTE FUNCTION set_invite_code();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER groups_updated_at_trigger
  BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER kollokv_cycles_updated_at_trigger
  BEFORE UPDATE ON kollokv_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contributions_updated_at_trigger
  BEFORE UPDATE ON contributions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

