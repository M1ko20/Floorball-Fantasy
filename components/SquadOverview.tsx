'use client';

import { SelectedPlayer } from '@/types';

interface SquadOverviewProps {
  squad: SelectedPlayer[];
  budget: number;
  counts: {
    defenders: number;
    attackers: number;
    goalkeepers: number;
  };
  onRemove: (playerId: string) => void;
  onSetCaptain: (playerId: string) => void;
}

const POSITION_LABEL = {
  goalkeeper: 'GK',
  defender: 'DEF',
  attacker: 'ATT',
};

export default function SquadOverview({
  squad,
  budget,
  counts,
  onRemove,
  onSetCaptain,
}: SquadOverviewProps) {
  const captain = squad.find((p) => p.isCaptain);
  const totalSpent = 100 - budget;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-200">Your Squad</h3>
          <p className="text-xs text-zinc-400">
            {squad.length}/6 players
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Budget</p>
          <p className={`text-lg font-bold ${budget >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
            {budget}m
          </p>
          <p className="text-xs text-zinc-400">{totalSpent}m spent</p>
        </div>
      </div>

      {/* Position Status */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
          <p className="text-xs text-zinc-400">DEF</p>
          <p className="text-lg font-bold text-amber-400">{counts.defenders}/2</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
          <p className="text-xs text-zinc-400">ATT</p>
          <p className="text-lg font-bold text-red-400">{counts.attackers}/3</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
          <p className="text-xs text-zinc-400">GK</p>
          <p className="text-lg font-bold text-blue-400">{counts.goalkeepers}/1</p>
        </div>
      </div>

      {/* Captain */}
      {captain && (
        <div className="bg-zinc-950 border border-lime-400 rounded p-2 mb-4">
          <p className="text-xs text-zinc-400 mb-1">Captain (2x Points)</p>
          <p className="text-sm font-bold text-lime-300">{captain.name}</p>
        </div>
      )}

      {/* Squad List */}
      {squad.length > 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-xs text-zinc-400 font-bold">Players</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {squad.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between text-xs p-2 rounded ${
                  player.isCaptain
                    ? 'bg-lime-900 border border-lime-400'
                    : 'bg-zinc-800 border border-zinc-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{player.name}</p>
                  <p className="text-zinc-400">{POSITION_LABEL[player.position]}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-white font-mono">{player.price}m</span>
                  <button
                    onClick={() => onSetCaptain(player.id)}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      player.isCaptain
                        ? 'bg-lime-400 text-zinc-950'
                        : 'bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
                    }`}
                  >
                    {player.isCaptain ? 'C' : 'cap'}
                  </button>
                  <button
                    onClick={() => onRemove(player.id)}
                    className="px-2 py-1 rounded text-xs font-bold bg-red-900 text-red-200 hover:bg-red-800 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 text-center py-4 italic">No players selected</p>
      )}
    </div>
  );
}
