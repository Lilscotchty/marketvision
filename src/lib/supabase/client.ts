// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // --- DEBUGGING BLOCK ---
  if (typeof window !== 'undefined') {
    if (!envUrl || !envKey) {
      console.error("🚨 CRITICAL: Supabase Keys are MISSING. Falling back to placeholders.");
    } else if (envUrl.startsWith('"') || envUrl.endsWith('"')) {
      console.error("🚨 CRITICAL: Keys have extra quotes! Go to Vercel and remove the \" \" marks.");
    } else {
      console.log("✅ Supabase Connection:", envUrl.substring(0, 12) + "...");
    }
  }
  // -----------------------

  const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
  const supabaseKey = envKey || 'placeholder-key';

  return createBrowserClient(supabaseUrl, supabaseKey);
}