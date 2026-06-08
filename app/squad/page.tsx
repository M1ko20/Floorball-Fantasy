import { createClient } from '@/lib/supabase/server';
import { loadPlayersFromDB } from '@/lib/supabase/players';
import { redirect } from 'next/navigation';
import SquadBuilderClient from '@/components/SquadBuilderClient';

export default async function SquadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const players = await loadPlayersFromDB();

  return <SquadBuilderClient initialPlayers={players} userId={user.id} />;
}
