import { Player, MatchPerformance, SelectedPlayer, SquadScore, PlayerScore, Squad } from '@/types';
import { SCORING_RULES, GAME_RULES } from './constants';

/**
 * Calculate score for a single player based on match performance
 */
export function calculatePlayerScore(
  player: Player | SelectedPlayer,
  performance: MatchPerformance
): number {
  if (!performance.played) return 0;

  let score = SCORING_RULES.all.played; // +1 for playing

  if (performance.penalty) score += SCORING_RULES.all.penalty; // -3
  if (performance.mvp) score += SCORING_RULES.all.mvp; // +4

  // Position-specific scoring
  if (player.position === 'attacker') {
    score += performance.goals * SCORING_RULES.attacker.goal; // +3 per goal
    score += performance.assists * SCORING_RULES.attacker.assist; // +2 per assist
    if (performance.hattrick) {
      score += SCORING_RULES.attacker.hattrick; // +2 additional for hattrick
    }
  } else if (player.position === 'defender') {
    score += performance.goals * SCORING_RULES.defender.goal; // +4 per goal
    score += performance.assists * SCORING_RULES.defender.assist; // +2 per assist
    if (performance.hattrick) {
      score += SCORING_RULES.defender.hattrick; // +3 additional for hattrick
    }
    if (performance.cleanSheet) {
      score += SCORING_RULES.defender.cleanSheet; // +2
    }
  } else if (player.position === 'goalkeeper') {
    score += performance.goals * SCORING_RULES.goalkeeper.goal; // +10 per goal (rare!)
    score += performance.assists * SCORING_RULES.goalkeeper.assist; // +8 per assist (rare!)
    if (performance.cleanSheet) {
      score += SCORING_RULES.goalkeeper.cleanSheet; // +6
    }
    if (performance.saves !== undefined) {
      score += Math.floor(performance.saves / 5) * SCORING_RULES.goalkeeper.savesPerFive; // +1 per 5 saves
    }
    if (performance.saveRate !== undefined && performance.saveRate > 0.9) {
      score += SCORING_RULES.goalkeeper.saveRateBonus; // +2 for >90% save rate
    }
    // Goals conceded are tracked separately - they reduce score
    score += (performance.saves || 0) * 0 - (performance.saveRate ? 0 : 0); // placeholder

    // Match result bonuses (goalkeeper-specific)
    if (performance.wonMatch) {
      score += SCORING_RULES.goalkeeper.wonMatch; // +2
    } else if (performance.lostMatch) {
      score += SCORING_RULES.goalkeeper.lostMatch; // -2
    }

    if (performance.extraTime === 'won') {
      score += SCORING_RULES.goalkeeper.extraTimeWon; // +1
    } else if (performance.extraTime === 'lost') {
      score += SCORING_RULES.goalkeeper.extraTimeLost; // -1
    }
  }

  return Math.max(0, score); // Don't go below 0
}

/**
 * Calculate score for a squad based on match results
 * Takes into account captain bonus
 */
export function calculateSquadScore(
  squad: SelectedPlayer[],
  matchResults: Map<string, MatchPerformance>
): SquadScore {
  const playerScores: PlayerScore[] = [];
  let totalScore = 0;

  squad.forEach((player) => {
    const performance = matchResults.get(player.id) || {
      playerId: player.id,
      played: false,
      penalty: false,
      mvp: false,
      goals: 0,
      assists: 0,
      hattrick: false,
      cleanSheet: false,
    };

    const baseScore = calculatePlayerScore(player, performance);
    const isCaptain = player.isCaptain || false;
    const captainBonus = isCaptain ? baseScore * (GAME_RULES.CAPTAIN_MULTIPLIER - 1) : 0;
    const totalScore_player = baseScore + captainBonus;

    playerScores.push({
      playerId: player.id,
      baseScore,
      captainBonus,
      totalScore: totalScore_player,
    });

    totalScore += totalScore_player;
  });

  return {
    playerScores,
    totalScore,
  };
}

/**
 * Get all players from squad as flat array
 */
export function getSquadPlayers(squad: Squad): SelectedPlayer[] {
  const players: SelectedPlayer[] = [];

  squad.line1.forEach((pos) => {
    if (pos.player) players.push(pos.player);
  });

  squad.line2.forEach((pos) => {
    if (pos.player) players.push(pos.player);
  });

  if (squad.goalkeeper) players.push(squad.goalkeeper);

  return players;
}

/**
 * Validate squad composition and constraints
 */
export function validateSquad(squad: Squad): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const players = getSquadPlayers(squad);

  // Check squad size
  if (players.length !== GAME_RULES.SQUAD_SIZE) {
    errors.push(
      `Tým musí mít přesně ${GAME_RULES.SQUAD_SIZE} hráčů (4 OBR, 6 ÚT, 1 BR)`
    );
  }

  // Count by position
  const line1Players = squad.line1.filter((p) => p.player).map((p) => p.player!);
  const line2Players = squad.line2.filter((p) => p.player).map((p) => p.player!);
  
  const defenderCount = line1Players.filter((p) => p.position === 'defender').length +
                        line2Players.filter((p) => p.position === 'defender').length;
  const attackerCount = line1Players.filter((p) => p.position === 'attacker').length +
                        line2Players.filter((p) => p.position === 'attacker').length;
  const goalkeeperCount = squad.goalkeeper ? 1 : 0;

  if (defenderCount !== GAME_RULES.DEFENDERS_REQUIRED) {
    errors.push(`Musí být přesně ${GAME_RULES.DEFENDERS_REQUIRED} obránců`);
  }
  if (attackerCount !== GAME_RULES.ATTACKERS_REQUIRED) {
    errors.push(`Musí být přesně ${GAME_RULES.ATTACKERS_REQUIRED} útočníků`);
  }
  if (goalkeeperCount !== GAME_RULES.GOALKEEPERS_REQUIRED) {
    errors.push(`Musí být přesně ${GAME_RULES.GOALKEEPERS_REQUIRED} brankář`);
  }

  // Check club constraint (max 3 per club)
  const clubCounts = new Map<string, number>();
  players.forEach((player) => {
    clubCounts.set(player.team, (clubCounts.get(player.team) || 0) + 1);
  });

  clubCounts.forEach((count, club) => {
    if (count > GAME_RULES.MAX_PLAYERS_PER_CLUB) {
      errors.push(
        `Maximálně ${GAME_RULES.MAX_PLAYERS_PER_CLUB} hráči na klub (${club} má ${count})`
      );
    }
  });

  // Check captain is selected
  const hasCaptain = players.some((p) => p.isCaptain);
  if (players.length === GAME_RULES.SQUAD_SIZE && !hasCaptain) {
    errors.push('Musíš zvolit kapitána');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
