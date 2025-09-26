# Database Roles and RLS Policy Update Guide

## Overview
This document provides instructions for updating user roles and implementing Row Level Security (RLS) policies to resolve Supabase security warnings.

## Security Warnings Addressed
- **RLS Disabled in Public** warnings for tables: `user_submissions`, `songs`, `ingestion_jobs`
- These warnings indicate that database tables are exposed without proper access control

## Implementation Steps

### 1. Apply RLS Policies
Run the SQL commands from `database/rls-policies.sql` in the Supabase SQL Editor to enable Row Level Security on all affected tables.

### 2. Set Up User Roles

#### Setting Admin Users
To designate a user as an admin, update their metadata in Supabase Auth:

```sql
-- Replace 'user-uuid' with the actual user ID
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}' 
WHERE id = 'user-uuid';
```

#### Finding User IDs
To find user IDs in Supabase:
1. Go to Authentication → Users in the Supabase Dashboard
2. Copy the UUID from the user you want to make an admin
3. Use the UUID in the SQL command above

### 3. Policy Behavior Summary

#### user_submissions Table
- **Users**: Can view/edit/delete only their own submissions
- **Admins**: Can view all submissions and update status (approve/reject)

#### songs Table  
- **All authenticated users**: Can view all songs (public read access)
- **Admins only**: Can add/edit/delete songs

#### ingestion_jobs Table
- **Admins only**: Can access (internal system data)

### 4. Testing Checklist

After implementing RLS policies, test with different user accounts:

- [ ] **Regular authenticated user**:
  - Can view songs
  - Can create/edit/delete their own submissions
  - Cannot access other users' submissions
  - Cannot access ingestion jobs

- [ ] **Admin user**:
  - Can view all songs
  - Can add/edit/delete songs
  - Can view all user submissions
  - Can approve/reject submissions
  - Can access ingestion jobs

- [ ] **Anonymous user** (if applicable):
  - Can view songs (if public access is enabled)
  - Cannot access user submissions
  - Cannot access ingestion jobs

### 5. Monitoring and Troubleshooting

#### Check Supabase Logs
- Monitor Supabase logs to ensure policies are working correctly
- Look for any legitimate access being blocked
- Verify that unauthorized access is properly denied

#### Common Issues
- **"Permission denied" errors**: Check if user has proper role assigned
- **Can't access own data**: Verify user_id column matches auth.uid()
- **Admin functions not working**: Ensure user metadata contains role: 'admin'

#### Debugging Queries
Use these queries to check user roles and permissions:

```sql
-- Check current user's role
SELECT auth.uid(), raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE id = auth.uid();

-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_submissions', 'songs', 'ingestion_jobs');

-- List all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'user_submissions';
```

### 6. Security Best Practices

- **Regular audits**: Periodically review user roles and permissions
- **Principle of least privilege**: Only grant necessary permissions
- **Monitor access patterns**: Watch for unusual access patterns
- **Keep policies updated**: Review and update policies as application requirements change

### 7. Rollback Plan

If issues arise, you can temporarily disable RLS:

```sql
-- WARNING: This removes all security - use only for emergency debugging
ALTER TABLE public.user_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs DISABLE ROW LEVEL SECURITY;
```

**Note**: Only use rollback in emergency situations and re-enable RLS as soon as possible.

## Files Modified
- `database/rls-policies.sql` - Contains all RLS policies
- `database_roles_update.md` - This documentation file

## Next Steps
1. Apply the RLS policies in Supabase
2. Set up admin users using the SQL commands above
3. Test thoroughly with different user types
4. Monitor logs for any issues
5. Document any custom policies specific to your application needs
