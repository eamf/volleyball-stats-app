# 🔧 Troubleshooting Guide - Volleyball Stats App

## ❌ Common Issues and Solutions

### 1. "Could not find the 'is_active' column of 'clubs' in the schema cache"

**Problem**: Database schema is missing required columns.

**Solution**: Run the schema fix script in Supabase SQL Editor:

```sql
-- Quick fix for missing columns
ALTER TABLE clubs 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE clubs SET is_active = true WHERE is_active IS NULL;
```

**Complete Solution**: Use the `complete_database_schema.sql` file to recreate all tables properly.

---

### 2. "Failed to add club: permission denied for table clubs"

**Problem**: Row Level Security (RLS) policies are not configured.

**Solution**: 
1. Go to Supabase Dashboard → Authentication → Policies
2. Ensure RLS is enabled on all tables
3. Add these policies for clubs table:

```sql
-- Enable RLS
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can view active clubs" ON clubs FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create clubs" ON clubs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update clubs they created" ON clubs FOR UPDATE USING (auth.uid() = created_by);
```

---

### 3. "Supabase client error: Invalid API key"

**Problem**: Environment variables not set correctly.

**Solution**:
1. Check Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Get correct values from Supabase Dashboard → Settings → API
3. Redeploy after adding variables

---

### 4. "User not authenticated" errors

**Problem**: Authentication not working properly.

**Solution**:
1. Check if user is logged in: `console.log(user)` in components
2. Verify Supabase Auth is configured correctly
3. Check if user profile exists in `user_profiles` table
4. Ensure RLS policies allow authenticated users

---

### 5. "Table 'play_types' doesn't exist"

**Problem**: Database tables not created.

**Solution**: Run the complete schema creation script:

```sql
-- Create play_types table
CREATE TABLE IF NOT EXISTS play_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    value INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default play types
INSERT INTO play_types (name, category, value, description) VALUES
('Ace', 'Serving', 1, 'Service ace - direct point from serve'),
('Service Error', 'Serving', -1, 'Service error - point lost on serve'),
('Good Serve', 'Serving', 0, 'Successful serve in play')
-- ... (add all play types)
ON CONFLICT (name) DO NOTHING;
```

---

### 6. Game recording not working

**Problem**: Missing game sets or plays tables.

**Solution**:
1. Ensure all tables exist using `complete_database_schema.sql`
2. Check that foreign key relationships are correct
3. Verify user has permission to insert into all related tables

---

### 7. Statistics page showing no data

**Problem**: Data not being fetched or displayed correctly.

**Solution**:
1. Check browser console for errors
2. Verify data exists in database tables
3. Check RLS policies allow reading data
4. Ensure joins between tables are working

---

### 8. Court heatmap not displaying

**Problem**: Missing play position data or rendering issues.

**Solution**:
1. Check if plays have `field_x` and `field_y` values
2. Verify SVG rendering in browser
3. Check for JavaScript errors in console
4. Ensure plays data is being passed to component correctly

---

## 🔍 Debugging Steps

### 1. Check Database Connection
```sql
-- Test basic connection
SELECT NOW();

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 2. Verify User Authentication
```javascript
// In your component
const { user } = useAuth();
console.log('Current user:', user);
console.log('User ID:', user?.id);
```

### 3. Check RLS Policies
```sql
-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check specific table policies
SELECT * FROM pg_policies WHERE tablename = 'clubs';
```

### 4. Test Data Insertion
```sql
-- Test manual insertion
INSERT INTO clubs (name, description, is_active, created_by) 
VALUES ('Test Club', 'Test Description', true, auth.uid());
```

### 5. Check Environment Variables
```javascript
// In your component
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

---

## 🚨 Emergency Reset

If nothing else works, you can reset the entire database:

### 1. Backup Existing Data (if any)
```sql
-- Export important data first
SELECT * FROM clubs;
SELECT * FROM teams;
-- etc.
```

### 2. Drop All Tables
```sql
DROP TABLE IF EXISTS plays CASCADE;
DROP TABLE IF EXISTS game_sets CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS championships CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS play_types CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```

### 3. Recreate Schema
Run the complete `complete_database_schema.sql` script.

---

## 📞 Getting Help

### 1. Check Logs
- **Vercel**: Check function logs in Vercel dashboard
- **Supabase**: Check logs in Supabase dashboard
- **Browser**: Check console for JavaScript errors

### 2. Common Log Locations
- Vercel Functions: Dashboard → Project → Functions tab
- Supabase: Dashboard → Logs section
- Browser: F12 → Console tab

### 3. Useful Commands
```bash
# Check local build
npm run build

# Check TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

---

## ✅ Verification Checklist

After fixing issues, verify:

- [ ] User can register/login
- [ ] User can create clubs
- [ ] User can create teams
- [ ] User can add players
- [ ] User can create games
- [ ] Game recording works
- [ ] Statistics display correctly
- [ ] Court heatmap renders
- [ ] No console errors
- [ ] All pages load correctly

---

**Most issues are related to database schema or RLS policies. Start with the schema fix and work through the checklist!** 🏐
