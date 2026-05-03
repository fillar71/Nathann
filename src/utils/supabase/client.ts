import { createClient } from '@supabase/supabase-js';

// Get keys from Vite's import.meta.env, with placeholders to prevent crashing 
// if the user hasn't set up the .env variables yet.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
