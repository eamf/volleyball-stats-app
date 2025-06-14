# 🚀 Volleyball Stats App - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Your Supabase project should be set up and running

## 🔧 Environment Variables Setup

Before deploying, you need to set up environment variables in Vercel:

### Required Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get These Values:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** (for `NEXT_PUBLIC_SUPABASE_URL`)
4. Copy the **anon public** key (for `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 🚀 Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

3. **Add Environment Variables**:
   - In the deployment configuration, add your environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Method 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy from Project Root**:
   ```bash
   vercel
   ```

3. **Follow the Prompts**:
   - Link to existing project or create new one
   - Confirm settings
   - Add environment variables when prompted

4. **Production Deployment**:
   ```bash
   vercel --prod
   ```

## 📋 Deployment Configuration Files

The following files are already configured for optimal Vercel deployment:

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key"
  }
}
```

### `.vercelignore`
- Excludes unnecessary files from deployment
- Reduces bundle size and deployment time

## 🔒 Security Configuration

### Supabase RLS (Row Level Security)
Ensure your Supabase database has proper RLS policies:

1. **Enable RLS** on all tables
2. **Create policies** for authenticated users
3. **Test permissions** before going live

### Environment Variables
- Never commit `.env.local` to version control
- Use Vercel's environment variable system
- Separate development and production environments

## 🌐 Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel's nameservers

## 📊 Performance Optimization

### Already Configured:
- ✅ Next.js App Router
- ✅ Static page generation where possible
- ✅ Optimized bundle splitting
- ✅ Image optimization
- ✅ Cache headers

### Build Output:
```
Route (app)                Size     First Load JS
┌ ○ /                      7.24 kB  143 kB
├ ○ /dashboard             2.72 kB  134 kB
├ ○ /dashboard/statistics  7.15 kB  129 kB
├ ƒ /dashboard/games/[id]  10.4 kB  133 kB
└ ... (other routes)
```

## 🔍 Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Database connections work
- [ ] All pages render properly

### 2. Test Core Features
- [ ] User registration/login
- [ ] Data creation (clubs, teams, players)
- [ ] Game recording functionality
- [ ] Statistics display
- [ ] Court heatmap rendering

### 3. Performance Check
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness
- [ ] No console errors
- [ ] Proper error handling

## 🐛 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check TypeScript errors
   - Verify all imports are correct
   - Ensure environment variables are set

2. **Supabase Connection Issues**:
   - Verify environment variables
   - Check Supabase project status
   - Confirm RLS policies

3. **404 Errors**:
   - Check file naming conventions
   - Verify routing structure
   - Ensure all pages export default components

### Debug Commands:
```bash
# Local build test
npm run build

# Check for TypeScript errors
npm run type-check

# Lint code
npm run lint
```

## 📈 Monitoring & Analytics

### Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor Core Web Vitals
- Track page performance

### Error Monitoring
- Consider adding Sentry or similar
- Monitor Supabase logs
- Set up alerts for critical errors

## 🔄 Continuous Deployment

### Automatic Deployments:
- ✅ Pushes to `main` branch trigger production deployments
- ✅ Pull requests create preview deployments
- ✅ Environment variables are inherited

### Branch Strategy:
- `main` → Production
- `develop` → Preview deployments
- Feature branches → Preview deployments

## 🎯 Production URLs

After deployment, you'll get:
- **Production URL**: `https://your-app-name.vercel.app`
- **Preview URLs**: For each pull request
- **Custom Domain**: If configured

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

## 🏐 Ready to Deploy!

Your volleyball stats application is now ready for production deployment on Vercel with:

- ✅ **Professional Statistics System**
- ✅ **Interactive Court Heatmaps**
- ✅ **Real-time Game Recording**
- ✅ **Comprehensive Player Analytics**
- ✅ **Tournament-Ready Interface**
- ✅ **Mobile-Responsive Design**
- ✅ **Secure Authentication**
- ✅ **Optimized Performance**

Deploy with confidence! 🚀
