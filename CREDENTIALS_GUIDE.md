# TourFlow AI - Credentials Setup Guide

## Overview
This guide explains exactly where to add your credentials and API keys for the TourFlow AI Traveler Frontend.

---

## 1. Environment Variables File

### Location
```
frontend/.env.local
```

### Create the file
If the file doesn't exist, create it in the `frontend` directory.

### Required Credentials

```env
# Supabase Configuration
# Get these from: https://app.supabase.com/project/<your-project>/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API Configuration
# Your FastAPI backend URL (Developer 1's backend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
# For production, use: https://your-backend-domain.com/api
```

---

## 2. How to Get Supabase Credentials

### Step 1: Go to Supabase Dashboard
Visit: https://app.supabase.com

### Step 2: Create or Select Project
- Create a new project OR select your existing project
- Wait for the project to finish setting up

### Step 3: Get API Credentials
1. Go to **Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see:
   - **Project URL** → Copy this as `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → 
     - Find **anon/public** key → Copy this as `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - ⚠️ **DO NOT use the service_role key in frontend**

### Step 4: Configure Authentication
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional for development)
4. For production, set up custom SMTP (optional)

---

## 3. Supabase Database Setup (If not done by Developer 1)

### Enable Row Level Security (RLS)
```sql
-- Run these in Supabase SQL Editor

-- Create users table (if needed)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

---

## 4. Backend API URL Configuration

### For Local Development
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### For Production (Vercel Deployment)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.vercel.app/api
# OR
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
```

**Note:** The backend API should be deployed by Developer 1. Coordinate with them for the production URL.

---

## 5. Vercel Deployment Environment Variables

### Location
When deploying to Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add each variable:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key | Production, Preview, Development |
| `NEXT_PUBLIC_API_BASE_URL` | Your backend API URL | Production, Preview, Development |

### Important Notes for Vercel
- ✅ All variables start with `NEXT_PUBLIC_` because they need to be accessible in the browser
- ✅ Add variables to all environments (Production, Preview, Development)
- ✅ Redeploy after adding environment variables

---

## 6. What NOT to Commit

### Files to NEVER commit (already in .gitignore):
```
.env.local
.env
.env*.local
```

### Why?
These files contain sensitive credentials that should never be pushed to GitHub.

---

## 7. Verification Checklist

After setting up credentials, verify everything works:

### ✅ Local Development
```bash
cd frontend
npm run dev
```

Then test:
- [ ] Navigate to http://localhost:3000
- [ ] Try to sign up with a test email
- [ ] Check email for confirmation link (if SMTP configured)
- [ ] Try to sign in
- [ ] Check if you're redirected to `/traveler` dashboard

### ✅ Build Test
```bash
cd frontend
npm run build
```

Should complete without errors.

### ✅ Type Check
```bash
cd frontend
npm run type-check
```

Should pass all TypeScript checks.

---

## 8. Troubleshooting

### Error: "Invalid Supabase URL"
- ✅ Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
- ✅ Ensure it starts with `https://`
- ✅ Verify the project ID matches your Supabase dashboard

### Error: "Invalid API key"
- ✅ Use the **anon/public** key, not service_role
- ✅ Copy the entire key including all characters
- ✅ Check for extra spaces or newlines

### Error: "Failed to fetch"
- ✅ Check that backend API is running
- ✅ Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- ✅ Ensure backend has CORS configured for your frontend domain

### Error: "Auth session not found"
- ✅ Clear browser cookies and localStorage
- ✅ Try signing out and signing back in
- ✅ Check Supabase authentication settings

---

## 9. Security Best Practices

### ✅ DO:
- Use environment variables for all credentials
- Use different Supabase projects for development and production
- Enable Row Level Security (RLS) on all database tables
- Use the anon/public key in frontend (it's designed for client-side use)
- Rotate keys if they're exposed

### ❌ DON'T:
- Commit `.env.local` or `.env` files
- Use service_role key in frontend code
- Hardcode credentials in source code
- Share credentials in chat/email
- Use production credentials in development

---

## 10. Quick Start Commands

### First Time Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### Every Time You Start Development
```bash
cd frontend
npm run dev
```

---

## 11. Production Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] Backend API is deployed and accessible
- [ ] Supabase project is set up for production
- [ ] Email authentication is configured (SMTP)
- [ ] Row Level Security is enabled on all tables
- [ ] CORS is configured on backend
- [ ] Test the full authentication flow
- [ ] Test API integration

---

## Need Help?

### Supabase Issues
- Documentation: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Next.js Issues
- Documentation: https://nextjs.org/docs
- Environment Variables: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

### Vercel Issues
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
