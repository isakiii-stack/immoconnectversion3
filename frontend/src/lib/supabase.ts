import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://adrpskwwdghhyhbieced.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcnBza3d3ZGdoaHloYmllY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzE3NTgsImV4cCI6MjA3NjgwNzc1OH0.L0_KDIKrQQbhOP9oUrrdMD0sl9gFXSAJRVjHsRXUsV8'

// Vérifier que les variables sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Listing {
  id: string
  user_id: string
  title: string
  description?: string
  price: number
  property_type: string
  location: string
  images?: string[]
  status: 'active' | 'sold' | 'rented'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  listing_id?: string
  content: string
  read_at?: string
  created_at: string
}
