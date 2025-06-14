# 🔗 Supabase Connection Fix Guide

## 🎯 Problem: Vercel Not Connected to Correct Supabase Project

Your Vercel deployment needs the correct Supabase credentials to connect to your database.

## 🔍 Step 1: Get Your Supabase Credentials

### A. Access Your Supabase Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Select the correct project** (make sure it's your volleyball stats project)
3. Navigate to **Settings** → **API**

### B. Copy These Exact Values
```
Project URL: https://[your-project-ref].supabase.co
Project API Keys → anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important**: 
- Use the **anon public** key (NOT the service_role key)
- Make sure you're in the correct Supabase project

## 🔧 Step 2: Add Environment Variables to Vercel

### A. Access Vercel Project Settings
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **volleyball-stats-app** project
3. Navigate to **Settings** → **Environment Variables**

### B. Add/Update These Variables

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://[your-project-ref].supabase.co
Environment: Production, Preview, Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your full anon key)
Environment: Production, Preview, Development
```

### C. Save and Apply
1. Click **Save** for each variable
2. Ensure both are set for **Production** environment

## 🚀 Step 3: Redeploy Your Application

### Option A: Trigger Redeploy from Vercel
1. Go to **Deployments** tab in your Vercel project
2. Find the latest deployment
3. Click the **⋯** menu → **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

### Option B: Trigger Redeploy from CLI
```bash
vercel --prod
```

## ✅ Step 4: Verify the Connection

### A. Test the Deployed App
1. Visit your app: https://volleyball-stats-rcz7vzem0-eduardos-projects-fe8eaa10.vercel.app
2. Try to register/login
3. If login works, the connection is successful

### B. Check Browser Console
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for any Supabase connection errors

### C. Test Database Operations
1. Try creating a club
2. If it works without errors, you're connected correctly

## 🔍 Troubleshooting Common Issues

### Issue 1: "Invalid API URL" Error
**Problem**: Wrong Supabase URL
**Solution**: 
- Double-check the Project URL in Supabase Settings → API
- Ensure it starts with `https://` and ends with `.supabase.co`

### Issue 2: "Invalid API Key" Error
**Problem**: Wrong or expired API key
**Solution**:
- Use the **anon public** key (not service_role)
- Copy the full key including all characters
- Regenerate key if necessary in Supabase Settings → API

### Issue 3: "Network Error" or "CORS Error"
**Problem**: Environment variables not applied
**Solution**:
- Ensure variables are saved in Vercel
- Redeploy the application
- Check that variables are set for Production environment

### Issue 4: Variables Exist But Still Not Working
**Problem**: Cached deployment or wrong environment
**Solution**:
```bash
# Clear Vercel cache and redeploy
vercel --prod --force
```

## 🔧 Advanced Debugging

### Check Environment Variables in Deployed App
Add this temporary code to a page to verify variables are loaded:

```javascript
// Add to any page temporarily
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key (first 20 chars):', 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
```

### Verify Supabase Connection
```javascript
// Test connection in browser console
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Test query
const { data, error } = await supabase.from('clubs').select('*').limit(1)
console.log('Connection test:', { data, error })
```

## 📋 Quick Verification Checklist

- [ ] Correct Supabase project selected
- [ ] Project URL copied correctly (starts with https://, ends with .supabase.co)
- [ ] Anon public key copied (not service_role key)
- [ ] Environment variables added to Vercel
- [ ] Variables set for Production environment
- [ ] Application redeployed after adding variables
- [ ] No console errors in browser
- [ ] Can register/login successfully
- [ ] Can create clubs/teams without errors

## 🎯 Expected Results After Fix

✅ **Authentication Works**: Users can register and login
✅ **Database Operations Work**: Can create clubs, teams, players
✅ **No Console Errors**: Clean browser console
✅ **Real-time Updates**: Data syncs properly
✅ **Game Recording Works**: Can record volleyball games
✅ **Statistics Display**: Analytics and heatmaps work

## 📞 Still Having Issues?

If the connection still doesn't work:

1. **Double-check project selection** in Supabase dashboard
2. **Regenerate API keys** in Supabase Settings → API
3. **Create a new Vercel deployment** if cache issues persist
4. **Check Supabase project status** (ensure it's not paused)

---

**After following these steps, your Vercel deployment will be properly connected to your Supabase project!** 🏐
