
import { createClient } from '@supabase/supabase-js';

// Configuration for Project: Club Connect (MITS CCMS)
const supabaseUrl = 'https://ysmxzrwbqpxfjscqwrmw.supabase.co';
const supabaseAnonKey = 'sb_publishable_r3HxrNJ2kuoitC2J1Fu8tQ_10VOPT62';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
