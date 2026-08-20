import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://bakzbdnschvtfylcuczo.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJha3piZG5zY2h2dGZ5bGN1Y3pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MDI5MDYsImV4cCI6MjA5MzM3ODkwNn0.CXpSLFz7Q2yDZD3tvtqoUB-5pKtGU83LeTq_9Oh9P5g';

  cachedClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}
