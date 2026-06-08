'use client';

import { useState, useEffect, useCallback } from 'react';
import { Player, SelectedPlayer, Squad, Position, LinePosition } from '@/types';
import { GAME_RULES } from '@/lib/constants';
import { validateSquad, getSquadPlayers } from '@/lib/scoring';
import { createClient } from '@/lib/supabase/client';
import SquadFormation from './SquadFormation';
import PlayerSelectorModal from './PlayerSelectorModal';

interface SquadBuilderClientProps {
  initialPlayers: Player[];
  userId: string;
}

const EMPTY_SQUAD: Squad = {
  line1: [
    { position: 'attacker', player: null, slot: 0 },
    { position: 'attacker', player: null, slot: 1 },
    { position: 'attacker', player: null, slot: 2 },
    { position: 'defender', player: null, slot: 3 },
    { position: 'defender', player: null, slot: 4 },
  ],
  line2: [
    { position: 'attacker', player: null, slot: 0 },
    { position: 'attacker', player: null, slot: 1 },
    { position: 'attacker', player: null, slot: 2 },
    { position: 'defender', player: null, slot: 3 },
    { position: 'defender', player: null, slot: 4 },
  ],
  goalkeeper: null,
  captain: null,
};

type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error';

function slotsToSquad(slots: any[], players: Player[]): Squad {
  const squad: Squad = {
    line1: EMPTY_SQUAD.line1.map((p) => ({ ...p })),
    line2: EMPTY_SQUAD.line2.map((p) => ({ ...p })),
    goalkeeper: null,
    captain: null,
  };

  for (const slot of slots) {
    const player = players.find((p) => p.id === slot.player_id);
    if (!player) continue;
    const selected: SelectedPlayer = { ...player, isCaptain: slot.is_captain };

    if (slot.line === 'gk') {
      squad.goalkeeper = selected;
    } else {
      const key = slot.line === '1' ? 'line1' : 'line2';
      const idx = slot.slot_index;
      if (squad[key][idx]) {
        squad[key] = squad[key].map((pos: LinePosition, i: number) =>
          i === idx ? { ...pos, player: selected } : pos
        );
      }
    }
  }

  return squad;
}

function squadToSlotRows(squad: Squad, squadId: string) {
  const rows: { squad_id: string; line: string; slot_index: number; player_id: string; is_captain: boolean }[] = [];

  squad.line1.forEach((pos, i) => {
    if (pos.player) rows.push({ squad_id: squadId, line: '1', slot_index: i, player_id: pos.player.id, is_captain: pos.player.isCaptain });
  });
  squad.line2.forEach((pos, i) => {
    if (pos.player) rows.push({ squad_id: squadId, line: '2', slot_index: i, player_id: pos.player.id, is_captain: pos.player.isCaptain });
  });
  if (squad.goalkeeper) {
    rows.push({ squad_id: squadId, line: 'gk', slot_index: 0, player_id: squad.goalkeeper.id, is_captain: squad.goalkeeper.isCaptain });
  }

  return rows;
}

