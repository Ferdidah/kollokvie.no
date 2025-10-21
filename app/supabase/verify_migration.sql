-- Verification script for Kollokvie.no database migration
-- Run this after the migration to verify everything is working correctly

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. Check if all tables were created
SELECT 'Table Creation Check' as test_name;
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals')
ORDER BY table_name;

-- 2. Check if indexes were created
SELECT 'Index Creation Check' as test_name;
SELECT 
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_%' 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 3. Check if RLS is enabled
SELECT 'RLS Check' as test_name;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals')
ORDER BY tablename;

-- 4. Check if policies were created
SELECT 'Policy Check' as test_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals')
ORDER BY tablename, policyname;

-- 5. Check data migration
SELECT 'Data Migration Check' as test_name;
SELECT 
    'Notes Migration' as migration_type,
    (SELECT COUNT(*) FROM public.notes) as original_count,
    (SELECT COUNT(*) FROM public.contributions WHERE type = 'note') as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.notes) = (SELECT COUNT(*) FROM public.contributions WHERE type = 'note')
        THEN '✅ SUCCESS'
        ELSE '⚠️ MISMATCH'
    END as status
UNION ALL
SELECT 
    'Todos Migration' as migration_type,
    (SELECT COUNT(*) FROM public.todos) as original_count,
    (SELECT COUNT(*) FROM public.tasks) as migrated_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM public.todos) = (SELECT COUNT(*) FROM public.tasks)
        THEN '✅ SUCCESS'
        ELSE '⚠️ MISMATCH'
    END as status;

-- 6. Check if personal emne were created
SELECT 'Personal Emne Check' as test_name;
SELECT 
    COUNT(*) as personal_emne_count,
    COUNT(DISTINCT created_by) as unique_users_with_personal_emne
FROM public.emne 
WHERE title = 'Personlige Notater og Todos';

-- 7. Check if users are members of their personal emne
SELECT 'Membership Check' as test_name;
SELECT 
    COUNT(*) as total_memberships,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_memberships
FROM public.emne_members em
JOIN public.emne e ON em.emne_id = e.id
WHERE e.title = 'Personlige Notater og Todos';

-- 8. Test helper functions
SELECT 'Helper Functions Check' as test_name;
SELECT 
    'get_user_emner' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_emner')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
UNION ALL
SELECT 
    'get_emne_stats' as function_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_emne_stats')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status;

-- 9. Check triggers
SELECT 'Trigger Check' as test_name;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- 10. Final summary
SELECT 'Migration Summary' as test_name;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals')) as tables_created,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as indexes_created,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as policies_created,
    (SELECT COUNT(*) FROM public.emne) as emne_created,
    (SELECT COUNT(*) FROM public.emne_members) as memberships_created,
    (SELECT COUNT(*) FROM public.contributions) as contributions_created,
    (SELECT COUNT(*) FROM public.tasks) as tasks_created;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 MIGRATION VERIFICATION COMPLETE!';
    RAISE NOTICE '';
    RAISE NOTICE 'If all checks show ✅ SUCCESS, your migration was successful!';
    RAISE NOTICE 'If you see ⚠️ MISMATCH or ❌ MISSING, please check the migration logs.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the application with the new structure';
    RAISE NOTICE '2. Create your first emne (subject)';
    RAISE NOTICE '3. Invite team members to test collaboration';
    RAISE NOTICE '4. Set up AI integration for document generation';
    RAISE NOTICE '';
END $$;

