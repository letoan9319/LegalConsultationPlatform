# Plan: Deploy lên Vercel + Supabase

## Context

User muốn deploy Legal Consultation Platform lên Vercel (frontend/serverless) và Supabase (database/auth). Cần tinh chỉnh codebase và tìm nguồn dataset luật Việt Nam.

## Current Architecture

```
legal-consult-web/          # Static HTML/CSS/JS (vanilla - NO framework!)
apps/chat-service/          # Python FastAPI backend
services/                    # Kafka consumer microservices (audit, ai, metrics, etc.)
```

| Component | Current | Target |
|-----------|---------|--------|
| Frontend | Vanilla HTML/CSS/JS | Next.js + Vercel |
| Backend | FastAPI + uvicorn | Next.js API Routes / Serverless |
| Database | PostgreSQL 16 | Supabase Postgres |
| Real-time | Redis pub/sub | Supabase Realtime |
| Auth | JWT (python-jose) | Supabase Auth |
| Event Streaming | Kafka 3.6.0 | Supabase Edge Functions |
| Search | Meilisearch | Supabase Full-Text Search |

---

## Phase 1: Frontend Migration (Week 1)

### ✅ 1.1 Convert vanilla JS → Next.js

**Đã tạo:**
- [x] `legal-consult-web/package.json`
- [x] `legal-consult-web/next.config.js`
- [x] `legal-consult-web/tsconfig.json`
- [x] `legal-consult-web/tailwind.config.ts`
- [x] `legal-consult-web/app/layout.tsx`
- [x] `legal-consult-web/app/page.tsx`
- [x] `legal-consult-web/app/dashboard/page.tsx`
- [x] `legal-consult-web/lib/supabase/client.ts`
- [x] `legal-consult-web/lib/supabase/server.ts`
- [x] `legal-consult-web/lib/supabase/types.ts`
- [x] `legal-consult-web/middleware.ts`
- [x] `legal-consult-web/.env.example`
- [x] `legal-consult-web/supabase/migrations/001_initial_schema.sql`

**Di chuyển:**
- `index.html` → `app/page.tsx`
- `css/` → `app/globals.css` + Tailwind
- `js/app.js` → React components + Zustand state

### 1.2 Setup Supabase Client

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 1.3 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Kafka Alternatives (Free Tier)

### Why Kafka doesn't fit Vercel/Serverless

- Kafka cần persistent TCP connections
- Serverless functions có cold starts
- Managed Kafka (Confluent, AWS MSK) từ $0.10/GB

### Free Kafka Options

| Provider | Free Tier | Limitations |
|---------|-----------|-------------|
| **Confluent Cloud** | 1GB storage, 100MB/day | Need credit card, limited |
| **Redpanda Cloud** | 5GB storage | Best for dev |
| **Self-hosted on OCI** | Unlimited | $10-20/month VPS |

### Recommended: Replace Kafka with Supabase

**Thay Kafka bằng Supabase Realtime + Edge Functions:**

```
Current (Kafka):                    Target (Supabase):
┌─────────────────┐              ┌─────────────────────────┐
│ Kafka Producer   │ ───────────► │ Supabase Realtime       │
│ Kafka Broker    │              │ + Edge Functions        │
│ Kafka Consumer  │              │ + Database Triggers     │
│ Schema Registry │              │ + pg_cron               │
└─────────────────┘              └─────────────────────────┘
```

### Event Types → Supabase Equivalent

| Kafka Event | Supabase Alternative |
|-------------|---------------------|
| `chat.message` | Supabase Realtime broadcast |
| `consultation.created` | Database trigger → Edge Function |
| `audit.log` | Direct DB insert |
| `ai.request` | Edge Function + pg_jobs |
| `search.index` | Database trigger |

### If you still need Kafka...

**Option 1: Confluent Cloud Free (1GB)**
- Free for 1GB storage, 100MB/day throughput
- Cần credit card đăng ký
- Không production-ready

**Option 2: Self-hosted on OCI ($10-20/month)**
- Dùng Docker trên OCI free tier hoặc cheap VPS
- Install Kafka KRaft mode (không cần ZooKeeper)
- Kết nối từ Supabase Edge Functions

**Option 3: Redis Streams (Free tier Redis)**
- Supabase Pro plan có 8GB Redis
- Hỗ trợ streams API tương tự Kafka
- Single consumer, not multi-partition

### Recommendation

**Drop Kafka hoàn toàn, dùng Supabase Realtime + Edge Functions.** Đủ cho:
- Real-time chat
- Event-driven AI processing
- Audit logging
- Background jobs (pg_cron)

---

## Phase 2: Backend Adaptation (Week 2)

### 2.1 API Routes (thay thế FastAPI)

Chuyển `apps/chat-service/` endpoints → Next.js API Routes:

