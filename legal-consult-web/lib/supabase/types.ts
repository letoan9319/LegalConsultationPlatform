export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Role = 'customer' | 'lawyer' | 'admin'

export type SessionStatus = 'pending' | 'active' | 'completed' | 'cancelled'

export type SessionType = 'chat' | 'video' | 'document_review'

export type LegalDomain =
  | 'civil'
  | 'criminal'
  | 'land'
  | 'labor'
  | 'commercial'
  | 'family'
  | 'intellectual'
  | 'tax'
  | 'administrative'
  | 'insurance'

export type PricingType = 'free' | 'fixed' | 'hourly'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: Role
          phone: string | null
          avatar_url: string | null
          is_verified: boolean
          license_number: string | null
          specializations: LegalDomain[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: Role
          phone?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          license_number?: string | null
          specializations?: LegalDomain[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: Role
          phone?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          license_number?: string | null
          specializations?: LegalDomain[] | null
          updated_at?: string
        }
      }
      consultation_sessions: {
        Row: {
          id: string
          customer_id: string | null
          lawyer_id: string | null
          legal_domain: LegalDomain
          session_type: SessionType
          status: SessionStatus
          title: string
          description: string | null
          initial_question: string | null
          pricing_type: PricingType
          price: number | null
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          lawyer_id?: string | null
          legal_domain: LegalDomain
          session_type?: SessionType
          status?: SessionStatus
          title: string
          description?: string | null
          initial_question?: string | null
          pricing_type?: PricingType
          price?: number | null
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          lawyer_id?: string | null
          status?: SessionStatus
          started_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          session_id: string | null
          sender_id: string | null
          content: string
          message_type: 'text' | 'file' | 'system'
          is_ai_response: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender_id?: string | null
          content: string
          message_type?: 'text' | 'file' | 'system'
          is_ai_response?: boolean
          created_at?: string
        }
        Update: {
          content?: string
        }
      }
      legal_documents: {
        Row: {
          id: string
          external_id: string | null
          title: string
          document_type: string | null
          issued_date: string | null
          issuer: string | null
          source_url: string | null
          raw_content: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          external_id?: string | null
          title: string
          document_type?: string | null
          issued_date?: string | null
          issuer?: string | null
          source_url?: string | null
          raw_content?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          raw_content?: string | null
          metadata?: Json | null
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Session = Database['public']['Tables']['consultation_sessions']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type LegalDocument = Database['public']['Tables']['legal_documents']['Row']
