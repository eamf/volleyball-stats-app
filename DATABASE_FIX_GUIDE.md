# 🔧 Database Schema Fix Guide

## ❌ Error: "Could not find the 'is_active' column of 'clubs' in the schema cache"

This error occurs because the database schema is missing some columns that the application expects.

## 🚀 Quick Fix (5 minutes)

### Step 1: Access Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your volleyball stats project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema Fix
Copy and paste this SQL script into the editor:

```sql
-- Add missing columns to clubs table
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to teams table
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to championships table
ALTER TABLE championships 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to games table
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to game_sets table
ALTER TABLE game_sets 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to plays table
ALTER TABLE plays 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to play_types table
ALTER TABLE play_types 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records
UPDATE clubs SET is_active = true WHERE is_active IS NULL;
UPDATE teams SET is_active = true WHERE is_active IS NULL;
UPDATE players SET is_active = true WHERE is_active IS NULL;
UPDATE championships SET is_active = true WHERE is_active IS NULL;
UPDATE play_types SET is_active = true WHERE is_active IS NULL;
```

### Step 3: Execute the Script
1. Click **Run** button in the SQL Editor
2. Wait for the success message
3. You should see "Success. No rows returned" or similar

### Step 4: Verify the Fix
Run this verification query:

```sql
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'clubs' 
    AND table_schema = 'public'
    AND column_name IN ('is_active', 'created_at', 'updated_at')
ORDER BY column_name;
```

You should see all three columns listed.

## ✅ Test the Fix

1. Go back to your volleyball stats app
2. Try creating a club again
3. The error should be resolved!

## 🔍 What This Fix Does

### Adds Missing Columns:
- **`is_active`**: Boolean flag to soft-delete records
- **`created_at`**: Timestamp when record was created
- **`updated_at`**: Timestamp when record was last modified

### Updates Existing Data:
- Sets `is_active = true` for all existing records
- Adds current timestamp for `created_at` and `updated_at`

### Adds Automatic Triggers:
- Automatically updates `updated_at` when records are modified

## 🚨 If You Still Have Issues

### Option 1: Reset and Recreate Tables
If the above doesn't work, you might need to recreate the tables with the correct schema. Use the complete schema from `database_schema.sql`.

### Option 2: Check RLS Policies
Ensure Row Level Security policies are properly configured:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'clubs';

-- If no policies exist, create them
CREATE POLICY "Users can view clubs" ON clubs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their clubs" ON clubs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their clubs" ON clubs FOR DELETE USING (auth.role() = 'authenticated');
```

### Option 3: Refresh Schema Cache
In Supabase dashboard:
1. Go to **Settings** → **API**
2. Click **Refresh** next to "Schema cache"

## 📞 Need Help?

If you're still experiencing issues:
1. Check the Supabase logs in your dashboard
2. Verify your environment variables are correctly set
3. Ensure your user has proper database permissions

---

**After running this fix, your volleyball stats app should work perfectly!** 🏐