| File hiện tại | Target mới |
|---------------|------------|
| `api/routes/sessions.py` | `app/api/sessions/route.ts` |
| `api/routes/messages.py` | `app/api/messages/route.ts` |
| `api/auth.py` | Supabase Auth (built-in) |

### 2.2 WebSocket → Supabase Realtime

Thay Redis pub/sub bằng Supabase Realtime subscriptions:

```typescript
// Thay vì ws manager hiện tại
const supabase = createClient(url, key)
supabase.channel('session-123')
  .on('broadcast', { event: 'message' }, handleMessage)
  .subscribe()
```

### 2.3 Xóa Kafka Dependencies

- Xóa `kafka/` directory
- Xóa `aiokafka` trong requirements
- Xóa các consumer services (`audit-consumer/`, `ai-consumer/`, etc.)
- Thay bằng Supabase Edge Functions + Realtime

---

## Phase 3: Database Migration (Week 2)

### 3.1 Export Schema

```bash
# Từ PostgreSQL hiện tại
pg_dump -h localhost -U postgres -d legal_consultation \
  --schema-only > schema.sql
```

### 3.2 Import Supabase

1. Tạo project mới trên Supabase
2. Chạy schema.sql trong SQL Editor
3. Bật Row Level Security (RLS) policies

### 3.3 Supabase Tables Mapping

| Table | Notes |
|-------|-------|
| `users` | Dùng auth.users + profile table |
| `consultation_sessions` | Giữ nguyên schema |
| `messages` | Giữ nguyên schema |
| `legal_documents` | Tạo mới cho dataset |

---

## DATA MIGRATION PLAN

### Step 1: Setup Supabase Project

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link to project
cd legal-consult-web
supabase init
supabase link --project-ref <your-project-ref>
```

### Step 2: Create Supabase Schema

```sql
-- supabase/migrations/001_initial_schema.sql

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'lawyer', 'admin')) DEFAULT 'customer',
  phone TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  license_number TEXT,
  specializations TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultation Sessions
CREATE TABLE public.consultation_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lawyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  legal_domain TEXT NOT NULL,
  session_type TEXT CHECK (session_type IN ('chat', 'video', 'document_review')),
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT,
  initial_question TEXT,
  pricing_type TEXT CHECK (pricing_type IN ('free', 'fixed', 'hourly')),
  price DECIMAL(10,2),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.consultation_sessions(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'file', 'system')) DEFAULT 'text',
  is_ai_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legal Documents (for RAG)
CREATE TABLE public.legal_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  document_type TEXT, -- 'law', 'decree', 'circular', etc.
  issued_date DATE,
  issuer TEXT,
  source_url TEXT,
  raw_content TEXT, -- For storing full text
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Example: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON public.consultation_sessions
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = lawyer_id);

CREATE POLICY "Users can insert own sessions" ON public.consultation_sessions
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Everyone can read legal documents
CREATE POLICY "Anyone can read legal documents" ON public.legal_documents
  FOR SELECT USING (true);
```

### Step 3: Export & Import Data

```bash
# Export from current PostgreSQL
pg_dump -h localhost -U postgres -d legal_consultation \
  --data-only \
  --table=users \
  --table=consultation_sessions \
  --table=messages \
  > data.sql

# Import to Supabase (via SQL Editor or CLI)
supabase db push
# Or manually paste data.sql content into Supabase SQL Editor
```

### Step 4: Setup Qdrant for Vectors

```bash
# 1. Create Qdrant Cloud account at https://cloud.qdrant.io
# 2. Create new cluster (free tier)

# 3. Install Qdrant client
npm install @qdrant/js-client-rest

# 4. Create collection
curl -X PUT 'https://your-cluster.qdrant.cloud:6333/collections/legal-documents' \
  -H 'Content-Type: application/json' \
  -H 'api-key: your-api-key' \
  -d '{
    "vectors": {
      "size": 384,
      "distance": "Cosine"
    }
  }'
```

### Step 5: Import Legal Dataset

```python
# scripts/import_legal_dataset.py
from datasets import load_dataset
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from sentence_transformers import SentenceTransformer

# Load dataset (filter to 10-20K docs)
dataset = load_dataset("th1nhng0/vietnamese-legal-documents", split="train")
dataset = dataset.select(range(15000))  # 15K docs

# Setup embedding model
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Connect to Qdrant
qdrant = QdrantClient(url="https://your-cluster.qdrant.cloud", api_key="your-key")
qdrant.recreate_collection("legal-documents", vectors_config=VectorParams(size=384, distance=Distance.COSINE))

