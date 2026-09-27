# Deployment Checklist

## 1. Tạo Supabase Project

1. Go to https://supabase.com và tạo project mới
2. Copy credentials từ Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Run migration trong SQL Editor:
   - Copy content từ `supabase/migrations/001_initial_schema.sql`
   - Paste vào Supabase SQL Editor > Run

## 2. Tạo Qdrant Cluster (Vector DB)

1. Go to https://cloud.qdrant.io > Create Cluster (free tier)
2. Copy credentials:
   - `QDRANT_URL`
   - `QDRANT_API_KEY`

## 3. Tạo Groq API Key (AI)

1. Go to https://console.groq.com > API Keys > Create
2. Copy:
   - `GROQ_API_KEY`

## 4. Deploy lên Vercel

```bash
cd legal-consult-web

# Login Vercel
npm i -g vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - QDRANT_URL
# - QDRANT_API_KEY
# - GROQ_API_KEY
```

## 5. Verify Deployment

1. Visit your Vercel URL
2. Test registration/login
3. Check dashboard loads correctly
4. Verify database connection in Supabase dashboard

## 6. Import Legal Dataset (Optional)

Sau khi setup xong, chạy script import:
```bash
python scripts/import_legal_dataset.py
```

See `scripts/README.md` for details.
