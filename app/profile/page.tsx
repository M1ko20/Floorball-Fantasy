import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, created_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-mono px-4 py-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1 text-lime-400">Profil</h1>
        <p className="text-xs text-zinc-400 mb-6">{user.email}</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4 mb-4 space-y-3">
          <div>
            <p className="text-xs text-zinc-400">Přezdívka</p>
            <p className="text-sm font-bold text-white">{profile?.username ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-400">Člen od</p>
            <p className="text-sm font-bold text-white">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString('cs-CZ')
                : '—'}
            </p>
          </div>
        </div>

        <LogoutButton />
      </div>
    </div>
  );
}
