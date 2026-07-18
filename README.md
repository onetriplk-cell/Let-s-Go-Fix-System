# Let's Go Fix

A digital roadside assistance platform connecting stranded vehicle owners with nearby service providers (garages, mechanics, tow trucks, tyre shops, battery services, fuel delivery, and electricians) in real time.

## Structure

```
01. Project Documentation/                              Project docs
Let's Go Fix Database/                                   Supabase schema, migrations, RLS policies
Let's Go Fix Admin Web-Based System/                      Admin dashboard (React + Vite + Tailwind)
Let's Go Fix Service Provider Web System/                 Provider portal (React + Vite + Tailwind)
Let's Go Fix Customer Progressive Web Application (PWA)/  Customer app (React + Vite + Tailwind + Mapbox)
```

## Stack

- **Backend**: Supabase (PostgreSQL + PostGIS, Auth, Realtime, Storage)
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS v4
- **State/data**: Zustand, TanStack Query, TanStack Table
- **Forms**: React Hook Form + Zod
- **Maps**: Mapbox GL JS (Customer PWA), Leaflet (Admin/Provider)

## Running locally

Each app is independent. From inside an app folder:

```bash
cp .env.example .env   # fill in your own keys
npm install
npm run dev
```

| App | Port |
|---|---|
| Admin | 5173 |
| Service Provider | 5174 |
| Customer PWA | 5175 |

Database migrations live in `Let's Go Fix Database/supabase/migrations/`.

## Status

Prototype build — core flows (auth, provider verification, booking request/accept/track, reviews) are functional and Realtime-synced across all three apps. Not production-hardened.
