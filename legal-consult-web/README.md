# Lexima - Legal Consultation Platform (Web)

Next.js frontend with Supabase backend for the Legal Consultation Platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **Vector Search**: Qdrant Cloud
- **AI**: Groq API (SLM inference)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 3. Run Database Migration

In Supabase SQL Editor, run the migration from `supabase/migrations/001_initial_schema.sql`

Or use Supabase CLI:

```bash
supabase db push
```

### 4. Setup Qdrant (Vector DB)

1. Create account at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Create a new cluster (free tier)
3. Add to `.env.local`:

```bash
QDRANT_URL=https://your-cluster.qdrant.cloud
QDRANT_API_KEY=your-qdrant-api-key
```

### 5. Setup Groq API (AI)

1. Get API key at [console.groq.com](https://console.groq.com)
2. Add to `.env.local`:

```bash
GROQ_API_KEY=your-groq-api-key
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel dashboard.

## Project Structure

```
legal-consult-web/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── dashboard/           # Protected dashboard
│   └── api/                 # API routes (future)
├── lib/
│   └── supabase/            # Supabase client utilities
├── components/              # React components (future)
├── supabase/
│   └── migrations/           # Database migrations
└── public/                  # Static assets
```

## Features

- [x] Landing page with auth modals
- [x] Supabase authentication
- [x] Protected dashboard routes
- [x] Session management
- [ ] Real-time chat (via Supabase Realtime)
- [ ] Legal document search
- [ ] AI assistant (RAG)
- [ ] Lawyer verification flow

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `QDRANT_URL` | Qdrant cluster URL |
| `QDRANT_API_KEY` | Qdrant API key |
| `GROQ_API_KEY` | Groq API key for AI |
