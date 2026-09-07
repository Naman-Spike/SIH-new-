'use client';

import ProfileForm from '@/components/ProfileForm';
import Disclaimer from '@/components/Disclaimer';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SchemeFinderPage() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-start w-full overflow-hidden">
      {/* Soft atmospheric gradient glow behind hero */}
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none overflow-hidden">
        <div className="w-[1100px] h-[520px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl opacity-80 rounded-full -translate-y-24" />
      </div>

      <div className="flex-1 max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Hero Header Section */}
        <div className="text-center flex flex-col items-center space-y-3.5">
          {/* Badge 1: Smart Eligibility Checker */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-neutral-200/90 text-xs font-medium text-neutral-700 shadow-xs">
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('finderBadge1')}</span>
          </div>

          {/* Badge 2: AI-Assisted Government Scheme Discovery */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('finderBadge2')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.12] pt-2">
            {t('finderHeadlinePrefix')}
            <span className="text-blue-600">{t('finderHeadlineAccent1')}</span>
            <br />
            <span className="text-indigo-600">{t('finderHeadlineSuffix')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed pt-1">
            {t('finderSubtitle')}
          </p>
        </div>

        {/* Form Container */}
        <ProfileForm />

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto pt-4">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
