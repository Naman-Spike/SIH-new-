'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, Sparkles, X, MessageSquare } from 'lucide-react';
import type { Scheme, MatchResult, UserProfile } from '@/types';
import MatchBadge from '@/components/MatchBadge';
import EligibilityBreakdown from '@/components/EligibilityBreakdown';
import ChatBox from '@/components/ChatBox';
import Disclaimer from '@/components/Disclaimer';

export default function SchemeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(searchParams.get('chat') === 'open');

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const response = await fetch(`/api/schemes/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setScheme(null);
          }
          throw new Error('Scheme not found');
        }
        const data = await response.json();
        setScheme(data);
      } catch (error) {
        console.error('Error fetching scheme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScheme();

    const contextStr = sessionStorage.getItem(`scheme-context-${params.id}`);
    if (contextStr) {
      try {
        const context = JSON.parse(contextStr);
        setMatchResult(context.matchResult || null);
        setUserProfile(context.userProfile || null);
      } catch (e) {
        console.error('Error parsing scheme context', e);
      }
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-300 border-t-black"></div>
        <p className="text-sm font-medium text-neutral-500">Loading scheme details...</p>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Scheme Not Found</h2>
        <p className="text-sm text-neutral-500 mb-8">The requested scheme could not be found or has been removed.</p>
        <button 
          onClick={() => router.back()} 
          className="px-8 py-3.5 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
      <div className={`transition-all duration-300 ${isChatOpen ? 'lg:pr-96' : ''}`}>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black mb-6 transition-colors px-3 py-1.5 rounded-full hover:bg-neutral-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden mb-10">
          {/* Top Banner */}
          <div className="p-6 sm:p-10 border-b border-neutral-200">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{scheme.ministry}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">{scheme.name}</h1>
              </div>
              {matchResult && (
                <div className="mt-1 flex-shrink-0">
                  <MatchBadge status={matchResult.status} />
                </div>
              )}
            </div>
            <p className="text-base text-neutral-600 leading-relaxed mt-2">{scheme.description}</p>
          </div>

          {/* Key Financial Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-neutral-200 divide-y md:divide-y-0 md:divide-x divide-neutral-200 bg-neutral-50">
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Max Loan Amount</h3>
              <p className="text-xl font-bold text-neutral-900">{scheme.maximumLoanAmount ? `₹${scheme.maximumLoanAmount.toLocaleString()}` : 'N/A'}</p>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Interest Rate</h3>
              <p className="text-xl font-bold text-neutral-900">{scheme.interestRate || 'N/A'}</p>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Repayment Tenure</h3>
              <p className="text-xl font-bold text-neutral-900">{scheme.repaymentTenure || 'N/A'}</p>
            </div>
          </div>

          {/* Body Sections */}
          <div className="p-6 sm:p-10 space-y-10">
            {matchResult && (
              <section className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-neutral-900 mb-2">Your Eligibility Assessment</h2>
                <p className="text-xs text-neutral-500 mb-4">Detailed condition checks based on your submitted profile.</p>
                <EligibilityBreakdown 
                  matchedConditions={matchResult.matchedConditions}
                  failedConditions={matchResult.failedConditions}
                  uncertainConditions={matchResult.uncertainConditions}
                />
              </section>
            )}

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">Target Beneficiaries</h2>
              <p className="text-neutral-700 text-sm leading-relaxed">{scheme.targetBeneficiaries}</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">Eligibility Criteria</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-neutral-700">
                {scheme.eligibility.minAge && <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Min Age: <span className="font-semibold">{scheme.eligibility.minAge} years</span></li>}
                {scheme.eligibility.maxAge && <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Max Age: <span className="font-semibold">{scheme.eligibility.maxAge} years</span></li>}
                {scheme.eligibility.genders && scheme.eligibility.genders.length > 0 && (
                  <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Genders: <span className="font-semibold">{scheme.eligibility.genders.join(', ')}</span></li>
                )}
                {scheme.eligibility.categories && scheme.eligibility.categories.length > 0 && (
                  <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Categories: <span className="font-semibold">{scheme.eligibility.categories.join(', ')}</span></li>
                )}
                {scheme.eligibility.businessTypes && scheme.eligibility.businessTypes.length > 0 && (
                  <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 col-span-1 sm:col-span-2">• Business Sectors: <span className="font-semibold">{scheme.eligibility.businessTypes.join(', ')}</span></li>
                )}
                {scheme.eligibility.maxAnnualIncome && (
                  <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Max Income: <span className="font-semibold">₹{scheme.eligibility.maxAnnualIncome.toLocaleString()}</span></li>
                )}
                {scheme.eligibility.maxProjectCost && (
                  <li className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">• Max Project Cost: <span className="font-semibold">₹{scheme.eligibility.maxProjectCost.toLocaleString()}</span></li>
                )}
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">Key Benefits</h2>
              <ul className="space-y-2 text-sm text-neutral-700">
                {scheme.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-black mt-2 flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">Required Documents</h2>
                <ol className="space-y-2 text-sm text-neutral-700">
                  {scheme.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-neutral-400 mt-0.5">{idx + 1}.</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <section>
                <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">How to Apply</h2>
                <ol className="space-y-2 text-sm text-neutral-700">
                  {scheme.applicationProcess.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-neutral-400 mt-0.5">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>

            <section>
              <h2 className="text-lg font-bold text-neutral-900 mb-3 pb-2 border-b border-neutral-100">State Coverage</h2>
              <p className="text-neutral-700 text-sm">{scheme.stateCoverage}</p>
            </section>
          </div>
          
          <div className="bg-neutral-50 p-6 sm:p-10 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
            <div>
              <span className="block mb-1 font-medium">Source Reference: <span className="text-neutral-800 underline inline-flex items-center gap-1">Fictional Demo Authority <ExternalLink className="w-3 h-3" /></span></span>
              <span>Last Verified: {new Date(scheme.lastUpdated).toLocaleDateString()}</span>
            </div>
            <Disclaimer className="w-full sm:w-auto mt-4 sm:mt-0 max-w-md text-xs py-2.5 px-3.5" />
          </div>
        </div>
      </div>

      {/* Chat Drawer */}
      {isChatOpen ? (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 border-l border-neutral-200 flex flex-col transform transition-all duration-300 ease-in-out">
          <div className="p-4 bg-neutral-900 text-white flex justify-between items-center">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-300" />
              <span>AI Scheme Assistant</span>
            </h3>
            <button 
              onClick={() => setIsChatOpen(false)}
              className="text-neutral-400 hover:text-white bg-white/10 rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-3 bg-neutral-100/50">
            <ChatBox 
              schemeId={scheme.id} 
              schemeName={scheme.name} 
              userProfile={userProfile} 
              matchResult={matchResult} 
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 bg-black text-white px-6 py-3.5 rounded-full shadow-2xl hover:bg-neutral-800 transition-all z-40 flex items-center gap-2.5 border border-neutral-700"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold text-sm">Ask AI Assistant</span>
        </button>
      )}
    </div>
  );
}
