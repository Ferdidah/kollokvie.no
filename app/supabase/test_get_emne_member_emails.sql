-- Test the get_emne_member_emails function
-- Run this to verify the function works correctly

-- First, check if the function exists
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_emne_member_emails';

-- Test the function (replace with an actual emne_id from your database)
-- Example:
-- SELECT * FROM get_emne_member_emails('your-emne-id-here'::UUID);

-- If you get a permission error, check grants:
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'get_emne_member_emails';

