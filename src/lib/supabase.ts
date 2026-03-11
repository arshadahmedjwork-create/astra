import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ardtmmetmebzcncfilyu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZHRtbWV0bWViemNuY2ZpbHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjcwNDEsImV4cCI6MjA4ODY0MzA0MX0.CggajWp-Cxk_rYcTcCRMUKeGWRM-fz7N92MrWjPhHoI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
