'use client';

import { useState, useMemo } from 'react';
import { Player } from '@/types';

interface PlayerSelectorModalProps {
  isOpen: boolean;
  position: 'defender' | 'attacker' | 'goalkeeper' | null;
  availablePlayers: Player[];
  onSelect: (player: Player) => void;
  onClose: () => void;
}

const POSITION_LABELS = {
  defender: 'Obránce',
  attacker: 'Útočník',
  goalkeeper: 'Brankář',
};

type SortField = 'price' | 'name';
type SortDir = 'asc' | 'desc';

const FIELD_DEFAULTS: Record<SortField, SortDir> = {
  price: 'desc',
  name: 'asc',
};

export default function PlayerSelectorModal({
  isOpen,
  position,
  availablePlayers,
  onSelect,
  onClose,
}: PlayerSelectorModalProps) {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('price');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const teams = useMemo(
    () => ['all', ...Array.from(new Set(availablePlayers.map((p) => p.team))).sort()],
    [availablePlayers]
  );

  const filtered = useMemo(() => {
    let result = availablePlayers;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      );
    }

    if (teamFilter !== 'all') {
      result = result.filter((p) => p.team === teamFilter);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'price') cmp = a.price - b.price;
      else cmp = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [availablePlayers, search, teamFilter, sortField, sortDir]);

  if (!isOpen || !position) return null;

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(FIELD_DEFAULTS[field]);
    }
  };

  const handleClose = () => {
    setSearch('');
    setTeamFilter('all');
    setSortField('price');
    setSortDir('desc');
    onClose();
  };

  const arrow = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-t-xl sm:rounded-lg w-full sm:max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="border-b border-zinc-800 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-lime-400">
              Vybrat {POSITION_LABELS[position]}
            </h3>
            <span className="text-xs text-zinc-500">{filtered.length} hráčů</span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Hledat hráče nebo klub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
          />

          {/* Sort buttons */}
          <div className="flex gap-2">
            {(['price', 'name'] as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                className={`px-2 py-1 rounded text-xs font-bold transition ${
                  sortField === field
                    ? 'bg-lime-400 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {field === 'price' ? 'Cena' : 'Jméno'}{arrow(field)}
              </button>
            ))}
          </div>

          {/* Team filter */}
          {teams.length > 2 && (
            <div className="flex gap-1 overflow-x-auto pb-1">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => setTeamFilter(team)}
                  className={`shrink-0 px-2 py-1 rounded text-xs transition ${
                    teamFilter === team
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {team === 'all' ? 'Vše' : team}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Player list */}
        <div className="overflow-y-auto flex-1 p-3 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8 italic">Žádní dostupní hráči</p>
          ) : (
            filtered.map((player) => (
              <button
                key={player.id}
                onClick={() => {
                  onSelect(player);
                  handleClose();
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-lime-400 rounded p-3 text-left transition text-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{player.name}</p>
                    <p className="text-zinc-400">{player.team}</p>
                  </div>
                  <div className="text-right ml-3 shrink-0">
                    <p className="font-bold text-lime-400 text-sm">{player.price}m</p>
                    <p className="text-zinc-500">{player.age} let</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4">
          <button
            onClick={handleClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 px-3 rounded text-xs font-bold transition"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
