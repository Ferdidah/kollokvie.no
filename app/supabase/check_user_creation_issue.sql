-- Check for issues when creating users in Supabase
-- Run this in Supabase SQL Editor to diagnose the problem

-- 1. Check if there are any triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- 2. Check if profiles table exists and its structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if there are any functions that might be called on user creation
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
    routine_definition LIKE '%auth.users%'
    OR routine_definition LIKE '%INSERT INTO auth%'
    OR routine_definition LIKE '%ON INSERT%'
)
ORDER BY routine_name;

-- 4. Check RLS policies that might affect user creation
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'auth'
AND tablename = 'users';

