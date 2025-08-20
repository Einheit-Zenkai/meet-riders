// Inside: frontend/src/lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js'

// The '!' tells TypeScript that we are sure these variables exist from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)