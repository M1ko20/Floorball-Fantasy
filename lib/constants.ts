// Game Constants
export const GAME_RULES = {
  BUDGET: 100, // 100m
  SQUAD_SIZE: 11, // 4 def + 6 att + 1 gk (2 lines)
  DEFENDERS_REQUIRED: 4,
  ATTACKERS_REQUIRED: 6,
  GOALKEEPERS_REQUIRED: 1,
  MAX_PLAYERS_PER_CLUB: 3,
  CAPTAIN_MULTIPLIER: 2,
  LINES: 2,
};

// Player Price by Position (in millions)
export const PRICE_BY_POSITION = {
  goalkeeper: 8,
  defender: 6,
  attacker: 12,
};

// Scoring Rules by Position
export const SCORING_RULES = {
  all: {
    played: 1,
    penalty: -3,
    mvp: 4,
    scoutingBonus: 5, // if selected by <5% of managers
  },
  attacker: {
    goal: 3,
    assist: 2,
    hattrick: 2, // +2 in addition to 3*3=9 for goals
  },
  defender: {
    goal: 4,
    assist: 2,
    hattrick: 3, // +3 in addition to 3*4=12 for goals
    cleanSheet: 2,
  },
  goalkeeper: {
    goal: 10,
    assist: 8,
    cleanSheet: 6,
    savesPerFive: 1, // Every 5 saves
    saveRateBonus: 2, // >90% save rate
    goalConceded: -1,
    wonMatch: 2,
    lostMatch: -2,
    extraTimeWon: 1,
    extraTimeLost: -1,
  },
};
