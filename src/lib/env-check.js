const PLACEHOLDER_SUPABASE_URL = 'https://your-project-id.supabase.co'
const PLACEHOLDER_SUPABASE_ANON_KEY = 'your_supabase_publishable_key'

export function isSupabaseConfigured(env = import.meta.env) {
  const supabaseUrl = env?.VITE_SUPABASE_URL?.trim()
  const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY?.trim()

  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== PLACEHOLDER_SUPABASE_URL &&
      supabaseAnonKey !== PLACEHOLDER_SUPABASE_ANON_KEY,
  )
}
