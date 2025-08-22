# MassLog

A modern, full-stack weight tracking application built with Next.js 14, Supabase, and TypeScript. Track your weight progress with beautiful charts, statistics, and insights.

## 🚀 Features

- **📊 Weight Tracking**: Record daily weight entries with date selection
- **📈 Beautiful Charts**: Visualize your progress with interactive line charts
- **🎯 Goal Setting**: Set and track your goal weight
- **📅 Weekly Averages**: View weekly weight averages grouped by Monday-Sunday weeks
- **📱 Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **🌙 Dark Mode**: Toggle between light and dark themes
- **🔐 User Authentication**: Secure email/password authentication
- **📊 Statistics**: View current weight, weekly changes, and averages
- **✏️ Inline Editing**: Edit weight entries directly in the list
- **🗑️ Account Management**: Delete your account and all data
- **🎨 Modern UI**: Built with Shadcn/UI components

## 📅 Weekly Average Feature

The application automatically calculates and displays weekly weight averages based on the following rules:

### Week Definition

- **Week Structure**: Each week runs from Monday to Sunday
- **Date Assignment**: All logged weights between Monday and Sunday are grouped together
- **Example**: Monday, August 11, 2025 belongs to week 33, not week 32

### Calculation Method

- **Average Formula**: Sum all recorded daily weights within a week and divide by the number of logged days
- **Precision**: Results are rounded to one decimal place
- **Partial Weeks**: Weeks with partial data still display an average based on available entries

### Display Format

- **Mobile**: Weekly averages appear next to the week's date range (e.g., "80 kg average")
- **Desktop**: Clear, readable format with week headers and grouped daily entries
- **Week Labels**:
  - "This week" for the current Monday-Sunday period
  - "Last week" for the previous Monday-Sunday period
  - Date ranges for older weeks (e.g., "Aug 4 - Aug 10")

### Data Organization

- Daily weight entries are grouped under their respective weekly headers
- Each week shows the calculated average prominently
- Entries within each week are sorted by date (newest first)
- Maintains all existing functionality (edit, delete, goal weight comparison)

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **UI Components**: Shadcn/UI, Radix UI
- **Data Fetching**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd body-weight

# Install dependencies
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important**: You'll need the service role key for admin operations like user account deletion. Get this from your Supabase Dashboard > Settings > API > service_role key.

### 3. Set up Database

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create weights table
CREATE TABLE weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  goal_weight NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for weights table
CREATE POLICY "Users can view their own weights" ON weights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weights" ON weights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weights" ON weights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weights" ON weights
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for user_profiles table
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### 4. Run the Migration (Optional - for existing projects)

If you're updating an existing project, run this additional SQL command in your Supabase SQL editor to add the new total change start date feature:

```sql
-- Add total_change_start_date column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN total_change_start_date DATE;

-- Add a comment to document the column
COMMENT ON COLUMN user_profiles.total_change_start_date IS 'Custom starting date for total change calculations. If NULL, uses the first recorded weight.';
```

### 5. Run the Application

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   ├── auth/             # Authentication components
│   ├── dashboard.tsx     # Main dashboard
│   ├── weight-form.tsx   # Weight entry form
│   ├── weight-chart.tsx  # Chart component
│   ├── weight-list.tsx   # Weight history list
│   └── ...
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-weights.ts    # Weight data hooks
│   └── use-theme.ts      # Theme management
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript type definitions
    ├── index.ts          # Main types
    └── supabase.ts       # Database types
```

## 🎨 Customization

### Styling

The application uses Tailwind CSS with CSS variables for theming. You can customize colors, spacing, and other design tokens in:

- `tailwind.config.js` - Tailwind configuration
- `src/app/globals.css` - CSS variables for theming

### Components

All UI components are built with Shadcn/UI and can be customized by modifying the component files in `src/components/ui/`.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Shadcn/UI](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Recharts](https://recharts.org/) for the chart components
