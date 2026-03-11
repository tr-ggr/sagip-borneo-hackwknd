'use client';

import React, { useEffect } from 'react';
import {
  Home,
  AlertTriangle,
  MapPin,
  User,
  Siren,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';

type MenuDrawerProps = {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onSignOut?: () => void;
  currentPath: string;
};

const MENU_ITEMS: { path: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/warnings', label: 'Alerts', icon: AlertTriangle },
  { path: '/map', label: 'Map', icon: MapPin },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/sos', label: 'Emergency SOS', icon: Siren },
  { path: '/help', label: 'Help', icon: HelpCircle },
];

export function MenuDrawer({ open, onClose, onNavigate, onSignOut, currentPath }: MenuDrawerProps) {
  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-xl z-50 flex flex-col animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
          <span className="font-sagip font-bold text-sagip-heading text-sm">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {MENU_ITEMS.map(({ path, label, icon: Icon }) => (
            <button
              key={path}
              type="button"
              onClick={() => handleNav(path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left font-sagip font-medium text-sm transition-colors ${
                currentPath === path
                  ? 'bg-asean-blue/10 text-asean-blue'
                  : 'text-sagip-heading hover:bg-slate-50'
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        {onSignOut && (
          <div className="p-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left font-sagip font-medium text-sm text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <LogOut className="size-5 shrink-0" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
