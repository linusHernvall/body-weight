# 🚀 Quick Start Guide

Get your MassLog up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd body-weight

# Run the setup script
./setup.sh
```

## Step 2: Set up Supabase

1. **Create a Supabase project:**

   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization and region
   - Wait for the project to be created

2. **Get your credentials:**

   - Go to Settings > API
   - Copy your Project URL and anon public key
   - Update `.env.local` with these values

3. **Set up the database:**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the SQL from the README.md file
   - Run the SQL commands

## Step 3: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Create Your Account

1. Click "Sign up" on the login page
2. Enter your email and password
3. Check your email for verification (if required)
4. Sign in and start tracking your weight!

## 🎯 What You Can Do

- **Record daily weights** with date selection
- **View progress charts** with goal weight tracking
- **See statistics** like weekly averages and changes
- **Edit entries** inline in the weight list
- **Set goal weights** and track progress
- **Toggle dark mode** for comfortable viewing
- **Delete your account** if needed

## 🆘 Need Help?

- Check the [README.md](README.md) for detailed documentation
- Look at the [Issues](../../issues) page for common problems
- Create a new issue if you need help

## 🚀 Ready to Deploy?

The app is ready to deploy to Vercel, Netlify, or any platform that supports Next.js!

---

**Happy weight tracking! 📊**
