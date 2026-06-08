'use client';

import { useState } from 'react';
import { SelectedPlayer, LinePosition, Squad } from '@/types';

interface SquadFormationProps {
  squad: Squad;
  onPlayerClick: (lineNumber: 1 | 2, slotIndex: number) => void;
  onChangePlayer: (line: 1 | 2 | 'gk', index: number) => void;
  onSetCaptain: (playerId: string) => void;
}

export default function SquadFormation({
  squad,
  onPlayerClick,
  onChangePlayer,
  onSetCaptain,
}: SquadFormationProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const renderLineSlot = (
    position: LinePosition,
    lineNumber: 1 | 2,
    slotIndex: number
  ) => {
    return (
      <div key={`${lineNumber}-${slotIndex}`} className="relative">
        {position.player ? (
          <div
            className={`bg-zinc-800 border-2 rounded p-2 cursor-pointer hover:border-lime-400 transition h-20 flex flex-col items-center justify-center relative ${
              position.player.isCaptain ? 'border-lime-400 bg-lime-900' : 'border-zinc-700'
            }`}
            onClick={() => setShowMenu(`${lineNumber}-${slotIndex}`)}
          >
            {position.player.isCaptain && (
              <span className="absolute top-1 right-1 text-[10px] text-lime-300 font-bold leading-none">C</span>
            )}
            <p className="text-xs font-bold text-white text-center truncate w-full px-1">
              {position.player.name.split(' ').pop()}
            </p>
            <p className="text-xs text-zinc-400 text-center">{position.player.price}m</p>
          </div>
        ) : (
          <button
            onClick={() => onPlayerClick(lineNumber, slotIndex)}
            className="w-full bg-zinc-900 border-2 border-dashed border-zinc-700 rounded p-2 hover:border-lime-400 transition text-2xl text-zinc-600 hover:text-lime-400 h-20 flex items-center justify-center"
          >
            +
          </button>
        )}

        {showMenu === `${lineNumber}-${slotIndex}` && position.player && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded p-2 z-10 text-xs space-y-1">
            <button
              onClick={() => {
                onSetCaptain(position.player!.id);
                setShowMenu(null);
              }}
              className="w-full bg-lime-400 text-zinc-950 py-1 px-2 rounded font-bold hover:bg-lime-300 text-left"
            >
              Kapitán
            </button>
            <button
              onClick={() => {
                setShowMenu(null);
                onChangePlayer(lineNumber, slotIndex);
              }}
              className="w-full bg-zinc-700 text-zinc-200 py-1 px-2 rounded hover:bg-zinc-600 text-left"
            >
              Změnit hráče
            </button>
            <button
              onClick={() => setShowMenu(null)}
              className="w-full bg-zinc-800 text-zinc-200 py-1 px-2 rounded hover:bg-zinc-700 text-left"
            >
              Zrušit
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderLine = (line: LinePosition[], lineNumber: 1 | 2, label: string) => {
    const attackerSlots = line
      .map((pos, i) => ({ pos, i }))
      .filter(({ pos }) => pos.position === 'attacker');
    const defenderSlots = line
      .map((pos, i) => ({ pos, i }))
      .filter(({ pos }) => pos.position === 'defender');

    return (
      <div className="space-y-2">
        <p className="text-xs text-zinc-400 font-bold">{label}</p>
        <div className="grid grid-cols-3 gap-2">
          {attackerSlots.map(({ pos, i }) => renderLineSlot(pos, lineNumber, i))}
        </div>
        <div className="grid grid-cols-2 gap-2 w-2/3 mx-auto">
          {defenderSlots.map(({ pos, i }) => renderLineSlot(pos, lineNumber, i))}
        </div>
      </div>
    );
  };

  const totalPlayers =
    squad.line1.filter((p) => p.player).length +
    squad.line2.filter((p) => p.player).length +
    (squad.goalkeeper ? 1 : 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-zinc-200">Formace</h3>
        <p className="text-xs text-zinc-400">{totalPlayers}/11 hráčů</p>
      </div>

      <div className="space-y-6">
        {renderLine(squad.line1, 1, 'První lajna')}

        {/* Goalkeeper */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-xs text-zinc-400 font-bold">Brankář</p>
          <div className="w-28 relative">
            {squad.goalkeeper ? (
              <div
                className="bg-zinc-800 border-2 border-lime-400 rounded p-2 cursor-pointer hover:border-lime-300 transition h-20 flex flex-col items-center justify-center relative"
                onClick={() => setShowMenu('gk')}
              >
                {squad.goalkeeper.isCaptain && (
                  <span className="absolute top-1 right-1 text-[10px] text-lime-300 font-bold leading-none">C</span>
                )}
                <p className="text-xs font-bold text-white truncate w-full text-center px-1">
                  {squad.goalkeeper.name.split(' ').pop()}
                </p>
                <p className="text-xs text-zinc-400">{squad.goalkeeper.price}m</p>
              </div>
            ) : (
              <button
                onClick={() => onPlayerClick(1, -1)}
                className="w-full bg-zinc-900 border-2 border-dashed border-zinc-700 rounded p-2 hover:border-lime-400 transition text-2xl text-zinc-600 hover:text-lime-400 h-20 flex items-center justify-center"
              >
                +
              </button>
            )}

            {showMenu === 'gk' && squad.goalkeeper && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded p-2 z-10 text-xs space-y-1">
                <button
                  onClick={() => {
                    onSetCaptain(squad.goalkeeper!.id);
                    setShowMenu(null);
                  }}
                  className="w-full bg-lime-400 text-zinc-950 py-1 px-2 rounded font-bold hover:bg-lime-300 text-left"
                >
                  Kapitán
                </button>
                <button
                  onClick={() => {
                    setShowMenu(null);
                    onChangePlayer('gk', 0);
                  }}
                  className="w-full bg-zinc-700 text-zinc-200 py-1 px-2 rounded hover:bg-zinc-600 text-left"
                >
                  Změnit hráče
                </button>
                <button
                  onClick={() => setShowMenu(null)}
                  className="w-full bg-zinc-800 text-zinc-200 py-1 px-2 rounded hover:bg-zinc-700 text-left"
                >
                  Zrušit
                </button>
              </div>
            )}
          </div>
        </div>

        {renderLine(squad.line2, 2, 'Druhá lajna')}
      </div>
    </div>
  );
}
