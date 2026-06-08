export type Position = 'goalkeeper' | 'defender' | 'attacker';

export interface Player {
  id: string;
  name: string;
  age: number;
  position: Position;
  team: string;
  price: number;
}

export interface SelectedPlayer extends Player {
  isCaptain: boolean;
}

export interface LinePosition {
  position: 'defender' | 'attacker' | 'attacker' | 'defender';
  player: SelectedPlayer | null;
  slot: number; // 0-3 for each line
}

export interface Line {
  lineNumber: 1 | 2;
  positions: LinePosition[];
}

export interface Squad {
  line1: LinePosition[];
  line2: LinePosition[];
  goalkeeper: SelectedPlayer | null;
  captain: SelectedPlayer | null;
}

export interface MatchPerformance {
  playerId: string;
  played: boolean;
  penalty: boolean;
  mvp: boolean;
  goals: number;
  assists: number;
  hattrick: boolean;
  cleanSheet: boolean;
  saves?: number;
  saveRate?: number;
  wonMatch?: boolean;
  lostMatch?: boolean;
  extraTime?: 'won' | 'lost' | null;
}

export interface PlayerScore {
  playerId: string;
  baseScore: number;
  captainBonus: number;
  totalScore: number;
}

export interface SquadScore {
  playerScores: PlayerScore[];
  totalScore: number;
}