export default function SquadBuilderClient({ initialPlayers, userId }: SquadBuilderClientProps) {
  const [squad, setSquad] = useState<Squad>(EMPTY_SQUAD);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ line: 1 | 2 | 'gk'; index: number } | null>(null);
  const [replacingPlayerId, setReplacingPlayerId] = useState<string | null>(null);

  const supabase = createClient();

  // Load squad from Supabase on mount
  useEffect(() => {
    const load = async () => {
      const { data: squadRow } = await supabase
        .from('squads')
        .select('id')
        .eq('user_id', userId)
        .is('matchday_id', null)
        .maybeSingle();

      if (squadRow) {
        const { data: slots } = await supabase
          .from('squad_slots')
          .select('*')
          .eq('squad_id', squadRow.id);

        if (slots && slots.length > 0) {
          setSquad(slotsToSquad(slots, initialPlayers));
        }
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const markUnsaved = useCallback((updatedSquad: Squad) => {
    setSquad(updatedSquad);
    setSaveStatus('unsaved');
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');

    // Get or create draft squad row
    let squadId: string;
    const { data: existing } = await supabase
      .from('squads')
      .select('id')
      .eq('user_id', userId)
      .is('matchday_id', null)
      .maybeSingle();

    if (existing) {
      squadId = existing.id;
      await supabase.from('squads').update({ updated_at: new Date().toISOString() }).eq('id', squadId);
    } else {
      const { data: created, error } = await supabase
        .from('squads')
        .insert({ user_id: userId })
        .select('id')
        .single();
      if (error || !created) { setSaveStatus('error'); return; }
      squadId = created.id;
    }

    // Replace all slots
    await supabase.from('squad_slots').delete().eq('squad_id', squadId);
    const rows = squadToSlotRows(squad, squadId);
    if (rows.length > 0) {
      const { error } = await supabase.from('squad_slots').insert(rows);
      if (error) { setSaveStatus('error'); return; }
    }

    setSaveStatus('saved');
    setErrors([]);
  };

  const getSelectedPlayerIds = (): Set<string> => {
    const ids = new Set<string>();
    squad.line1.forEach((pos) => { if (pos.player && pos.player.id !== replacingPlayerId) ids.add(pos.player.id); });
    squad.line2.forEach((pos) => { if (pos.player && pos.player.id !== replacingPlayerId) ids.add(pos.player.id); });
    if (squad.goalkeeper && squad.goalkeeper.id !== replacingPlayerId) ids.add(squad.goalkeeper.id);
    return ids;
  };

  const getAvailablePlayers = (): Player[] => {
    if (!selectedSlot) return [];

    let position: Position = 'goalkeeper';
    if (selectedSlot.line === 1 || selectedSlot.line === 2) {
      const line = selectedSlot.line === 1 ? squad.line1 : squad.line2;
      if (!line?.[selectedSlot.index]) return [];
      position = (line[selectedSlot.index].position as Position) || 'goalkeeper';
    }

    const selectedIds = getSelectedPlayerIds();
    let available = initialPlayers.filter((p) => !selectedIds.has(p.id) && p.position === position);

    const selectedPlayers = getSquadPlayers(squad).filter((p) => p.id !== replacingPlayerId);
    available = available.filter((player) => {
      const clubCount = selectedPlayers.filter((p) => p.team === player.team).length;
      return clubCount < GAME_RULES.MAX_PLAYERS_PER_CLUB;
    });

    const spent = selectedPlayers.reduce((sum, p) => sum + p.price, 0);
    available = available.filter((p) => p.price <= GAME_RULES.BUDGET - spent);

    return available;
  };

  const getRemainingBudget = () =>
    GAME_RULES.BUDGET - getSquadPlayers(squad).reduce((sum, p) => sum + p.price, 0);

  const openSlotSelector = (line: 1 | 2 | 'gk', index: number) => {
    setSelectedSlot({ line, index });
    setReplacingPlayerId(null);
    setSelectorOpen(true);
    setErrors([]);
  };

  const handleChangePlayer = (line: 1 | 2 | 'gk', index: number) => {
    let currentPlayerId: string | null = null;
    if (line === 'gk') currentPlayerId = squad.goalkeeper?.id ?? null;
    else currentPlayerId = (line === 1 ? squad.line1 : squad.line2)[index]?.player?.id ?? null;
    setReplacingPlayerId(currentPlayerId);
    setSelectedSlot({ line, index });
    setSelectorOpen(true);
    setErrors([]);
  };

  const addPlayerToSlot = (player: Player) => {
    if (!selectedSlot) return;
    const newPlayer: SelectedPlayer = { ...player, isCaptain: false };
    if (selectedSlot.line === 1) {
      const newLine1 = squad.line1.map((pos, i) => i === selectedSlot.index ? { ...pos, player: newPlayer } : pos);
      markUnsaved({ ...squad, line1: newLine1 });
    } else if (selectedSlot.line === 2) {
      const newLine2 = squad.line2.map((pos, i) => i === selectedSlot.index ? { ...pos, player: newPlayer } : pos);
      markUnsaved({ ...squad, line2: newLine2 });
    } else {
      markUnsaved({ ...squad, goalkeeper: newPlayer });
    }
    setSelectorOpen(false);
    setSelectedSlot(null);
    setReplacingPlayerId(null);
  };

  const setCaptain = (playerId: string) => {
    markUnsaved({
      ...squad,
      line1: squad.line1.map((pos) => ({ ...pos, player: pos.player ? { ...pos.player, isCaptain: pos.player.id === playerId } : null })),
      line2: squad.line2.map((pos) => ({ ...pos, player: pos.player ? { ...pos.player, isCaptain: pos.player.id === playerId } : null })),
      goalkeeper: squad.goalkeeper ? { ...squad.goalkeeper, isCaptain: squad.goalkeeper.id === playerId } : null,
    });
  };

  const handleValidate = () => {
    const validation = validateSquad(squad);
    setErrors(validation.errors);
    if (validation.valid) alert('Tým je platný! ✓');
  };

  const handleClearSquad = () => {
    if (confirm('Vymazat celý tým?')) {
      markUnsaved(EMPTY_SQUAD);
      setErrors([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-mono flex items-center justify-center">
        <p className="text-zinc-400">Načítání týmu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono px-4 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-lime-400">Konstruktor týmu</h1>
            <p className="text-xs text-zinc-400">Vyberte si 4 OBR, 6 ÚT a 1 BR</p>
          </div>
          <span className={`text-xs font-bold mt-1 ${
            saveStatus === 'saved' ? 'text-zinc-600' :
            saveStatus === 'unsaved' ? 'text-amber-400' :
            saveStatus === 'saving' ? 'text-zinc-400' :
            'text-red-400'
          }`}>
            {saveStatus === 'saved' ? 'Uloženo' :
             saveStatus === 'unsaved' ? 'Neuloženo' :
             saveStatus === 'saving' ? 'Ukládání...' :
             'Chyba uložení'}
          </span>
        </div>

        <SquadFormation
          squad={squad}
          onPlayerClick={(line, index) => {
            if (index === -1) openSlotSelector('gk', 0);
            else openSlotSelector(line === 1 ? 1 : 2, index);
          }}
          onChangePlayer={handleChangePlayer}
          onSetCaptain={setCaptain}
        />

        <div className="bg-zinc-900 border border-zinc-800 rounded p-3 mt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-400">Rozpočet</p>
            <p className={`text-lg font-bold ${getRemainingBudget() >= 0 ? 'text-lime-400' : 'text-red-400'}`}>
              {getRemainingBudget()}m zbývá
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Utraceno</p>
            <p className="text-lg font-bold text-zinc-300">{GAME_RULES.BUDGET - getRemainingBudget()}m</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-950 border border-red-800 rounded p-3 mt-4">
            <p className="text-xs font-bold text-red-400 mb-1">Chyby validace:</p>
            <ul className="text-xs text-red-300 space-y-1">
              {errors.map((error, idx) => <li key={idx}>• {error}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            className="bg-lime-400 text-zinc-950 py-2 px-3 rounded text-xs font-bold hover:bg-lime-300 transition disabled:opacity-40"
          >
            Uložit tým
          </button>
          <button
            onClick={handleValidate}
            className="bg-zinc-700 text-zinc-200 py-2 px-3 rounded text-xs font-bold hover:bg-zinc-600 transition border border-zinc-600"
          >
            Ověřit tým
          </button>
          <button
            onClick={handleClearSquad}
            className="bg-zinc-800 text-zinc-200 py-2 px-3 rounded text-xs font-bold hover:bg-zinc-700 transition border border-zinc-700"
          >
            Vymazat
          </button>
        </div>

        <PlayerSelectorModal
          isOpen={selectorOpen}
          position={
            selectedSlot
              ? selectedSlot.line === 'gk'
                ? 'goalkeeper'
                : (squad[selectedSlot.line === 1 ? 'line1' : 'line2']?.[selectedSlot.index]?.position as Position) || null
              : null
          }
          availablePlayers={getAvailablePlayers()}
          onSelect={addPlayerToSlot}
          onClose={() => {
            setSelectorOpen(false);
            setSelectedSlot(null);
            setReplacingPlayerId(null);
          }}
        />
      </div>
    </div>
  );
}
