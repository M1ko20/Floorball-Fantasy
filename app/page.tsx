export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-lime-400">FLOORTASY</h1>
        <p className="text-xs text-zinc-400 mb-8">Fantasy Floorbalová Liga</p>

        <div className="space-y-6">
          <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
            <h2 className="text-sm font-bold text-zinc-200 mb-3">O aplikaci</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sestav si fantasy floorbalový tým s rozpočtem 100m. Vyber si 4 obránce, 6 útočníků
              a 1 brankáře přes 2 linie. Zvol kapitána pro dvojnásobné body.
            </p>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
            <h3 className="text-sm font-bold text-zinc-200 mb-3">Pravidla</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <p className="text-zinc-400">Rozpočet</p>
                <p className="text-lg text-lime-400 font-bold">100m</p>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <p className="text-zinc-400">Tým</p>
                <p className="text-lg text-lime-400 font-bold">11 hráčů</p>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <p className="text-zinc-400">Na klub</p>
                <p className="text-lg text-lime-400 font-bold">Max 3</p>
              </div>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
                <p className="text-zinc-400">Kapitán</p>
                <p className="text-lg text-lime-400 font-bold">2x body</p>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded p-4">
            <h3 className="text-sm font-bold text-zinc-200 mb-3">Začněte zde</h3>
            <div className="space-y-2">
              <a
                href="/squad"
                className="block w-full bg-lime-400 text-zinc-950 py-2 px-3 rounded text-center text-sm font-bold hover:bg-lime-300 transition"
              >
                Sestav tým
              </a>
              <a
                href="/players"
                className="block w-full bg-zinc-800 text-zinc-200 py-2 px-3 rounded text-center text-sm font-bold hover:bg-zinc-700 transition border border-zinc-700"
              >
                Procházet hráče
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
