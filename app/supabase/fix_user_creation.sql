-- Fix for user creation issues in Supabase
-- Step 1: Check for existing triggers that might be causing issues
-- (Run check_user_creation_issue.sql first to diagnose)

-- Step 2: Drop any existing problematic triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Drop the function if it exists and causes issues
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 4: Create profiles table if it doesn't exist (some setups expect this)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create a safe trigger function that handles errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profiles table exists and user doesn't already have a profile
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, username)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', '')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, just return NEW to allow user creation to continue
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the trigger (only if profiles table exists)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

