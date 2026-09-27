-- Supabase Migration: Initial Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
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
  legal_domain TEXT NOT NULL CHECK (legal_domain IN ('civil', 'criminal', 'land', 'labor', 'commercial', 'family', 'intellectual', 'tax', 'administrative', 'insurance')),
  session_type TEXT CHECK (session_type IN ('chat', 'video', 'document_review')) DEFAULT 'chat',
  status TEXT CHECK (status IN ('pending', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
  title TEXT NOT NULL,
  description TEXT,
  initial_question TEXT,
  pricing_type TEXT CHECK (pricing_type IN ('free', 'fixed', 'hourly')) DEFAULT 'free',
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
  document_type TEXT,
  issued_date DATE,
  issuer TEXT,
  source_url TEXT,
  raw_content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_customer ON public.consultation_sessions(customer_id);
CREATE INDEX idx_sessions_lawyer ON public.consultation_sessions(lawyer_id);
CREATE INDEX idx_sessions_status ON public.consultation_sessions(status);
CREATE INDEX idx_messages_session ON public.messages(session_id);
CREATE INDEX idx_documents_type ON public.legal_documents(document_type);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can view all profiles, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions: Users can view sessions they're part of
CREATE POLICY "Users can view own sessions" ON public.consultation_sessions
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = lawyer_id);

CREATE POLICY "Users can create sessions" ON public.consultation_sessions
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own sessions" ON public.consultation_sessions
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = lawyer_id);

-- Messages: Users can view/insert messages for sessions they're part of
CREATE POLICY "Users can view messages in sessions they're part of" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.consultation_sessions
      WHERE id = session_id
      AND (customer_id = auth.uid() OR lawyer_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.consultation_sessions
      WHERE id = session_id
      AND (customer_id = auth.uid() OR lawyer_id = auth.uid())
    )
  );

-- Legal Documents: Everyone can read
CREATE POLICY "Anyone can read legal documents" ON public.legal_documents
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert legal documents" ON public.legal_documents
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