# Chunk and embed
BATCH_SIZE = 100
for i in range(0, len(dataset), BATCH_SIZE):
    batch = dataset[i:i+BATCH_SIZE]

    # Chunk documents (~500 tokens each)
    chunks = []
    for doc in batch:
        text = doc['content']
        chunk_size = 500
        for j in range(0, len(text), chunk_size):
            chunks.append({
                'id': f"{doc['id']}_{j}",
                'text': text[j:j+chunk_size],
                'metadata': {
                    'title': doc.get('title', ''),
                    'type': doc.get('type', ''),
                    'source': 'vbpl.vn'
                }
            })

    # Embed chunks
    embeddings = model.encode([c['text'] for c in chunks])

    # Upload to Qdrant
    points = [
        PointStruct(id=c['id'], vector=emb.tolist(), payload={'text': c['text'], **c['metadata']})
        for c, emb in zip(chunks, embeddings)
    ]
    qdrant.upsert("legal-documents", points=points)
    print(f"Uploaded {len(points)} chunks")
```

### Step 6: Environment Variables

```bash
# .env.local (for Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# For RAG service
QDRANT_URL=https://your-cluster.qdrant.cloud
QDRANT_API_KEY=your-qdrant-key
GROQ_API_KEY=your-groq-key
```

---

## Phase 4: Auth Integration (Week 2)

### 4.1 Supabase Auth Setup

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  // ...
}
```

### 4.2 Protected Routes

- `/dashboard` → require auth
- `/chat/[session_id]` → require session access
- `/admin` → require admin role

---

## Vietnamese Legal Datasets (Dataset luật VN)

### Storage Math cho 10-20K docs

| Component | 10K docs | 20K docs |
|-----------|-----------|----------|
| Raw text (JSON) | ~250 MB | ~500 MB |
| Chunks (~500 tokens/chunk, ~4/doc) | 40K chunks | 80K chunks |
| Embeddings (384-dim, 1.5KB/chunk) | ~60 MB | ~120 MB |
| Source text (chunked) | ~100 MB | ~200 MB |
| HNSW index overhead | ~20% | ~20% |
| **Tổng vector storage** | **~192 MB** | **~384 MB** |

### Supabase Free Tier Fit?

| Resource | Free Limit | 10K docs | 20K docs | Status |
|----------|-------------|----------|----------|--------|
| DB Storage | 500 MB | ~150 MB | ~250 MB | ✅ OK |
| pgvector | ✅ Enabled | ✅ | ✅ | ✅ |
| Bandwidth | 2 GB/mo | TBD | TBD | ⚠️ |
| Edge Functions | 500K/mo | TBD | TBD | ✅ |

**结论: 10-20K docs VỪA ĐỦ free tier!** (cần optimize, không lưu raw JSON)

### Nguồn chính thức (Government Sources)

| Nguồn | URL | API | Giấy phép |
|--------|-----|-----|-----------|
| vbpl.vn (Bộ Tư pháp) | https://vbpl.vn | Không có | Public domain (Luật 104/2016) |
| congbao.chinhphu.vn | https://congbao.chinhphu.vn | Không có | Attribution required |
| luatvietnam.vn | https://luatvietnam.vn | Không có | Commercial subscription |
| thuvienphapluat.vn | https://thuvienphapluat.vn | Không có | Commercial subscription |

### Hugging Face Datasets (Khuyến nghị)

