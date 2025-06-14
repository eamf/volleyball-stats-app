# ⚡ Quick Setup Guide

## 🚀 Your App is Live!
**URL**: https://volleyball-stats-rcz7vzem0-eduardos-projects-fe8eaa10.vercel.app

## 🔧 5-Minute Setup

### Step 1: Get Supabase Credentials (2 minutes)
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL**
   - **anon public key**

### Step 2: Add to Vercel (2 minutes)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **volleyball-stats-app**
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:

```
NEXT_PUBLIC_SUPABASE_URL = [paste your Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste your anon public key]
```

### Step 3: Redeploy (1 minute)
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

## ✅ You're Ready!

Your volleyball stats app will be fully functional with:
- User authentication
- Database connectivity
- Real-time game recording
- Advanced statistics
- Court heatmaps

## 🏐 Start Using Your App

1. **Register/Login**: Create your account
2. **Create a Club**: Set up your organization
3. **Add Teams**: Create your volleyball teams
4. **Add Players**: Register team members
5. **Record Games**: Start tracking matches
6. **View Statistics**: Analyze performance

---

**Need Help?** Check the full deployment guide in `DEPLOYMENT_SUCCESS.md`
