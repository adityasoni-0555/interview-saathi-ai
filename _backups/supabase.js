import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase key loaded:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);