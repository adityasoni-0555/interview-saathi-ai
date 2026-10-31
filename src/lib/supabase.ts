import { createClient } from "@supabase/supabase-js";

// Only public, browser-safe values belong here. The Claude API key lives
// exclusively in the Supabase Edge Function secret ANTHROPIC_API_KEY.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigError =
  !supabaseUrl || !supabasePublishableKey
    ? "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local and restart the dev server."
    : null;

export const supabase = createClient(
  supabaseUrl || "http://localhost:54321",
  supabasePublishableKey || "missing-key",
);
