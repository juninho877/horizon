import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://izapwhqoqyxzulqvwhol.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6YXB3aHFvcXl4enVscXZ3aG9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1ODgwOTMsImV4cCI6MjA2NzE2NDA5M30.KjYHEi3Nhnyv6zi0dHBKuNE2WClNHPYMt1naltm9oy8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);