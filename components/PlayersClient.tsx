'use client';

import { useState, useMemo } from 'react';
import { Player } from '@/types';
import PositionFilter from './PositionFilter';

interface PlayersClientProps {
  initialPlayers: Player[];
  initialTeams: string[];
}

type SortField = 'price' | 'name' | 'age';
type SortDir = 'asc' | 'desc';

const FIELD_DEFAULTS: Record<SortField, SortDir> = {
  price: 'desc',
  name: 'asc',
  age: 'asc',
};

const SORT_LABELS: Record<SortField, string> = {
  price: 'Cena',
  name: 'Jméno',
  age: 'Věk',
};

export default function PlayersClient({ initialPlayers, initialTeams }: PlayersClientProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    'all' | 'defender' | 'attacker' | 'goalkeeper'
  >('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(FIELD_DEFAULTS[field]);
    }
  };

  const arrow = (field: SortField) =>
    sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const filteredPlayers = useMemo(() => {
    let result = initialPlayers;

    if (selectedPosition !== 'all') {
      result = result.filter((p) => p.position === selectedPosition);
    }

    if (selectedTeam !== 'all') {
      result = result.filter((p) => p.team === selectedTeam);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'price') cmp = a.price - b.price;
      else if (sortField === 'age') cmp = a.age - b.age;
      else cmp = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [initialPlayers, selectedPosition, selectedTeam, searchQuery, sortField, sortDir]);

  const teams = ['all', ...initialTeams];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1 text-lime-400">Hráči</h1>
        <p className="text-xs text-zinc-400 mb-6">
          {filteredPlayers.length} / {initialPlayers.length} hráčů
        </p>

        {/* Filters */}
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-4 space-y-3">
          <h2 className="text-sm font-bold text-zinc-200">Filtry</h2>

          {/* Search */}
          <input
            type="text"
            placeholder="Hledat hráče nebo klub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
          />

          {/* Position */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">Pozice</p>
            <PositionFilter selected={selectedPosition} onChange={setSelectedPosition} />
          </div>

          {/* Team */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">Tým</p>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-xs text-white focus:outline-none focus:border-lime-400"
            >
              {teams.map((team) => (
                <option key={team} value={team}>
                  {team === 'all' ? 'Všechny týmy' : team}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">Řadit</p>
            <div className="flex gap-2">
              {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`px-2 py-1 rounded text-xs font-bold transition ${
                    sortField === field
                      ? 'bg-lime-400 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {SORT_LABELS[field]}{arrow(field)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2">
          {filteredPlayers.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-8">Žádní hráči nenalezeni</p>
          ) : (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="bg-zinc-900 border border-zinc-800 rounded p-3 hover:border-zinc-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{player.name}</p>
                    <p className="text-xs text-zinc-400">{player.team}</p>
                  </div>
                  <div className="ml-2 text-right">
                    <p className="text-xs text-zinc-400">Věk</p>
                    <p className="text-sm font-bold text-white">{player.age}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs px-2 py-1 rounded bg-blue-900 text-blue-200 font-bold">
                    {player.position === 'goalkeeper'
                      ? 'BR'
                      : player.position === 'defender'
                        ? 'OBR'
                        : 'ÚT'}
                  </span>
                  <span className="text-sm font-bold text-lime-400">{player.price}m</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
