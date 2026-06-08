'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Domů', href: '/', icon: '◆' },
  { label: 'Tým', href: '/squad', icon: '▣' },
  { label: 'Hráči', href: '/players', icon: '▪' },
  { label: 'Tabulka', href: '/standings', icon: '▲' },
  { label: 'Profil', href: '/profile', icon: '○' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-2 py-2">
      <div className="flex justify-between max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 px-1 text-xs transition-all ${
                isActive
                  ? 'text-lime-400 border-t-2 border-lime-400'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="font-mono text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
