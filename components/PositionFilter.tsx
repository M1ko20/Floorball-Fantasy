'use client';

interface PositionFilterProps {
  selected: 'all' | 'defender' | 'attacker' | 'goalkeeper';
  onChange: (position: 'all' | 'defender' | 'attacker' | 'goalkeeper') => void;
}

const POSITIONS = [
  { value: 'all', label: 'Všichni', color: 'bg-zinc-700 hover:bg-zinc-600' },
  { value: 'goalkeeper', label: 'BR', color: 'bg-blue-900 hover:bg-blue-800' },
  { value: 'defender', label: 'OBR', color: 'bg-amber-900 hover:bg-amber-800' },
  { value: 'attacker', label: 'ÚT', color: 'bg-red-900 hover:bg-red-800' },
];

export default function PositionFilter({ selected, onChange }: PositionFilterProps) {
  return (
    <div className="flex gap-2 mb-3">
      {POSITIONS.map((pos) => (
        <button
          key={pos.value}
          onClick={() => onChange(pos.value as any)}
          className={`flex-1 py-2 px-2 rounded text-xs font-bold transition-all border ${
            selected === pos.value
              ? 'bg-lime-400 text-zinc-950 border-lime-400'
              : `${pos.color} text-white border-transparent`
          }`}
        >
          {pos.label}
        </button>
      ))}
    </div>
  );
}
