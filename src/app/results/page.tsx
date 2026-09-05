'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SchemeCard from '@/components/SchemeCard';
import Disclaimer from '@/components/Disclaimer';
import type { MatchResult, UserProfile, Scheme } from '@/types';
import { Sparkles, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ResultsPage() {
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [schemes, setSchemes] = useState<Record<string, Scheme>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsStr = sessionStorage.getItem('match-results');
    const profileStr = sessionStorage.getItem('user-profile');

    if (!resultsStr || !profileStr) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = JSON.parse(profileStr) as UserProfile;
      const results = JSON.parse(resultsStr) as MatchResult[];
      setMatchResults(results);
      setUserProfile(profile);

      fetch('/api/schemes')
        .then((res) => res.json())
        .then((data) => {
          if (data.schemes) {
            const schemeMap: Record<string, Scheme> = {};
            data.schemes.forEach((s: Scheme) => {
              schemeMap[s.id] = s;
            });
            setSchemes(schemeMap);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch schemes details:', err);
          setIsLoading(false);
        });
    } catch (e) {
      console.error('Failed to parse cached session data:', e);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-neutral-200 border-t-black rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-neutral-500">Evaluating 100% scheme matches...</p>
      </div>
    );
  }

  if (!userProfile || matchResults.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-neutral-800" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">No Profile Found</h2>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
          Please complete the profile questionnaire so we can evaluate your scheme eligibility.
        </p>
        <Link 
          href="/scheme-finder" 
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm"
        >
          <span>Go to Scheme Finder</span>
        </Link>
      </div>
    );
  }

  // Only show schemes that match 100%
  const displayableResults = matchResults.filter((r) => r.score === 100 && r.status === 'Eligible');

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Match Results</span>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">Your Recommended Schemes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Found {displayableResults.length} {displayableResults.length === 1 ? 'scheme' : 'schemes'} that 100% match your profile for <span className="font-semibold text-neutral-800">{userProfile.state}</span> ({userProfile.category} category).
          </p>
        </div>
        <Link 
          href="/scheme-finder" 
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 bg-white text-neutral-800 rounded-full font-medium text-xs hover:bg-neutral-100 transition-all shadow-sm whitespace-nowrap"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Link>
      </div>

      {displayableResults.length > 0 ? (
        <>
          {/* 100% Matched Status Pill */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-black text-white border border-black shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Matching Schemes ({displayableResults.length})</span>
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-6">
            {displayableResults.map((result) => (
              schemes[result.schemeId] && (
                <SchemeCard
                  key={result.schemeId}
                  scheme={schemes[result.schemeId]}
                  matchResult={result}
                  userProfile={userProfile}
                />
              )
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 max-w-lg mx-auto shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No 100% Matching Schemes Found</h3>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Based on your demographic, business sector, or loan criteria, none of the schemes currently match 100% of your parameters. 
            Try updating your profile details or project requirements.
          </p>
          <Link 
            href="/scheme-finder" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Update Profile</span>
          </Link>
        </div>
      )}

      {/* Disclaimer */}
      <div className="pt-4">
        <Disclaimer />
      </div>
    </div>
  );
}
