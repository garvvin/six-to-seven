# Quick Fix for Row Level Security (RLS) Issue

## Problem
The Supabase `information` table has Row Level Security (RLS) enabled, which is preventing the backend from storing OCR results.

Error: `new row violates row-level security policy for table "information"`

## Solution 1: Disable RLS (Quick Fix)
Run this SQL in your Supabase SQL Editor:

```sql
ALTER TABLE information DISABLE ROW LEVEL SECURITY;
```

## Solution 2: Create RLS Policy (Recommended for Production)
If you want to keep RLS enabled, create a policy that allows the backend to insert data:

```sql
-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON information
FOR ALL USING (true)
WITH CHECK (true);

-- Or create a more restrictive policy
CREATE POLICY "Allow insert for backend service" ON information
FOR INSERT WITH CHECK (true);
```

## Solution 3: Use Service Role Key (Most Secure)
1. Go to Supabase Dashboard > Settings > API
2. Copy the `service_role` key (not the `anon` key)
3. Update your backend `.env` file:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Update the Supabase service to use the service role key

## Current Status
- Backend is configured correctly
- Supabase connection is working
- RLS is blocking data insertion
- Frontend error handling is improved

## Recommendation
For development/testing: Use Solution 1 (disable RLS)
For production: Use Solution 3 (service role key)
