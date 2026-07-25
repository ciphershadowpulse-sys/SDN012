import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://url-supabase-anda.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'anon-key-anda'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)