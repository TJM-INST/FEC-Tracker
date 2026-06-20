'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Queue' },
  { href: '/completed', label: 'Completed' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex items-center gap-8">
      <span className="font-bold text-lg tracking-tight">Upgrade Tracker</span>
      <div className="flex gap-4">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${
              pathname === l.href
                ? 'bg-white text-gray-900'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="ml-auto">
        <a
          href="/api/export"
          download
          className="text-sm font-medium px-3 py-1.5 rounded transition-colors text-gray-300 hover:text-white hover:bg-gray-700"
        >
          Export CSV
        </a>
      </div>
    </nav>
  );
}
