-- Legal Consultation Platform - Initial Schema
-- Version: 001
-- Description: Initial database schema for legal consultation platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('CUSTOMER', 'LAWYER', 'ADMIN')),
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Consultation sessions table
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    legal_domain VARCHAR(50) NOT NULL CHECK (legal_domain IN (
        'CIVIL', 'CRIMINAL', 'LAND', 'LABOR', 'COMMERCIAL',
        'FAMILY', 'INTELLECTUAL', 'TAX', 'ADMINISTRATIVE', 'INSURANCE'
    )),
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED' CHECK (status IN (
        'CREATED', 'ASSIGNED', 'STARTED', 'WAITING_PAYMENT',
        'COMPLETED', 'CANCELLED', 'EXPIRED', 'ESCALATED'
    )),
    session_type VARCHAR(50) NOT NULL DEFAULT 'INITIAL' CHECK (session_type IN (
        'INITIAL', 'FOLLOWUP', 'EMERGENCY'
    )),
    pricing_type VARCHAR(50) CHECK (pricing_type IN (
        'FREE', 'PAID_HOURLY', 'PAID_FIXED', 'SUBSCRIPTION'
    )),
    price_amount DECIMAL(12, 2),
    price_currency VARCHAR(3) DEFAULT 'VND',
    title VARCHAR(255),
    description TEXT,
    customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
    customer_feedback TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_customer_id ON consultation_sessions(customer_id);
CREATE INDEX idx_sessions_lawyer_id ON consultation_sessions(lawyer_id);
CREATE INDEX idx_sessions_status ON consultation_sessions(status);
CREATE INDEX idx_sessions_legal_domain ON consultation_sessions(legal_domain);
CREATE INDEX idx_sessions_created_at ON consultation_sessions(created_at);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES consultation_sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL CHECK (sender_type IN (
        'CUSTOMER', 'LAWYER', 'AI_ASSISTANT', 'SYSTEM'
    )),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'TEXT' CHECK (content_type IN (
        'TEXT', 'IMAGE', 'DOCUMENT', 'LINK', 'SYSTEM_EVENT'
    )),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_messages_created_at ON chat_messages(created_at);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    session_id UUID,
    resource_type VARCHAR(100),
    resource_id UUID,
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT'
    )),
    ip_address INET,
    user_agent TEXT,
    content_hash VARCHAR(64),
    result VARCHAR(50) DEFAULT 'SUCCESS' CHECK (result IN (
        'SUCCESS', 'FAILURE', 'PARTIAL'
    )),
    error_code VARCHAR(50),
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_session_id ON audit_log(session_id);
CREATE INDEX idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX idx_audit_log_event_timestamp ON audit_log(event_timestamp);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Legal documents table (for RAG)
CREATE TABLE legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    legal_domain VARCHAR(50) CHECK (legal_domain IN (
        'CIVIL', 'CRIMINAL', 'LAND', 'LABOR', 'COMMERCIAL',
        'FAMILY', 'INTELLECTUAL', 'TAX', 'ADMINISTRATIVE', 'INSURANCE'
    )),
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    effective_date DATE,
    expiry_date DATE,
    content TEXT,
    content_summary TEXT,
    article_count INTEGER,
    file_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_legal_docs_domain ON legal_documents(legal_domain);
CREATE INDEX idx_legal_docs_type ON legal_documents(document_type);
CREATE INDEX idx_legal_docs_effective_date ON legal_documents(effective_date);

-- AI requests table (for tracking and caching)
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(255) UNIQUE NOT NULL,
    session_id UUID REFERENCES consultation_sessions(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
        'LEGAL_REFERENCE', 'CONTRACT_DRAFT', 'DOCUMENT_SUMMARY',
        'SESSION_SUMMARY', 'QUESTION_ANSWER', 'SIMILAR_CASE'
    )),
    query TEXT NOT NULL,
    response TEXT,
    sources JSONB DEFAULT '[]',
    confidence_score DECIMAL(5, 4),
    processing_time_ms INTEGER,
    mode VARCHAR(20) DEFAULT 'BALANCED' CHECK (mode IN (
        'FAST', 'BALANCED', 'THOROUGH'
    )),
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ESCALATED'
    )),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_requests_session_id ON ai_requests(session_id);
CREATE INDEX idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX idx_ai_requests_type ON ai_requests(request_type);
CREATE INDEX idx_ai_requests_status ON ai_requests(status);
CREATE INDEX idx_ai_requests_created_at ON ai_requests(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON consultation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_docs_updated_at
    BEFORE UPDATE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
