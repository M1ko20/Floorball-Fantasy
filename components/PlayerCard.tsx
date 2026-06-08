'use client';

import { Player } from '@/types';

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

const POSITION_BADGE = {
  goalkeeper: 'GK',
  defender: 'DEF',
  attacker: 'ATT',
};

const POSITION_COLOR = {
  goalkeeper: 'bg-blue-900 text-blue-200',
  defender: 'bg-amber-900 text-amber-200',
  attacker: 'bg-red-900 text-red-200',
};

export default function PlayerCard({
  player,
  isSelected,
  canAdd,
  onAdd,
  onRemove,
}: PlayerCardProps) {
  return (
    <div
      className={`border rounded p-3 transition-all ${
        isSelected
          ? 'bg-lime-900 border-lime-400'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-white truncate">{player.name}</p>
          <p className="text-xs text-zinc-400">{player.team}</p>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-bold ${
            POSITION_COLOR[player.position]
          }`}
        >
          {POSITION_BADGE[player.position]}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs">
        <span className="text-zinc-400">
          Age: <span className="text-white font-mono">{player.age}</span>
        </span>
        <span className={`font-bold ${isSelected ? 'text-lime-200' : 'text-lime-400'}`}>
          {player.price}m
        </span>
      </div>

      <button
        onClick={isSelected ? onRemove : onAdd}
        disabled={!isSelected && !canAdd}
        className={`w-full mt-2 py-2 px-2 rounded text-xs font-bold transition-all ${
          isSelected
            ? 'bg-red-600 text-white hover:bg-red-700'
            : canAdd
              ? 'bg-lime-400 text-zinc-950 hover:bg-lime-300'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
        }`}
      >
        {isSelected ? 'Remove' : 'Add'}
      </button>
    </div>
  );
}
