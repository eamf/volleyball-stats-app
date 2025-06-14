#!/bin/bash

# 🚀 Volleyball Stats App - Vercel Deployment Script
# This script helps you deploy your volleyball stats application to Vercel

echo "🏐 Volleyball Stats App - Vercel Deployment"
echo "==========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ You're not logged in to Vercel. Please log in:"
    vercel login
fi

echo "✅ Vercel authentication confirmed"
echo ""

# Check for environment variables
echo "🔧 Environment Variables Setup"
echo "==============================="
echo ""
echo "Before deploying, you need to set up your Supabase environment variables."
echo ""
echo "Please have the following ready from your Supabase project:"
echo "1. Project URL (from Settings → API)"
echo "2. Anon public key (from Settings → API)"
echo ""

read -p "Do you have your Supabase credentials ready? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 To get your Supabase credentials:"
    echo "1. Go to your Supabase project dashboard"
    echo "2. Navigate to Settings → API"
    echo "3. Copy the Project URL and anon public key"
    echo ""
    echo "Run this script again when you have your credentials ready."
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment process initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. If this is your first deployment, Vercel will ask you to:"
echo "   - Link to an existing project or create a new one"
echo "   - Confirm your project settings"
echo ""
echo "2. Add your environment variables in the Vercel dashboard:"
echo "   - Go to your project settings"
echo "   - Navigate to Environment Variables"
echo "   - Add: NEXT_PUBLIC_SUPABASE_URL"
echo "   - Add: NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "3. Redeploy after adding environment variables:"
echo "   vercel --prod"
echo ""
echo "🏐 Your volleyball stats app will be live soon!"
echo "Check your Vercel dashboard for the deployment URL."
