'use client';

import { useRouter } from 'next/navigation';
import type { Scheme, MatchResult, UserProfile } from '@/types';
import MatchBadge from './MatchBadge';
import EligibilityBreakdown from './EligibilityBreakdown';
import { ArrowRight, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SchemeCardProps {
  scheme: Scheme;
  matchResult: MatchResult;
  userProfile: UserProfile;
}

export default function SchemeCard({ scheme, matchResult, userProfile }: SchemeCardProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const handleViewDetails = () => {
    sessionStorage.setItem(`scheme-context-${scheme.id}`, JSON.stringify({ userProfile, matchResult }));
    router.push(`/scheme/${scheme.id}`);
  };

  const handleAskAi = () => {
    sessionStorage.setItem(`scheme-context-${scheme.id}`, JSON.stringify({ userProfile, matchResult }));
    router.push(`/scheme/${scheme.id}?chat=open`);
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-7 shadow-sm transition-all hover:border-black hover:shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        <div>
          <MatchBadge status={matchResult.status} />
          <h3 className="text-xl font-bold text-neutral-900 mt-3">{scheme.name}</h3>
        </div>
      </div>
      
      <p className="text-neutral-600 mb-6 text-sm line-clamp-2 leading-relaxed">{scheme.description}</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-sm">
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">{t('maxLoanLabel')}</span>
          <span className="font-semibold text-neutral-900">{scheme.maximumLoanAmount ? `₹${scheme.maximumLoanAmount.toLocaleString()}` : 'Varies'}</span>
        </div>
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">{t('interestRateLabel')}</span>
          <span className="font-semibold text-neutral-900">{scheme.interestRate || 'Varies'}</span>
        </div>
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">{t('tenureLabel')}</span>
          <span className="font-semibold text-neutral-900">{scheme.repaymentTenure || 'Varies'}</span>
        </div>
      </div>

      {/* Required Documents Section */}
      {scheme.documents && scheme.documents.length > 0 && (
        <div className="mb-5 bg-neutral-50/70 p-4 rounded-2xl border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <FileText className="w-3.5 h-3.5 text-neutral-700" />
            <h4 className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              {t('requiredDocsLabel')}
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scheme.documents.slice(0, 4).map((doc, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center text-xs font-medium bg-white text-neutral-800 border border-neutral-200 px-3 py-1 rounded-full shadow-2xs"
              >
                {doc}
              </span>
            ))}
            {scheme.documents.length > 4 && (
              <span className="inline-flex items-center text-xs font-semibold bg-neutral-200/80 text-neutral-700 px-2.5 py-1 rounded-full">
                {t('moreDocsBadge', scheme.documents.length - 4)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">{t('eligibilityAssessmentLabel')}</h4>
        <EligibilityBreakdown 
          matchedConditions={matchResult.matchedConditions} 
          failedConditions={matchResult.failedConditions} 
          uncertainConditions={matchResult.uncertainConditions} 
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-neutral-100">
        <button 
          onClick={handleViewDetails}
          className="flex-1 bg-black hover:bg-neutral-800 text-white font-medium py-3 px-5 rounded-full transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          <span>{t('btnViewDetails')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={handleAskAi}
          className="flex-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 font-medium py-3 px-5 rounded-full transition-all flex items-center justify-center gap-2 text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('btnAskAi')}</span>
        </button>
      </div>
    </div>
  );
}
