# 🗄️ Database Migration Guide

## Overview
This guide will help you migrate your existing Kollokvie.no database to the new emne-based structure.

## 📋 Pre-Migration Checklist

- [ ] **Backup your database** (important!)
- [ ] **Test in development environment** first
- [ ] **Ensure all users are logged out** during migration
- [ ] **Have Supabase admin access** ready

## 🚀 Migration Steps

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Migration
1. Copy the entire contents of `setup.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the migration

### Step 3: Verify Migration
Run this query to verify the migration was successful:

```sql
-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals');

-- Check if existing data was migrated
SELECT 
    (SELECT COUNT(*) FROM public.notes) as old_notes,
    (SELECT COUNT(*) FROM public.contributions) as new_contributions,
    (SELECT COUNT(*) FROM public.todos) as old_todos,
    (SELECT COUNT(*) FROM public.tasks) as new_tasks;
```

## 📊 What the Migration Does

### ✅ **Creates New Tables:**
- `emne` - Subjects/courses (primary organizational unit)
- `emne_members` - User membership with roles
- `meetings` - Scheduled meetings with rotating leadership
- `agenda_items` - Structured meeting agenda
- `tasks` - Personal and shared tasks
- `contributions` - Notes, questions, insights, summaries
- `master_documents` - AI-generated knowledge base
- `progress_goals` - Learning goals and progress tracking

### ✅ **Migrates Existing Data:**
- **Notes** → `contributions` (type: 'note')
- **Todos** → `tasks` (with proper status mapping)
- **Users** → Get a "Personal" emne for their existing data

### ✅ **Sets Up Security:**
- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users only see data from emne they belong to
- **Proper permissions** for authenticated users

### ✅ **Performance Optimizations:**
- **Indexes** on frequently queried columns
- **Triggers** for automatic `updated_at` timestamps
- **Helper functions** for common queries

## 🔍 Post-Migration Verification

### Check Table Creation:
```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('emne', 'emne_members', 'meetings', 'agenda_items', 'tasks', 'contributions', 'master_documents', 'progress_goals');
-- Should return: 8
```

### Check Data Migration:
```sql
-- Verify notes were migrated
SELECT 
    (SELECT COUNT(*) FROM public.notes) as original_notes,
    (SELECT COUNT(*) FROM public.contributions WHERE type = 'note') as migrated_notes;

-- Verify todos were migrated  
SELECT 
    (SELECT COUNT(*) FROM public.todos) as original_todos,
    (SELECT COUNT(*) FROM public.tasks) as migrated_tasks;
```

### Check User Access:
```sql
-- Test that users can see their personal emne
SELECT * FROM public.user_personal_emne;
```

## 🚨 Rollback Plan (if needed)

If something goes wrong, you can rollback by:

1. **Drop new tables:**
```sql
DROP TABLE IF EXISTS public.progress_goals;
DROP TABLE IF EXISTS public.master_documents;
DROP TABLE IF EXISTS public.contributions;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.agenda_items;
DROP TABLE IF EXISTS public.meetings;
DROP TABLE IF EXISTS public.emne_members;
DROP TABLE IF EXISTS public.emne;
```

2. **Restore from backup** if data was corrupted

## 🎯 After Migration

### For Users:
- Existing notes and todos will appear in a "Personal" emne
- They can create new emne (subjects) for group collaboration
- All existing functionality is preserved

### For Development:
- Update your TypeScript types (already done in `database.ts`)
- Test the new emne creation flow
- Verify meeting and knowledge base functionality

## 📞 Support

If you encounter issues:
1. Check the Supabase logs for error messages
2. Verify all foreign key relationships are intact
3. Ensure RLS policies are working correctly
4. Test with a single user first before full deployment

## 🎉 Success Indicators

You'll know the migration was successful when:
- ✅ All 8 new tables exist
- ✅ Existing notes/todos are accessible in "Personal" emne
- ✅ Users can create new emne
- ✅ No errors in Supabase logs
- ✅ Application loads without database errors

