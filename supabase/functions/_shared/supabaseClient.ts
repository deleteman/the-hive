import { createClient } from 'https://esm.sh/@supabase/supabase-js@^1.33.2'

export const supabaseClient = createClient(
  // Supabase API URL - env var exported by default when deployed.
  Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
  // Supabase API ANON KEY - env var exported by default when deployed.
  Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '',
)