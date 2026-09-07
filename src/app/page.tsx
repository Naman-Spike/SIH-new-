'use client';

import Link from 'next/link';
import { Search, ShieldCheck, Sparkles, ArrowRight, Layers } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const { t, isHindi } = useLanguage();

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-12">
      {/* Minimalist Hero Section */}
      <section className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-14 lg:p-16 text-center shadow-xl shadow-neutral-100/50 relative overflow-hidden">
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl opacity-70 pointer-events-none -z-0 -translate-y-24" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('heroBadge')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight mb-6 leading-[1.15]">
            {t('heroTitlePrefix')}
            <span className="text-blue-600">{t('heroTitleAccent1')}</span>
            <br />
            <span className="text-indigo-600">{t('heroTitleSuffix')}</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/scheme-finder" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-black hover:bg-neutral-800 shadow-md transition-all"
            >
              <span>{t('heroBtnFind')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/chat" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('heroBtnAssistant')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Features Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">{t('howItWorksTitle')}</h2>
          <p className="text-sm text-neutral-500 mt-1">{t('howItWorksSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('step1Title')}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t('step1Desc')}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('step2Title')}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t('step2Desc')}
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">{t('step3Title')}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Demo Disclaimer */}
      <div>
        <Disclaimer />
      </div>
    </div>
  );
}
