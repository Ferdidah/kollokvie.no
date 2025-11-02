# Add Member Feature - Migration Guide

This migration adds the ability for emne creators and admins to add members to their emne groups.

## Files Created

1. **`add_emne_member_function.sql`**
   - Database function `add_emne_member(p_emne_id, p_user_email, p_role)`
   - Securely adds a user to an emne by email
   - Only emne creators or admins can add members
   - Returns the new membership ID

2. **`get_member_emails_function.sql`**
   - Database function `get_emne_member_emails(p_emne_id)`
   - Returns member information including emails for display
   - Only accessible by emne members
   - Uses SECURITY DEFINER to access auth.users

3. **`app/src/components/emner/AddMember.tsx`**
   - Client component for adding members
   - Only visible to emne creators
   - Form with email input and role selection

4. **`app/src/components/emner/MemberList.tsx`**
   - Client component for displaying members
   - Shows member email, role, and join date
   - Allows creators to remove members

5. **`app/src/app/dashboard/emner/[emneId]/medlemmer/page.tsx`** (updated)
   - Updated members page to display AddMember and MemberList components
   - Fetches member data and checks permissions

## Database Changes

### Run these SQL files in Supabase SQL Editor:

1. **`add_emne_member_function.sql`**
   ```sql
   -- Creates the add_emne_member function
   ```

2. **`get_member_emails_function.sql`**
   ```sql
   -- Creates the get_emne_member_emails function
   ```

3. **Update RLS Policy in `fix_rls_policies.sql`**
   - Update the "Users can join emne" policy to allow creators and admins to add members
   - Run the updated INSERT policy:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can join emne" ON public.emne_members;

-- Create updated policy
CREATE POLICY "Users can join emne" ON public.emne_members
    FOR INSERT WITH CHECK (
        -- Users can add themselves
        user_id = auth.uid()
        OR
        -- Emne creators can add anyone
        emne_id IN (
            SELECT id FROM public.emne WHERE created_by = auth.uid()
        )
        OR
        -- Admins can add anyone
        EXISTS (
            SELECT 1 FROM public.emne_members em
            WHERE em.emne_id = emne_members.emne_id
            AND em.user_id = auth.uid()
            AND em.role = 'admin'
        )
    );
```

## Usage

### Adding a Member

1. Navigate to `/dashboard/emner/[emneId]/medlemmer`
2. As an emne creator, you'll see the "Legg til medlem" form
3. Enter the user's email address
4. Select a role (member, admin, or leader)
5. Click "Legg til medlem"

### Viewing Members

- All members can view the member list
- Members see their own email and the email of other members
- Role badges are color-coded:
  - Administrator: Purple
  - Leder: Blue
  - Medlem: Gray

### Removing Members

- Emne creators can remove any member (except themselves)
- Click the trash icon next to a member to remove them
- Confirmation dialog will appear before removal

## Security Considerations

1. **Authorization Checks**
   - The `add_emne_member` function verifies the caller is a creator or admin
   - RLS policies provide additional protection at the database level

2. **Email Lookup**
   - Uses SECURITY DEFINER to access auth.users
   - Email matching is case-insensitive
   - User must exist in the system

3. **Role Validation**
   - Only valid roles (admin, member, leader) can be assigned
   - Default role is 'member'

4. **Duplicate Prevention**
   - Function checks if user is already a member
   - Unique constraint on (emne_id, user_id) prevents duplicates

## Testing

1. Create an emne as a user
2. Navigate to the members page
3. Add a member by email (must be an existing user email)
4. Verify the member appears in the list
5. Try to add the same member again (should fail)
6. Remove a member and verify they're removed

## Notes

- Users must exist in the system (have registered accounts) before they can be added
- The email lookup is performed server-side in the database function
- Member emails are fetched client-side using the `get_emne_member_emails` RPC function
- This maintains security by keeping auth.users access server-side only

