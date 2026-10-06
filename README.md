# AWS — TourFlow

This repository contains two Next.js applications:

- **Operator dashboard** at the repository root (`src/`): tools for bookings, trips, disruptions, recovery, vendors, customers, and audit.
- **Traveler application** in [`frontend/`](./frontend): traveler sign-in, trip planning, itineraries, bookings, budgeting, and trip assistance.

## Run the operator dashboard

From the repository root:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Run the traveler application

From the repository root:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

The traveler application runs at [http://localhost:3000](http://localhost:3000) when started separately.

Configure the Supabase environment variables required by each application before using authenticated features. Keep local environment files out of version control.
