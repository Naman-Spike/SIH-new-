'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  SCHEME_PRESETS,
  SchemePreset,
  calculateEMI,
  EMICalculationResult,
} from '@/utils/calculator';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Calculator,
  Calendar,
  Percent,
  Coins,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface FinancialCalculatorProps {
  initialSchemeId?: string;
}

export default function FinancialCalculator({ initialSchemeId }: FinancialCalculatorProps) {
  const { t, isHindi } = useLanguage();

  // Find initial preset
  const defaultPreset =
    (initialSchemeId &&
      (SCHEME_PRESETS.find((p) => p.schemeId === initialSchemeId) ||
        SCHEME_PRESETS.find((p) => p.id === initialSchemeId))) ||
    SCHEME_PRESETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultPreset.id);
  const [loanAmount, setLoanAmount] = useState<number>(defaultPreset.defaultLoanAmount);
  const [interestRate, setInterestRate] = useState<number>(defaultPreset.defaultInterestRate);
  const [tenureMonths, setTenureMonths] = useState<number>(defaultPreset.defaultTenureMonths);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(defaultPreset.defaultMoratoriumMonths);
  const [subsidyPercent, setSubsidyPercent] = useState<number>(defaultPreset.defaultSubsidyPercent);
  const [showAmortization, setShowAmortization] = useState<boolean>(true);

  // Sync if preset changes
  const activePreset = SCHEME_PRESETS.find((p) => p.id === selectedPresetId) || SCHEME_PRESETS[0];

  const handleSelectPreset = (preset: SchemePreset) => {
    setSelectedPresetId(preset.id);
    setLoanAmount(preset.defaultLoanAmount);
    setInterestRate(preset.defaultInterestRate);
    setTenureMonths(preset.defaultTenureMonths);
    setMoratoriumMonths(preset.defaultMoratoriumMonths);
    setSubsidyPercent(preset.defaultSubsidyPercent);
  };

  useEffect(() => {
    if (initialSchemeId) {
      const match =
        SCHEME_PRESETS.find((p) => p.schemeId === initialSchemeId) ||
        SCHEME_PRESETS.find((p) => p.id === initialSchemeId);
      if (match) {
        handleSelectPreset(match);
      }
    }
  }, [initialSchemeId]);

  // Calculate results dynamically
  const result: EMICalculationResult = calculateEMI({
    principal: loanAmount,
    annualRate: interestRate,
    tenureMonths,
    moratoriumMonths,
    subsidyPercent,
  });

  // Calculate percentage shares for visual breakdown bar
  const totalBarAmount = result.effectivePrincipal + result.totalInterest + result.subsidyAmount;
  const principalShare = totalBarAmount > 0 ? (result.effectivePrincipal / totalBarAmount) * 100 : 50;
  const interestShare = totalBarAmount > 0 ? (result.totalInterest / totalBarAmount) * 100 : 30;
  const subsidyShare = totalBarAmount > 0 ? (result.subsidyAmount / totalBarAmount) * 100 : 20;

  return (
    <div className="w-full space-y-8">
      {/* Scheme Presets Selector */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-black">
                {t('calcSelectScheme')}
              </h3>
              <p className="text-xs text-zinc-500">
                {isHindi
                  ? 'सरकारी दिशानिर्देशों के अनुसार मानक ऋण सीमा, ब्याज दर और मोराटोरियम अवधि लोड करें'
                  : 'Load scheme caps, interest subvention, and moratorium guidelines'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-zinc-100 border border-zinc-300 rounded-full text-zinc-800">
            {activePreset.id === 'custom' ? t('calcCustomScheme') : (isHindi ? activePreset.nameHi : activePreset.name)}
          </span>
        </div>

        {/* Scrollable / Wrap Grid of Scheme Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SCHEME_PRESETS.map((preset) => {
            const isSelected = preset.id === selectedPresetId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-2xl text-left transition-all border-2 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-black text-white border-black shadow-sm'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border-zinc-200'
                }`}
              >
                <div>
                  <div className="font-bold text-xs truncate">
                    {isHindi ? preset.nameHi : preset.name}
                  </div>
                  <div className={`text-[11px] mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                    Max: {formatCurrency(preset.maxLoanLimit)} • {preset.defaultInterestRate}%
                  </div>
                </div>
                {preset.tag && (
                  <div className={`mt-2 text-[10px] px-1.5 py-0.5 rounded-full inline-block truncate max-w-full font-medium ${
                    isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {isHindi ? preset.tagHi || preset.tag : preset.tag}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Calculator Grid: Controls on Left, Live Output KPIs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Inputs & Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-black rounded-3xl p-6 md:p-8 space-y-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <h3 className="font-bold text-xl text-black flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              {isHindi ? 'ऋण पैरामीटर दर्ज करें' : 'Loan & Repayment Parameters'}
            </h3>
            {activePreset.id !== 'custom' && (
              <span className="text-xs font-mono bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300">
                {t('calcMaxLoanLimit')} {formatCurrency(activePreset.maxLoanLimit)}
              </span>
            )}
          </div>

          {/* 1. Loan Amount */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-black flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-zinc-600" />
                {t('calcLoanAmount')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                <input
                  type="number"
                  min={10000}
                  max={activePreset.maxLoanLimit}
                  step={10000}
                  value={loanAmount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLoanAmount(Math.min(val, activePreset.maxLoanLimit * 2));
                  }}
                  className="w-44 pl-7 pr-3 py-1.5 font-bold text-right text-base border-2 border-black rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <input
              type="range"
              min={10000}
              max={activePreset.maxLoanLimit}
              step={10000}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-zinc-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>₹10,000</span>
              <span className="font-semibold text-black">{formatCurrency(loanAmount)}</span>
              <span>{formatCurrency(activePreset.maxLoanLimit)}</span>
            </div>
            {loanAmount > activePreset.maxLoanLimit && (
              <div className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                  {isHindi
                    ? `ध्यान दें: यह राशि ${activePreset.nameHi} की मानक सीमा (${formatCurrency(activePreset.maxLoanLimit)}) से अधिक है।`
                    : `Note: This amount exceeds the scheme ceiling limit of ${formatCurrency(activePreset.maxLoanLimit)}.`}
                </span>
              </div>
            )}
          </div>

          {/* 2. Annual Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-black flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-zinc-600" />
                {t('calcInterestRate')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={24}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-28 pr-7 pl-3 py-1.5 font-bold text-right text-base border-2 border-black rounded-full focus:outline-none focus:ring-2 focus:ring-black"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">%</span>
              </div>
            </div>
            <input
              type="range"
              min={4}
              max={18}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-zinc-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>4.0% (Subsidized)</span>
              <span className="font-semibold text-black">{interestRate}% p.a.</span>
              <span>18.0%</span>
            </div>
          </div>

          {/* 3. Loan Tenure */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-black flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-600" />
                {t('calcTenure')}
              </label>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm bg-zinc-100 border border-zinc-300 px-3 py-1 rounded-full">
                  {Math.floor(tenureMonths / 12)} {t('calcYears')} {tenureMonths % 12 > 0 ? `(${tenureMonths % 12}m)` : ''}
                </span>
                <span className="text-xs text-zinc-500">({tenureMonths} {t('calcMonths')})</span>
              </div>
            </div>
            <input
              type="range"
              min={12}
              max={120}
              step={6}
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-zinc-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>1 Year (12m)</span>
              <div className="flex gap-1.5">
                {[24, 36, 60, 84].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTenureMonths(m)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                      tenureMonths === m ? 'bg-black text-white border-black' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    {m / 12}y
                  </button>
                ))}
              </div>
              <span>10 Years (120m)</span>
            </div>
          </div>

          {/* 4. Moratorium Period (3 to 12 months) */}
          <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <label className="text-sm font-bold text-black flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-zinc-700" />
                  {t('calcMoratorium')}
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {t('calcMoratoriumHelp')}
                </p>
              </div>
              <span className="font-bold text-sm bg-black text-white px-3 py-1 rounded-full">
                {moratoriumMonths} {t('calcMonths')}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoratoriumMonths(m)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border-2 transition-all ${
                    moratoriumMonths === m
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-black'
                  }`}
                >
                  {m === 0 ? (isHindi ? 'कोई नहीं' : 'None') : `${m} ${isHindi ? 'माह' : 'Months'}`}
                </button>
              ))}
            </div>

            <p className="text-xs text-zinc-600 italic">
              {moratoriumMonths > 0 ? (
                isHindi ? (
                  `💡 पहले ${moratoriumMonths} महीनों तक केवल ब्याज (₹${result.moratoriumMonthlyPayment.toLocaleString('en-IN')}/माह) देय होगा। मूलधन की पूर्ण ईएमआई माह ${moratoriumMonths + 1} से शुरू होगी।`
                ) : (
                  `💡 During months 1–${moratoriumMonths}, you pay only monthly interest (₹${result.moratoriumMonthlyPayment.toLocaleString('en-IN')}/mo). Full principal EMI begins in month ${moratoriumMonths + 1}.`
                )
              ) : (
                isHindi ? 'कोई मोराटोरियम नहीं: पहले माह से ही पूर्ण ईएमआई लागू।' : 'No moratorium: Full principal + interest EMI begins from Month 1.'
              )}
            </p>
          </div>

          {/* 5. Capital Subsidy / Grant (%) */}
          <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-bold text-black flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-zinc-700" />
                  {t('calcSubsidy')}
                </label>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {t('calcSubsidyHelp')}
                </p>
              </div>
              <span className="font-bold text-sm bg-black text-white px-3 py-1 rounded-full">
                {subsidyPercent}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={subsidyPercent}
              onChange={(e) => setSubsidyPercent(Number(e.target.value))}
              className="w-full accent-black cursor-pointer h-2 bg-zinc-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0% (No Subsidy)</span>
              <span className="font-semibold text-black">
                {isHindi ? 'बचत:' : 'Saved:'} {formatCurrency(result.subsidyAmount)}
              </span>
              <span>50% Max</span>
            </div>
          </div>
        </div>

        {/* Right Column: Output Results & Projection Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Primary Projected EMI Hero Card */}
          <div className="bg-black text-white rounded-3xl p-7 shadow-lg space-y-5 border-2 border-black">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                {isHindi ? 'अनुमानित वित्तीय परिणाम' : 'Projected Output'}
              </span>
              <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-medium">
                {tenureMonths} {t('calcMonths')} {isHindi ? 'कुल अवधि' : 'Total'}
              </span>
            </div>

            {/* Post-moratorium regular EMI */}
            <div>
              <div className="text-xs text-zinc-300 font-medium mb-1">
                {t('calcProjectedEMI')}
              </div>
              <div className="text-4xl font-extrabold tracking-tight">
                ₹{result.monthlyEMIPostMoratorium.toLocaleString('en-IN')}
                <span className="text-sm font-normal text-zinc-400 ml-1">/{isHindi ? 'माह' : 'mo'}</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {moratoriumMonths > 0
                  ? (isHindi
                      ? `माह ${moratoriumMonths + 1} से माह ${tenureMonths} तक (${result.amortizationMonths} किश्तें)`
                      : `Payable Months ${moratoriumMonths + 1} to ${tenureMonths} (${result.amortizationMonths} installments)`)
                  : (isHindi ? 'माह 1 से माह ' + tenureMonths + ' तक' : `Payable Months 1 to ${tenureMonths}`)}
              </p>
            </div>

            {/* Moratorium Payment Callout (if active) */}
            {moratoriumMonths > 0 && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-300 font-medium">
                    {t('calcMoratoriumPayment')}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {isHindi ? `माह 1 से ${moratoriumMonths} (केवल ब्याज)` : `Months 1 to ${moratoriumMonths} (Interest Only)`}
                  </div>
                </div>
                <div className="text-xl font-bold text-white">
                  ₹{result.moratoriumMonthlyPayment.toLocaleString('en-IN')}
                  <span className="text-xs text-zinc-400 font-normal">/{isHindi ? 'माह' : 'mo'}</span>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-4 space-y-3">
              {/* Subsidy Saved */}
              {result.subsidyAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">{t('calcSubsidySaved')}</span>
                  <span className="font-bold text-emerald-400">
                    - {formatCurrency(result.subsidyAmount)} ({subsidyPercent}%)
                  </span>
                </div>
              )}

              {/* Effective Loan Principal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">{isHindi ? 'प्रभावी ऋण मूलधन' : 'Effective Loan Principal'}</span>
                <span className="font-bold text-white">
                  {formatCurrency(result.effectivePrincipal)}
                </span>
              </div>

              {/* Total Interest */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">{t('calcTotalInterest')}</span>
                <span className="font-bold text-white">
                  ₹{result.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Total Payable Outflow */}
              <div className="flex justify-between items-center pt-2 border-t border-zinc-800 text-base">
                <span className="font-bold text-white">{t('calcTotalPayable')}</span>
                <span className="font-extrabold text-white text-lg">
                  ₹{result.totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Distribution Chart Bar */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-black">
              {isHindi ? 'ऋण घटक वितरण' : 'Liability Breakdown'}
            </h4>

            {/* Stacked bar */}
            <div className="w-full h-4 bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-300">
              <div
                style={{ width: `${principalShare}%` }}
                className="bg-black h-full"
                title={`Principal: ${principalShare.toFixed(1)}%`}
              />
              <div
                style={{ width: `${interestShare}%` }}
                className="bg-zinc-400 h-full"
                title={`Interest: ${interestShare.toFixed(1)}%`}
              />
              {result.subsidyAmount > 0 && (
                <div
                  style={{ width: `${subsidyShare}%` }}
                  className="bg-zinc-200 h-full border-l border-zinc-400"
                  title={`Subsidy: ${subsidyShare.toFixed(1)}%`}
                />
              )}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-black flex-shrink-0" />
                <span className="truncate">{isHindi ? 'मूलधन' : 'Principal'} ({principalShare.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-400 flex-shrink-0" />
                <span className="truncate">{isHindi ? 'ब्याज' : 'Interest'} ({interestShare.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-zinc-200 border border-zinc-400 flex-shrink-0" />
                <span className="truncate">{isHindi ? 'सब्सिडी' : 'Subsidy'} ({subsidyShare.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Scheme Action Buttons */}
          <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-sm space-y-3">
            <Link
              href={activePreset.schemeId ? `/scheme/${activePreset.schemeId}` : '/scheme-finder'}
              className="w-full py-3 px-4 bg-black text-white hover:bg-zinc-800 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              {t('calcApplyBtn')}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={activePreset.schemeId ? `/partner-locator?scheme=${activePreset.schemeId}` : '/partner-locator'}
              className="w-full py-3 px-4 bg-white text-black hover:bg-zinc-100 border-2 border-black rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4" />
              {isHindi ? 'स्वीकृत चैनल पार्टनर खोजें' : 'Find Audited Channel Partner'}
            </Link>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table (Full Width) */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-black">
                {t('calcAmortization')}
              </h3>
              <p className="text-xs text-zinc-500">
                {isHindi
                  ? 'वर्ष-दर-वर्ष मूलधन पुनर्भुगतान, संचित ब्याज एवं शेष ऋण राशि का विवरण'
                  : 'Year-by-year breakdown of principal repayment, interest, and ending balance'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAmortization(!showAmortization)}
            className="p-2 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors"
          >
            {showAmortization ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {showAmortization && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-zinc-200 bg-zinc-50 text-zinc-700 font-bold">
                  <th className="py-3 px-4">{isHindi ? 'वर्ष' : 'Year'}</th>
                  <th className="py-3 px-4 text-right">{t('calcPrincipalPaid')}</th>
                  <th className="py-3 px-4 text-right">{t('calcInterestPaid')}</th>
                  <th className="py-3 px-4 text-right">{isHindi ? 'कुल वार्षिक भुगतान' : 'Total Outflow'}</th>
                  <th className="py-3 px-4 text-right">{t('calcRemainingBalance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-zinc-50 transition-colors font-mono">
                    <td className="py-3 px-4 font-bold font-sans text-black">
                      {isHindi ? `वर्ष ${row.year}` : `Year ${row.year}`}
                      {row.year === 1 && moratoriumMonths > 0 && (
                        <span className="ml-2 text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800">
                          {moratoriumMonths}m {isHindi ? 'छूट' : 'Grace'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-700 font-semibold">
                      ₹{row.principalPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-600">
                      ₹{row.interestPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-black">
                      ₹{(row.principalPaid + row.interestPaid).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-zinc-900">
                      ₹{row.remainingBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

