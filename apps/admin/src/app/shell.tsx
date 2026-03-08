'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/volunteers', label: 'Volunteers' },
  { href: '/warnings/new', label: 'Warnings' },
  { href: '/map', label: 'Map' },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading WIRA Console...</div>;
  }

  if (user && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-neutral-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
          <p className="text-neutral-600 mb-6">
            You do not have administrative privileges to access this console. Please log in with an admin account.
          </p>
          <button 
            onClick={logout}
            className="w-full bg-neutral-900 text-white py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors"
          >
            Logout / Log Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="status-banner" role="status" aria-live="polite">
        <span className="status-dot" />
        <span>Manual Warning Mode / Mod Amaran Manual</span>
      </div>

      <div className="app-shell">
        <aside className="side-nav">
          <h1 className="brand-title">WIRA Admin</h1>
          <p className="brand-subtitle">Woven Intelligence for Regional Alertness</p>
          
          <div className="user-profile mb-6 p-4 bg-teal-50 rounded-lg border border-teal-100">
            <p className="text-sm font-bold text-teal-900">{user?.name}</p>
            <p className="text-xs text-teal-700">{user?.email}</p>
          </div>

          <nav>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? 'nav-link-active' : ''}`}>
                {item.label}
              </Link>
            ))}
            
            <button 
              onClick={logout}
              className="nav-link w-full text-left mt-8 text-neutral-500 hover:text-red-600 border-t border-neutral-100 pt-4 rounded-none"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '12px' }}
            >
              Logout / Log Keluar
            </button>
          </nav>
        </aside>
        <main className="main-content">{children}</main>
      </div>

      <style jsx>{`
        .user-profile {
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: rgba(13, 79, 79, 0.05);
          border-radius: 8px;
        }
        .nav-link-active {
          background: rgba(13, 79, 92, 0.1);
          color: var(--wira-teal);
        }
        .mb-6 {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </>
  );
}
