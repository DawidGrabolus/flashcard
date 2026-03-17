import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  "https://wexgwuakhjarnctklced.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndleGd3dWFraGphcm5jdGtsY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MzUyNDQsImV4cCI6MjA4ODIxMTI0NH0.CWHVYaNMCjsRga7XPbih4LTIfBGmZpsUH_ngfRzF80U";

export const supabase = createClient(supabaseUrl, supabaseKey);
