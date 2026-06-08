import { loadPlayersFromDB } from '@/lib/supabase/players';
import PlayersClient from '@/components/PlayersClient';

export default async function PlayersPage() {
  const players = await loadPlayersFromDB();
  const teams = [...new Set(players.map((p) => p.team))].sort();

  return <PlayersClient initialPlayers={players} initialTeams={teams} />;
}
