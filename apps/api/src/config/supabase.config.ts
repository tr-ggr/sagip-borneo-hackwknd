export interface SupabaseRuntimeConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  supabaseBucket: string;
}

/**
 * Returns Supabase config when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 * Returns null when either is missing so the API can start without Supabase (e.g. local dev).
 */
export function getSupabaseRuntimeConfig(): SupabaseRuntimeConfig | null {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }
  const supabaseBucket = process.env.SUPABASE_BUCKET?.trim() || 'wira-borneo';
  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    supabaseBucket,
  };
}
