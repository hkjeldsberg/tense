import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient<any, "tense"> | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Returns a client bound to the `tense` schema, or null when env is not configured. */
export function getSupabase() {
  if (!url || !key) return null;
  client ??= createClient(url, key, {
    db: { schema: "tense" },
    auth: { persistSession: false },
  });
  return client;
}
