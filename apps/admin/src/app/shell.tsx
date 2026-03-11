'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '../lib/auth';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'home' as const },
  { href: '/volunteers', label: 'Volunteers', icon: 'users' as const },
  { href: '/warnings/new', label: 'Warnings', icon: 'alert' as const },
  { href: '/map', label: 'Map', icon: 'map' as const },
] as const;

function NavIcon({ type }: { type: (typeof navItems)[number]['icon'] }) {
  switch (type) {
    case 'home':
      return (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.75V20h14v-9.25" />
        </svg>
      );
    case 'users':
      return (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a3 3 0 0 1 0 5.75" />
        </svg>
      );
    case 'alert':
      return (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.29 3.86 2.82 18a1 1 0 0 0 .9 1.48h16.56a1 1 0 0 0 .9-1.48L13.71 3.86a1 1 0 0 0-1.72 0z" />
        </svg>
      );
    case 'map':
      return (
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5v-13Z" />
          <path d="M9 4v13.5" />
          <path d="M15 6.5v13.5" />
        </svg>
      );
    default:
      return null;
  }
}

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
          <div>
            <h1 className="brand-title">WIRA Admin</h1>
            <p className="brand-subtitle">Woven Intelligence for Regional Alertness</p>

            <nav>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <NavIcon type={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button type="button" onClick={logout} className="side-nav-logout">
                Logout / Log Keluar
              </button>
            </nav>
          </div>

          <div className="side-nav-footer">
            <div className="side-nav-user-card">
              <div className="side-nav-avatar" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="9" r="3.2" />
                  <path d="M6 19.5c1.4-2 3.3-3 6-3s4.6 1 6 3" />
                </svg>
              </div>
              <div className="side-nav-user-meta">
                <p className="side-nav-user-role">{user?.name ?? 'System Administrator'}</p>
                <p className="side-nav-user-email">{user?.email ?? 'HQ-Region VII'}</p>
              </div>
            </div>
          </div>
        </aside>
        <main className="main-content">{children}</main>
      </div>
    </>
  );
}
