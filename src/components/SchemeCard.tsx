'use client';

import { useRouter } from 'next/navigation';
import type { Scheme, MatchResult, UserProfile } from '@/types';
import MatchBadge from './MatchBadge';
import EligibilityBreakdown from './EligibilityBreakdown';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface SchemeCardProps {
  scheme: Scheme;
  matchResult: MatchResult;
  userProfile: UserProfile;
}

export default function SchemeCard({ scheme, matchResult, userProfile }: SchemeCardProps) {
  const router = useRouter();

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
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 text-sm">
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">Max Loan</span>
          <span className="font-semibold text-neutral-900">{scheme.maximumLoanAmount ? `₹${scheme.maximumLoanAmount.toLocaleString()}` : 'Varies'}</span>
        </div>
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">Interest Rate</span>
          <span className="font-semibold text-neutral-900">{scheme.interestRate || 'Varies'}</span>
        </div>
        <div>
          <span className="block text-neutral-400 text-xs uppercase tracking-wider mb-1 font-medium">Tenure</span>
          <span className="font-semibold text-neutral-900">{scheme.repaymentTenure || 'Varies'}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Eligibility Assessment</h4>
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
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          onClick={handleAskAi}
          className="flex-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 font-medium py-3 px-5 rounded-full transition-all flex items-center justify-center gap-2 text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Assistant</span>
        </button>
      </div>
    </div>
  );
}
