'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-neutral-200 py-10 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-xs text-neutral-500 mb-2 max-w-xl mx-auto">
          {t('footerDisclaimer')}
        </p>
        <p className="text-xs font-semibold text-neutral-800">
          &copy; {new Date().getFullYear()} {t('footerCopyright')}
        </p>
      </div>
    </footer>
  );
}
