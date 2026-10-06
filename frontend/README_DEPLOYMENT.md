# TourFlow AI - Traveler Frontend

## Overview

This is the traveler-facing frontend for TourFlow AI, built with Next.js 15, TypeScript, Tailwind CSS, and Supabase Auth.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (SSR)
- **UI Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── confirm/
│   └── traveler/            # Traveler dashboard and pages
│       ├── create-trip/
│       └── trips/[tripId]/
│           ├── page.tsx     # Itinerary view
│           ├── bookings/
│           ├── budget/
│           └── assistant/
├── components/traveler/     # Traveler-specific components
├── services/traveler/       # API service layer
├── types/traveler/          # TypeScript types
└── lib/                     # Utility functions
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Vercel Deployment

### Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- Supabase project set up

### Deployment Steps

1. **Connect Repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `NEXT_PUBLIC_API_BASE_URL` (your production API URL)

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `frontend`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically deploy on every push to main branch

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Features Implemented

### Authentication
- ✅ Sign up with email/password
- ✅ Sign in
- ✅ Password recovery
- ✅ Email confirmation
- ✅ Protected routes via middleware

### Traveler Dashboard
- ✅ Trip overview with stats
- ✅ Trip cards with status indicators
- ✅ Empty state handling
- ✅ Responsive navigation

### Trip Management
- ✅ Multi-step trip creation wizard
- ✅ Trip preferences collection
- ✅ Form validation

### Itinerary
- ✅ Timeline view with day-by-day breakdown
- ✅ Activity status indicators
- ✅ Cost display (estimated vs confirmed)
- ✅ Empty state handling

### Budget Tracking
- ✅ Budget summary with progress
- ✅ Category breakdown
- ✅ Cost comparison table
- ✅ Over/under budget indicators

### Bookings
- ✅ Booking list with status
- ✅ Booking details display
- ✅ Provider and reference information
- ✅ Empty state handling

### Disruption & Recovery
- ✅ Disruption alerts with severity
- ✅ Impact summary (at-risk vs unaffected)
- ✅ Recovery options comparison
- ✅ Recovery approval flow

### AI Assistant
- ✅ Chat interface
- ✅ Message history
- ✅ Simulated responses (demo mode)
- ✅ Context-aware suggestions

### API Integration
- ✅ Service layer for all endpoints
- ✅ Type-safe API calls
- ✅ Error handling
- ✅ Authentication token management

## API Integration

The frontend is designed to integrate with the backend API. All API calls are centralized in the `services/traveler/` directory:

- `trips.ts` - Trip CRUD operations
- `itinerary.ts` - Itinerary management
- `api.ts` - Bookings, budget, disruptions, recovery, assistant

### Using the API Service Layer

```typescript
import { createClient } from '@/lib/supabase/client'
import { getTrips } from '@/services/traveler/trips'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  const trips = await getTrips(session.access_token)
}
```

## Mock Data

Currently, the application uses mock data for demonstration purposes. Mock data is clearly marked with comments:

```typescript
// TODO: Replace with actual API call
const mockData = getMockData()
```

To integrate with the real backend:
1. Ensure environment variables are set correctly
2. Replace mock data calls with actual API service calls
3. Remove or comment out mock data functions

## Security Considerations

- ✅ Authentication tokens stored securely in Supabase session
- ✅ Protected routes via middleware
- ✅ No secrets in client-side code
- ✅ Environment variables properly configured
- ✅ API calls include authorization headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Server-side rendering for initial page loads
- Client-side navigation for subsequent pages
- Optimized images and assets
- Code splitting via Next.js automatic optimization

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:
1. Clear browser cookies and localStorage
2. Verify Supabase environment variables
3. Check Supabase dashboard for user status
4. Verify middleware configuration

### Build Errors

If build fails:
1. Delete `.next` folder and `node_modules`
2. Run `npm install`
3. Run `npm run build`
4. Check for TypeScript errors with `npm run type-check`

### API Connection Issues

If API calls fail:
1. Verify `NEXT_PUBLIC_API_BASE_URL` is correct
2. Check backend is running
3. Verify CORS configuration on backend
4. Check network tab in browser DevTools

## Contributing

This frontend is part of the TourFlow AI hackathon project. Follow the contribution guidelines in the main repository.

## License

[Your License Here]
