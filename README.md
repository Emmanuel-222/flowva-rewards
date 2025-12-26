# Flowva Rewards Hub

A recreation of the Flowva Rewards Hub page built with React, TypeScript, Tailwind CSS, and Supabase.

##  Live Demo

[View Live Demo](https://flowva-rewards-two.vercel.app)

##  Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase (Auth + PostgreSQL)
- **Data Fetching:** TanStack React Query
- **Routing:** React Router v7
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

##  Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)

##  Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/flowva-rewards.git
cd flowva-rewards
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned (takes ~2 minutes)

### 4. Create Database Tables

Go to **SQL Editor** in Supabase and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Point transactions table
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('streak', 'referral', 'spotlight', 'share', 'signup', 'manual')),
  points_delta INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily streaks table
CREATE TABLE daily_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  last_claimed_date DATE
);

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  status TEXT CHECK (status IN ('active', 'coming_soon')) DEFAULT 'active',
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward redemptions table
CREATE TABLE reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spotlight tools table
CREATE TABLE spotlight_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cta_label TEXT,
  cta_url TEXT,
  points_reward INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_reward_redemptions_user_id ON reward_redemptions(user_id);
```

### 5. Enable Row Level Security (RLS)

Run this in a **new SQL query**:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight_tools ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Point transactions policies
CREATE POLICY "Users can view own transactions" ON point_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON point_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily streaks policies
CREATE POLICY "Users can view own streak" ON daily_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON daily_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON daily_streaks FOR UPDATE USING (auth.uid() = user_id);

-- Rewards policies (public read)
CREATE POLICY "Anyone can view rewards" ON rewards FOR SELECT USING (true);

-- Reward redemptions policies
CREATE POLICY "Users can view own redemptions" ON reward_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own redemptions" ON reward_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referrals policies
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Spotlight tools policies (public read)
CREATE POLICY "Anyone can view spotlight tools" ON spotlight_tools FOR SELECT USING (true);
```

### 6. Seed Sample Data

Run this to add sample rewards and a spotlight tool:

```sql
-- Insert sample rewards
INSERT INTO rewards (title, description, points_cost, status) VALUES
  ('$5 Bank Transfer', 'The $5 equivalent will be transferred to your bank account.', 5000, 'active'),
  ('$5 PayPal International', 'Receive a $5 PayPal balance transfer directly to your PayPal account email.', 5000, 'active'),
  ('$5 Virtual Visa Card', 'Use your $5 prepaid card to shop anywhere Visa is accepted online.', 5000, 'active'),
  ('$10 Amazon Gift Card', 'Redeem for a $10 Amazon gift card.', 10000, 'active'),
  ('$25 Steam Gift Card', 'Get a $25 Steam wallet code.', 25000, 'coming_soon');

-- Insert a featured spotlight tool
INSERT INTO spotlight_tools (name, description, cta_label, cta_url, points_reward, is_featured) VALUES
  ('Reclaim', 'Reclaim.ai is an AI-powered calendar assistant that automatically schedules your tasks, meetings, and breaks to boost productivity. Free to try  earn Flowva Points when you sign up!', 'Automate and Optimize Your Schedule', 'https://reclaim.ai', 50, true);
```

### 7. Configure Supabase Auth

1. Go to **Authentication**  **Providers**
2. Make sure **Email** is enabled
3. (Optional) Disable "Confirm email" for easier testing
4. Go to **Authentication**  **URL Configuration**
5. Set **Site URL** to: `http://localhost:5173`

### 8. Get your API Keys

1. Go to **Project Settings**  **API**
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon public** key (it's a long JWT starting with `eyJ...`)

### 9. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

>  **Important:** The anon key is a long JWT string (200+ characters) starting with `eyJ`. Do NOT use the service_role key.

### 10. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

##  Project Structure

```
src/
 components/
    layout/
       Layout.tsx       # Main layout wrapper
       Sidebar.tsx      # Navigation sidebar
       Header.tsx       # Top header with notifications
    rewards/
        EarnPointsTab.tsx    # Earn Points tab container
        RedeemRewardsTab.tsx # Redeem Rewards tab container
        PointsBalance.tsx    # Points balance card
        DailyStreak.tsx      # Daily streak tracker
        SpotlightTool.tsx    # Featured tool spotlight
        EarnMorePoints.tsx   # Ways to earn points
        ReferAndEarn.tsx     # Referral section
        RewardCard.tsx       # Individual reward card
 context/
    AuthContext.tsx      # Authentication state management
 lib/
    supabase.ts          # Supabase client initialization
    database.types.ts    # TypeScript types for database
 pages/
    AuthPage.tsx         # Login/Signup page
    RewardsHub.tsx       # Main rewards hub page
 App.tsx                  # App routing
 main.tsx                 # App entry point
 index.css                # Global styles + Tailwind
```

##  Features

### Authentication
- Email + Password sign up/sign in
- Protected routes (redirects to login if not authenticated)
- Persistent sessions via Supabase Auth

### Points System
- Track total points balance
- Progress bar toward reward thresholds
- Multiple ways to earn points (signup bonus, daily streak, referrals)

### Daily Streak
- Claim daily bonus (+5 points)
- Visual streak counter
- Weekday indicator showing current day

### Referral Program
- Unique referral link per user
- Copy to clipboard functionality
- Social sharing (Facebook, Twitter/X, LinkedIn, WhatsApp)
- Track referral count and points earned

### Rewards Redemption
- Browse available rewards
- Filter by: All, Unlocked, Locked, Coming Soon
- Redeem rewards (deducts points)
- Visual locked/unlocked states

### UX Polish
- Loading skeletons for all data fetches
- Toast notifications for actions and errors
- Responsive layout (desktop/tablet)
- Smooth transitions and hover states

##  Assumptions & Trade-offs

1. **Simplified Referral Tracking:** Referrals are stored in the database but the full referral signup flow (verifying referral codes during registration) is not implemented. This would require additional backend logic.

2. **No Email Verification Flow:** For easier testing, email confirmation can be disabled. In production, you'd enable this.

3. **Reward Fulfillment:** Clicking "Redeem" creates a database record and deducts points, but actual fulfillment (sending gift cards, bank transfers) would require additional backend services.

4. **Spotlight Claims:** Users can claim spotlight points multiple times. In production, you'd track claims per user per spotlight tool.

5. **Mobile Layout:** Fully responsive with hamburger menu on mobile devices.

6. **Profile Creation:** Profiles are created via the app's signup form. If a user is created directly in Supabase dashboard, they won't have a profile record until they sign in through the app.

##  Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. New site from Git  Select your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables in Site settings
7. Deploy!

##  Troubleshooting

### "Database error creating new user"
This usually means there's a trigger on `auth.users` expecting a column that doesn't exist. Run:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
```

### 500 Error on signup/login
Check that your `VITE_SUPABASE_ANON_KEY` is the correct JWT key (starts with `eyJ`), not another key format.

### Infinite loading spinner
Check browser console for errors. Usually means a Supabase query is failing due to RLS policies or missing data.

### "RLS policy already exists" error
Run `DROP POLICY IF EXISTS "policy_name" ON table_name;` before creating the policy.

##  License

MIT

---

Built with  for the Flowva assessment
