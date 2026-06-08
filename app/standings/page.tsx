export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1 text-lime-400">Tabulka</h1>
        <p className="text-xs text-zinc-400 mb-6">Globální hodnocení</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-6 text-center">
          <p className="text-zinc-400 mb-2">Globální hodnocení brzy</p>
          <p className="text-xs text-zinc-500">
            Hodnocení bude dostupné až se budou hrát zápasy a budou se počítat body
          </p>
        </div>
      </div>
    </div>
  );
}
