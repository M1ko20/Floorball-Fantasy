'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    } else {
      if (!username.trim()) {
        setError('Zadej přezdívku');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Registrace proběhla úspěšně. Můžeš se přihlásit.');
        setTab('login');
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      {/* Tabs */}
      <div className="flex mb-6 border-b border-zinc-800">
        {(['login', 'register'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); setMessage(null); }}
            className={`flex-1 pb-2 text-xs font-bold transition ${
              tab === t
                ? 'text-lime-400 border-b-2 border-lime-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'login' ? 'Přihlášení' : 'Registrace'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {tab === 'register' && (
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Přezdívka</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tvojepřezdívka"
              required
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400"
            />
          </div>
        )}

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tvuj@email.cz"
            required
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Heslo</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
            {error}
          </p>
        )}
        {message && (
          <p className="text-xs text-lime-400 bg-lime-950 border border-lime-800 rounded px-3 py-2">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-lime-400 text-zinc-950 py-2 rounded text-sm font-bold hover:bg-lime-300 transition disabled:opacity-50"
        >
          {loading ? 'Načítání...' : tab === 'login' ? 'Přihlásit se' : 'Vytvořit účet'}
        </button>
      </form>
    </div>
  );
}
