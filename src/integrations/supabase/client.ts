// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vrmhwkarcxgnzgftwuhp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybWh3a2FyY3hnbnpnZnR3dWhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzMjc0MTgsImV4cCI6MjA1MTkwMzQxOH0.N-2YpXCeR__pCsKljuRYbdgz7d5zEyYs2Sxwg3c7nTY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);