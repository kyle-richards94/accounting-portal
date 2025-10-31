# Accounting Portal

A personal web-based SPA for managing invoices and estimates. Life Xero, without all the additional functionality.

## Features

- ✅ Authentication with hardcoded credentials (Firebase ready)
- ✅ Company Settings - Configure ABN, Company Name, Address
- ✅ Invoice Management - Create, edit, view, and delete invoices
- ✅ Estimate Management - Create, edit, view, and delete estimates
- ✅ Line Items Support - Add items with description, quantity, reuse price, GST handling
- ✅ GST Calculation - Automatic GST calculation at 10%
- ✅ Dashboard - Overview of recent invoices and estimates

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Material UI
- **Backend**: Next.js API Routes (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Hardcoded credentials (admin/admin123)
- **Deployment**: Vercel

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a Supabase project at [supabase.com](https://supabase.com)

3. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migrations:
   - Go to your Supabase project SQL Editor
   - Copy and paste the contents of `supabase/migrations/create_tables.sql`
   - Execute the SQL

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Credentials

- Username: `admin`
- Password: `admin123`

## Project Structure

```
app/
├── (auth)/
│   └── login/          # Login page
├── (main)/             # Protected routes
│   ├── dashboard/      # Dashboard
│   ├── invoices/          # Invoice management
│   ├── estimates/      # Estimate management
│   └── settings/       # Company settings
├── api/                # API routes
components/             # React components
lib/                    # Utilities and types
supabase/               # Database migrations
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your Supabase environment variables
4. Deploy!

## Future Enhancements

- Firebase Authentication integration
- PDF export functionality
- Email sending for invoices/estimates
- Payment tracking
- Client management
- Financial reports
