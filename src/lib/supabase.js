import { createClient } from '@supabase/supabase-js'
import { isSupabaseConfigured } from './env-check.js'

export const isSupabaseReady = isSupabaseConfigured()

export const supabase = isSupabaseReady
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null
