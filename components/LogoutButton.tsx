'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 px-3 rounded text-xs font-bold transition border border-zinc-700"
    >
      Odhlásit se
    </button>
  );
}
