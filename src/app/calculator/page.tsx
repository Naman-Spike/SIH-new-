'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FinancialCalculator from '@/components/FinancialCalculator';
import Disclaimer from '@/components/Disclaimer';
import { useLanguage } from '@/context/LanguageContext';
import { Calculator, ShieldCheck, HelpCircle, BadgePercent, Clock } from 'lucide-react';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const schemeParam = searchParams.get('scheme') || undefined;
  const { t, isHindi } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-300 bg-white text-xs font-semibold text-zinc-800 shadow-sm">
          <Calculator className="w-3.5 h-3.5" />
          <span>{isHindi ? 'वित्तीय योजना एवं ईएमआई अनुमान' : 'Financial Planning & Projections'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
          {t('calcTitle')}
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
          {t('calcSubtitle')}
        </p>
      </div>

      {/* Main Interactive Calculator */}
      <FinancialCalculator initialSchemeId={schemeParam} />

      {/* Educational Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black">
            {isHindi ? 'मोराटोरियम अवधि (3 से 12 माह)' : 'Moratorium Period (3 to 12 Months)'}
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {isHindi
              ? 'व्यवसाय की स्थापना अवधि में नकदी प्रवाह को सहारा देने के लिए बैंक 3 से 12 महीने की मूलधन छूट प्रदान करते हैं। इस दौरान केवल साधारण ब्याज का भुगतान करना होता है।'
              : 'Banks provide a principal repayment grace period of 3 to 12 months to protect your working capital while your enterprise stabilizes. Only simple interest is serviced during this window.'}
          </p>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <BadgePercent className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black">
            {isHindi ? 'पूंजीगत सब्सिडी और अनुदान' : 'Capital Subsidy & Subvention'}
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {isHindi
              ? 'PMEGP, PMFME और SC-ST Hub जैसी योजनाओं में 15% से 35% तक का प्रत्यक्ष सरकारी अनुदान मिलता है, जो आपके कुल देय मूलधन को घटाकर मासिक ईएमआई को बेहद किफायती बना देता है।'
              : 'Schemes like PMEGP, PMFME, and SC-ST Hub provide 15% to 35% back-ended capital subsidies directly credited to your loan liability, significantly reducing your net EMI outflow.'}
          </p>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-black">
            {isHindi ? 'एनपीए-सुरक्षित ऋण आवंटन' : 'NPA-Protected Partner Routing'}
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed">
            {isHindi
              ? 'हमारा सिस्टम आपके आवेदन को केवल उन्हीं बैंकों या राज्य एजेंसियों (SCAs) को अग्रेषित करता है जिनका एनपीए 5% से कम हो, ताकि आपका ऋण समय पर स्वीकृत और वितरित हो सके।'
              : 'Our intelligent routing system screens channel partners to ensure your project dossier is routed only to lending branches with Gross NPAs below 5% and active disbursals.'}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <Disclaimer />
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-zinc-500">
          Loading Financial Calculator...
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  );
}
