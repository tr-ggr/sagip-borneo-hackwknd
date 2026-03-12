'use client';

import React, { useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export type LanguageOption = 'ENg' | 'BISAYA';

type LanguageSelectorProps = {
  open: boolean;
  onClose: () => void;
  currentLanguage: LanguageOption;
  onSelect: (lang: LanguageOption) => void;
};

const LANGUAGES: LanguageOption[] = ['ENg', 'BISAYA'];

export function LanguageSelector({
  open,
  onClose,
  currentLanguage,
  onSelect,
}: LanguageSelectorProps) {
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

    return undefined;
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (lang: LanguageOption) => {
    onSelect(lang);
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] max-w-[90vw] bg-white rounded-xl shadow-xl z-50 p-4 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Select language"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Globe className="size-5 text-asean-blue shrink-0" />
          <span className="font-sagip font-bold text-sagip-heading text-sm">Language</span>
        </div>
        <ul className="py-2">
          {LANGUAGES.map((lang) => (
            <li key={lang}>
              <button
                type="button"
                onClick={() => handleSelect(lang)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-sagip font-medium text-sm text-sagip-heading hover:bg-asean-blue/10 transition-colors"
              >
                {lang}
                {currentLanguage === lang && (
                  <Check className="size-4 text-asean-blue shrink-0" aria-hidden />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
