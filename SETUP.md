# Setup Instructions

## Quick Start

1. **Install dependencies** (already done):
```bash
npm install
```

2. **Create a Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to initialize

3. **Set up database tables**:
   - In your Supabase project, go to the SQL Editor
   - Copy and paste the contents of `supabase/migrations/create_tables.sql`
   - Click "Run" to execute the SQL

4. **Configure environment variables**:
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://klvatuhplfniylnxfkvu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
   - You can find the anon key in your Supabase project under Settings > API
   - The Supabase URL is typically `https://[your-project-id].supabase.co`
   - Note: The PostgreSQL connection string you have is for direct database access (server-side only), but for client-side access in Next.js, you need the Supabase URL and anon key

5. **Run the development server**:
```bash
npm run dev
```

6. **Access the application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with credentials:
     - Username: `admin`
     - Password: `admin123`

## Project Structure

```
app/
├── (auth)/
│   └── login/              # Login page
├── (main)/                 # Protected routes
│   ├── dashboard/          # Dashboard with recent items
│   ├── invoices/           # Invoice list
│   │   └── new/            # Create new invoice
│   ├── estimates/          # Estimate list
│   │   └── new/            # Create new estimate
│   └── settings/           # Company settings
components/
├── AuthGuard.tsx           # Authentication wrapper
├── Navbar.tsx              # Navigation bar
└── LineItems.tsx           # Line items table component
lib/
├── auth.ts                 # Authentication utilities
├── supabase.ts             # Supabase client
└── types.ts                # TypeScript type definitions
```

## Features Implemented

✅ **Authentication**: Hardcoded login system (ready for Firebase integration)
✅ **Company Settings**: Configure your ABN, company name, and address
✅ **Invoice Management**: Create, view, edit, and delete invoices
✅ **Estimate Management**: Create, view, edit, and delete estimates
✅ **Line Items**: Add multiple line items with GST calculation
✅ **Dashboard**: Overview of recent invoices and estimates
✅ **Material UI**: Modern, responsive UI design

## Next Steps

After setting up Supabase:

1. **Configure Company Settings**: Go to Settings and enter your company details
2. **Create Your First Invoice**: Go to Invoices > Create Invoice
3. **Create Your First Estimate**: Go to Estimates > Create Estimate

## Deployment to Vercel

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy!

## Future Enhancements

- PDF export functionality
- Firebase Authentication integration
- Email sending for invoices/estimates
- Payment tracking
- Client management system
- Financial reports and analytics


