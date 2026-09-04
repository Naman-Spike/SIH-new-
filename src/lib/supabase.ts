import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://enmqwjldwpwrvdvhjqjq.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubXF3amxkd3B3cnZkdmhqcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODIzNTAsImV4cCI6MjEwMzc1ODM1MH0.grKRs_cEpY9StENl9YogVKPSS3Pd8w9IQReQSc39TiU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
