'use client';

import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DisclaimerProps {
  className?: string;
  text?: string;
}

export default function Disclaimer({
  className = '',
  text,
}: DisclaimerProps) {
  const { t } = useLanguage();
  const displayText = text || t('disclaimerBanner');

  return (
    <div className={`flex items-start gap-3 bg-neutral-100 text-neutral-800 p-4 rounded-2xl border border-neutral-200 ${className}`}>
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-neutral-900" />
      <p className="text-xs sm:text-sm font-medium leading-relaxed">{displayText}</p>
    </div>
  );
}
