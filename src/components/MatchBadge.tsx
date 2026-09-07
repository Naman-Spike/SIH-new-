'use client';

import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import type { EligibilityStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface MatchBadgeProps {
  status: EligibilityStatus;
}

export default function MatchBadge({ status }: MatchBadgeProps) {
  const { isHindi } = useLanguage();
  const isEligible = status === 'Eligible';
  const isPotentiallyEligible = status === 'Potentially Eligible';

  const badgeStyle = isEligible
    ? 'bg-black text-white border-black'
    : isPotentiallyEligible
    ? 'bg-neutral-100 text-neutral-900 border-neutral-300'
    : 'bg-white text-neutral-500 border-neutral-200';

  const Icon = isEligible ? CheckCircle2 : isPotentiallyEligible ? AlertCircle : XCircle;

  let label: string = status;
  if (isHindi) {
    if (isEligible) label = '100% मेल • पात्र';
    else if (isPotentiallyEligible) label = 'संभावित पात्र';
    else label = 'अपात्र';
  } else if (isEligible) {
    label = '100% Match • Eligible';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-semibold tracking-wide ${badgeStyle}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}
