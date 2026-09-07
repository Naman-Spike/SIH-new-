import dynamic from 'next/dynamic';
import React from 'react';
import { PartnerDistanceResult } from '@/types/partner';

const PartnerMapClient = dynamic(() => import('./PartnerMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[420px] bg-zinc-950 rounded-2xl flex items-center justify-center border-2 border-black">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-zinc-700 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-zinc-500 font-semibold">Loading Map...</span>
      </div>
    </div>
  ),
});

interface PartnerMapProps {
  userLat: number;
  userLon: number;
  selectedCity: string;
  partners: PartnerDistanceResult[];
  onSelectPartner: (partner: PartnerDistanceResult) => void;
}

export default function PartnerMap(props: PartnerMapProps) {
  return <PartnerMapClient {...props} />;
}