| Dataset | Kích thước | License | Mô tả |
|---------|------------|---------|--------|
| **[th1nhng0/vietnamese-legal-documents](https://huggingface.co/datasets/th1nhng0/vietnamese-legal-documents)** | 4.37 GB | **CC BY 4.0** | 171K văn bản từ vbpl.vn, có metadata + citation graph |
| **[YuITC/vietnam-legal-documents](https://huggingface.co/datasets/YuITC/vietnam-legal-documents)** | 566 MB | **Apache 2.0** | 119K Q&A pairs |
| **[l3mon3/VietNam_legal_dataset](https://huggingface.co/datasets/l3mon3/VietNam_legal_dataset)** | 139 MB | Not specified | 665K rows (transport, admin, AML, health) |
| **[TinPhan2007/vietnam-legal-qa-processed](https://huggingface.co/datasets/TinPhan2007/vietnam-legal-qa-processed)** | 5 MB | Not specified | 4.8K Q&A pairs (conversational) |

### GitHub RAG Pipelines (Tham khảo)

| Repository | Stars | License |
|------------|-------|---------|
| [Paparusi/legal-ai-agent](https://github.com/Paparusi/legal-ai-agent) | 208 | MIT |
| [mikeethanh/Vietnamese-Legal-Chatbot-RAG-System](https://github.com/mikeethanh/Vietnamese-Legal-Chatbot-RAG-System) | 20 | MIT |
| [tamnd/luatdo](https://github.com/tamnd/luatdo) | - | MIT |
| [meowwkhoa/End-To-End-Agentic-RAG...](https://github.com/meowwkhoa/End-To-End-Agentic-RAG-Workflow-for-Answering-Vietnamese-Legal-Traffic-questions) | 65 | Not specified |

### Khuyến nghị Data Pipeline

1. **Download dataset chính:**
   ```bash
   huggingface-cli download th1nhng0/vietnamese-legal-documents --repo-type dataset
   ```

2. **Import vào Supabase:**
   - Dùng Supabase Storage cho files
   - Dùng pgvector cho semantic search
   - Hoặc dùng Meilisearch self-hosted

3. **Build RAG pipeline:**
   - Embedding model: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
   - Vector DB: Supabase pgvector hoặc Qdrant

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Frontend)                     │
│  Next.js + React + Tailwind + Supabase Auth Client          │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    Supabase Free       │     │   Qdrant Cloud Free        │
│  - Postgres (500MB)    │     │   - 1 GB vector storage   │
│  - Auth (50K MAU)     │     │   - 100K vectors          │
│  - Realtime            │     │   - HNSW index            │
│  - Edge Functions      │     │                           │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              ▼                               ▼
      User data, sessions,            Legal document
      messages, profiles              embeddings
```

### Tại sao tách Vector DB?

1. **pgvector trong Postgres có giới hạn 500MB storage** - đã gần limit
2. **Qdrant Cloud Free cho 1GB vectors** - đủ cho 10-20K docs
3. **Hiệu năng vector search tốt hơn** pgvector cho large scale
4. **Hybrid search** (keyword + semantic) dễ implement

### Alternatives

| Option | Pros | Cons |
|--------|------|------|
| **Qdrant Cloud Free** | 1GB free, good perf | 100K vector limit |
| **Pinecone Starter** | 5GB free, serverless | Cần tách metadata |
| **Supabase Pro ($25)** | Tất trong 1 | 8GB limit |

## Files to Modify/Create

### ✅ Đã tạo (Next.js setup)
- [x] `legal-consult-web/package.json`
- [x] `legal-consult-web/next.config.js`
- [x] `legal-consult-web/tsconfig.json`
- [x] `legal-consult-web/tailwind.config.ts`
- [x] `legal-consult-web/app/layout.tsx`
- [x] `legal-consult-web/app/page.tsx`
- [x] `legal-consult-web/app/dashboard/page.tsx`
- [x] `legal-consult-web/app/dashboard/DashboardClient.tsx`
- [x] `legal-consult-web/lib/supabase/client.ts`
- [x] `legal-consult-web/lib/supabase/server.ts`
- [x] `legal-consult-web/lib/supabase/types.ts`
- [x] `legal-consult-web/middleware.ts`
- [x] `legal-consult-web/.env.example`
- [x] `legal-consult-web/supabase/migrations/001_initial_schema.sql`
- [x] `legal-consult-web/README.md`

### 📋 Còn lại (Next.js setup)
- [ ] `legal-consult-web/app/chat/page.tsx` - Sessions list page
- [ ] `legal-consult-web/app/chat/[id]/page.tsx` - Chat room
- [ ] `legal-consult-web/app/search/page.tsx` - Legal document search
- [ ] `legal-consult-web/app/ai/page.tsx` - AI Assistant
- [ ] `legal-consult-web/components/` - Shared components
- [ ] `legal-consult-web/lib/vector.ts` - Qdrant client
- [ ] `legal-consult-web/lib/ai.ts` - Groq AI integration

### Xóa
- [ ] `legal-consult-web/index.html` (chuyển sang Next.js)
- [ ] `legal-consult-web/js/` (chuyển sang React)
- [ ] `apps/chat-service/` (FastAPI backend)
- [ ] `services/` (Kafka consumers)
- [ ] `schemas/` (Avro schemas)

### Giữ lại (tham khảo/migrate)
- [ ] `apps/chat-service/src/models/` → `lib/db/schema.ts`

---

## Verification Plan

1. **Local dev:**
   ```bash
   cd legal-consult-web
   npm install
   npm run dev
   ```

2. **Supabase connection test:**
   ```bash
   npx supabase start
   supabase db push
   ```

3. **Vercel deploy:**
   ```bash
   npm i -g vercel
   vercel
   ```

4. **Test flows:**
   - [ ] Login/Register với Supabase Auth
   - [ ] Tạo consultation session
   - [ ] Real-time chat với Supabase Realtime
   - [ ] Search legal documents

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup Next.js + Supabase | 2-3 days |
| 2 | Migrate frontend components | 3-4 days |
| 3 | API routes + Realtime | 2-3 days |
| 4 | Database + Auth | 2 days |
| 5 | Legal dataset import | 2-3 days |
| 6 | Test + Deploy | 2 days |

**Total: ~2-3 weeks**
