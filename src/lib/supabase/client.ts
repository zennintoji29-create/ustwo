import { createBrowserClient } from '@supabase/ssr';

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    !url.includes('example.supabase.co') &&
    anonKey !== 'your-anon-key-here'
  );
};

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-key';

  if (!clientInstance) {
    clientInstance = createBrowserClient(supabaseUrl, supabaseKey);
  }

  return clientInstance;
};

