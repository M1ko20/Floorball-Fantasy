import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Player } from '@/types';

// Cookie-free client for public cached queries
function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const loadPlayersFromDB = unstable_cache(
  async (): Promise<Player[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('players')
      .select('id, name, age, position, team, price')
      .order('name');

    if (error || !data) return [];
    return data as Player[];
  },
  ['players'],
  { revalidate: 3600 }
);
