# 🚀 Vercel Deployment Guide

This guide will help you deploy your MassLog body-weight tracking application to Vercel.

## Prerequisites

1. **Supabase Project**: You need a Supabase project set up with the required database tables
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub/GitLab Repository**: Your code should be in a Git repository

## Step 1: Prepare Your Supabase Database

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up the database tables** by running the SQL commands from `README.md`
3. **Get your credentials**:
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon public key

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Connect your repository**:

   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing your MassLog code

2. **Configure the project**:

   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

3. **Add Environment Variables**:

   - Click "Environment Variables" in the project settings
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

3. **Deploy**:

   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables when prompted

## Step 3: Configure Custom Domain (Optional)

1. **Add domain** in Vercel dashboard
2. **Configure DNS** as instructed by Vercel
3. **Wait for propagation** (can take up to 24 hours)

## Step 4: Verify Deployment

1. **Test the application**:

   - Visit your deployed URL
   - Create an account
   - Add some weight entries
   - Verify all features work

2. **Check for errors**:
   - Monitor Vercel function logs
   - Check browser console for errors
   - Verify Supabase connection

## Environment Variables Reference

| Variable                        | Description                   | Required |
| ------------------------------- | ----------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL     | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes      |

## Troubleshooting

### Common Issues

1. **Build fails**:

   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation
   - Check for syntax errors

2. **Environment variables not working**:

   - Ensure variables are prefixed with `NEXT_PUBLIC_`
   - Redeploy after adding variables
   - Check variable names match exactly

3. **Supabase connection errors**:

   - Verify URL and key are correct
   - Check Supabase project is active
   - Ensure database tables exist

4. **Authentication issues**:
   - Verify Supabase Auth is enabled
   - Check email templates are configured
   - Test signup/signin flow

### Performance Optimization

- **Enable Vercel Analytics** for performance monitoring
- **Configure caching** for static assets
- **Monitor function execution times**
- **Set up error tracking** (e.g., Sentry)

## Post-Deployment

1. **Set up monitoring**:

   - Enable Vercel Analytics
   - Configure error tracking
   - Set up uptime monitoring

2. **Configure backups**:

   - Set up Supabase database backups
   - Configure point-in-time recovery

3. **Security considerations**:
   - Review Supabase RLS policies
   - Enable 2FA on Vercel account
   - Regularly rotate API keys

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Happy deploying! 🎉**
