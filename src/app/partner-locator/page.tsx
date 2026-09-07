'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PartnerLocator from '@/components/PartnerLocator';
import Disclaimer from '@/components/Disclaimer';
import { useLanguage } from '@/context/LanguageContext';
import { Building2, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';

function PartnerLocatorContent() {
  const searchParams = useSearchParams();
  const schemeParam = searchParams.get('scheme') || undefined;
  const cityParam = searchParams.get('city') || undefined;
  const { t, isHindi } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-800 shadow-sm">
          <Building2 className="w-3.5 h-3.5" />
          <span>{isHindi ? 'जियो-स्पेशियल अधिकृत चैनल पार्टनर खोजक' : 'Geo-Spatial Partner Locator & Router'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
          {t('locatorTitle')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          {t('locatorSubtitle')}
        </p>
      </div>

      {/* Main Interactive Partner Locator */}
      <PartnerLocator initialSchemeId={schemeParam} initialCity={cityParam} />

      {/* Transparency & Health Audit Guidelines */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-black">
              {isHindi ? 'एनपीए एवं फंड स्वास्थ्य ऑडिट नियम' : 'Fund Health & NPA Audit Policy'}
            </h3>
            <p className="text-xs text-zinc-500">
              {isHindi
                ? 'उद्यमियों के ऋण आवेदनों की सुरक्षा हेतु उद्योग-सेतु की त्रि-स्तरीय सत्यापन प्रणाली'
                : 'Udhyog-Setu 3-tier financial solvency filter safeguarding MSME entrepreneurs'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="font-bold text-sm text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              1. 5% NPA Threshold Cap
            </div>
            <p>
              {isHindi
                ? 'जिन बैंक शाखाओं या राज्य निगमों (SCAs) का सकल गैर-निष्पादित परिसंपत्ति (Gross NPA) अनुपात 5.0% से अधिक होता है, उन्हें स्वचालित रूप से राउटिंग से बाहर कर दिया जाता है।'
                : 'Any lending partner or State Agency with a Gross NPA ratio exceeding 5.0% is disqualified from application routing to prevent applicants from facing long review delays or rejected files.'}
            </p>
          </div>

          <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="font-bold text-sm text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              2. 60-Day Overdue Cutoff
            </div>
            <p>
              {isHindi
                ? '60 दिनों से अधिक पुराने पुनर्भुगतान बकाए वाले वित्तीय संस्थानों को ब्लॉक किया जाता है, ताकि केवल सक्रिय और सक्षम ऋणदाता ही आपके आवेदन का निपटान करें।'
                : 'Branches with portfolio overdues exceeding 60 days have their application intake automatically suspended until recovery balances return to statutory RBI/NABARD benchmarks.'}
            </p>
          </div>

          <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
            <div className="font-bold text-sm text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              3. Dynamic Fund Availability
            </div>
            <p>
              {isHindi
                ? 'केवल उन्हीं पार्टनर्स को प्राथमिकता दी जाती है जिनके पास सरकारी सब्सिडी और ऋण वितरण के लिए पर्याप्त सक्रिय बजट शेष हो।'
                : 'Routing algorithms prioritize institutions with active lending windows and substantial allocated subsidy budgets, ensuring swift disbursement upon scheme sanction.'}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}

export default function PartnerLocatorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-zinc-500">
          Loading Partner Locator...
        </div>
      }
    >
      <PartnerLocatorContent />
    </Suspense>
  );
}

