// backend/config/supabase.js

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const environmentPath = fileURLToPath(
  new URL("../.env", import.meta.url)
);

dotenv.config({
  path: environmentPath,
  quiet: true,
});

const rawSupabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY;

if (!rawSupabaseUrl) {
  throw new Error(
    "Missing SUPABASE_URL in .env"
  );
}

if (!supabaseKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

let supabaseUrl;

try {
  const parsedUrl = new URL(rawSupabaseUrl);
  supabaseUrl = parsedUrl.origin;
} catch {
  throw new Error(
    "SUPABASE_URL must be a valid URL."
  );
}

if (!supabaseUrl.endsWith(".supabase.co")) {
  throw new Error(
    "SUPABASE_URL must be a Supabase project URL ending in .supabase.co."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default supabase;
