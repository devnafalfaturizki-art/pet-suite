# PetCare Suite

A fullstack veterinary clinic and petshop management system built with React, TypeScript, Vite, Supabase, and modern frontend tooling.

## Quick Start

```bash
git clone <repo>
cd petcaresuite-main
npm install          # required before anything else
cp .env.example .env # fill in your Supabase URL and anon key
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Follow supabase/README.md for Supabase setup.

Push to GitHub → import to vercel.com → add env vars → deploy.

## Setup

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd petcare-suite
   ```

2. Copy the environment example

   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your Supabase credentials:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Install dependencies

   ```bash
   npm install
   ```

5. Start development server

   ```bash
   npm run dev
   ```

6. Run tests

   ```bash
   npm run test
   ```
