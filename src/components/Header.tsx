'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="text-xl font-bold tracking-tight text-neutral-900">{t('brandName')}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900 text-white">
                {t('demoTag')}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-5">
            <Link 
              href="/scheme-finder" 
              className="text-neutral-600 hover:text-black font-medium text-sm transition-colors px-3 py-1.5 rounded-full hover:bg-neutral-100"
            >
              {t('navFindSchemes')}
            </Link>
            <Link 
              href="/chat" 
              className="text-neutral-600 hover:text-black font-medium text-sm transition-colors px-3 py-1.5 rounded-full hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('navAiAssistant')}</span>
            </Link>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-full border border-neutral-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'hi'
                    ? 'bg-black text-white shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-black'
                }`}
                title="हिन्दी में बदलें"
              >
                हिन्दी
              </button>
            </div>

            <Link
              href="/scheme-finder"
              className="bg-black hover:bg-neutral-800 text-white text-sm font-medium px-5 py-2 rounded-full transition-all shadow-sm"
            >
              {t('navGetStarted')}
            </Link>
          </nav>

          {/* Mobile Menu Button & Language Switcher */}
          <div className="md:hidden flex items-center gap-2">
            {/* Language Switcher on mobile header */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-full border border-neutral-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === 'en' ? 'bg-black text-white font-bold' : 'text-neutral-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === 'hi' ? 'bg-black text-white font-bold' : 'text-neutral-600'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-700 hover:text-black p-2 rounded-full hover:bg-neutral-100 focus:outline-none"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-3 pb-5 space-y-2 rounded-b-3xl shadow-lg animate-in slide-in-from-top-2">
          <Link
            href="/scheme-finder"
            className="block px-4 py-2.5 rounded-2xl text-base font-medium text-neutral-800 hover:text-black hover:bg-neutral-100"
            onClick={() => setIsOpen(false)}
          >
            {t('navFindSchemes')}
          </Link>
          <Link
            href="/chat"
            className="block px-4 py-2.5 rounded-2xl text-base font-medium text-neutral-800 hover:text-black hover:bg-neutral-100"
            onClick={() => setIsOpen(false)}
          >
            {t('navAiAssistant')}
          </Link>
          <Link
            href="/scheme-finder"
            className="block px-4 py-2.5 rounded-2xl text-base font-medium text-center bg-black text-white"
            onClick={() => setIsOpen(false)}
          >
            {t('navGetStarted')}
          </Link>
        </div>
      )}
    </header>
  );
}
