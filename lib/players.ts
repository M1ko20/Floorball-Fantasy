import fs from 'fs';
import path from 'path';
import { Player, Position } from '@/types';
import { PRICE_BY_POSITION } from './constants';

const CSV_FILE_PATH = path.join(process.cwd(), 'teams', 'players.csv');

function mapCzechPositionToEnglish(czechPosition: string): Position | null {
  const positionMap: { [key: string]: Position } = {
    brankář: 'goalkeeper',
    útočník: 'attacker',
    obránce: 'defender',
  };
  return positionMap[czechPosition.toLowerCase()] || null;
}

function generatePlayerId(name: string, team: string): string {
  return `${name.toLowerCase().replace(/\s+/g, '_')}_${team.toLowerCase().replace(/\s+/g, '_')}`;
}

/**
 * Load all players from the CSV file
 * Returns only players with valid positions
 */
export function loadPlayers(): Player[] {
  try {
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    const lines = csvContent.trim().split('\n');

    // Skip header
    const players: Player[] = [];
    let playerId = 1;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV line (simple parsing - handles quoted fields with commas)
      const columns = parseCsvLine(line);
      if (columns.length < 4) continue;

      const [name, ageStr, czechPosition, team] = columns;
      const age = parseInt(ageStr, 10);
      const position = mapCzechPositionToEnglish(czechPosition);

      // Skip players with unknown position
      if (!position) continue;

      players.push({
        id: `player_${playerId}`,
        name: name.trim(),
        age,
        position,
        team: team.trim(),
        price: PRICE_BY_POSITION[position],
      });

      playerId++;
    }

    return players;
  } catch (error) {
    console.error('Error loading players:', error);
    return [];
  }
}

/**
 * Simple CSV line parser that handles quoted fields
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current) {
    result.push(current.trim());
  }

  return result;
}

/**
 * Get players by position
 */
export function getPlayersByPosition(players: Player[], position: Position): Player[] {
  return players.filter((p) => p.position === position);
}

/**
 * Get players by team
 */
export function getPlayersByTeam(players: Player[], team: string): Player[] {
  return players.filter((p) => p.team.toLowerCase() === team.toLowerCase());
}

/**
 * Search players by name (case-insensitive)
 */
export function searchPlayersByName(players: Player[], query: string): Player[] {
  const lowerQuery = query.toLowerCase();
  return players.filter((p) => p.name.toLowerCase().includes(lowerQuery));
}

/**
 * Get unique teams from players
 */
export function getUniqueTeams(players: Player[]): string[] {
  const teams = new Set(players.map((p) => p.team));
  return Array.from(teams).sort();
}
