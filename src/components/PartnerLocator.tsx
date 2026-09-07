'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ChannelPartner, PartnerDistanceResult, PartnerType } from '@/types/partner';
import partnersData from '@/data/channelPartners.json';
import {
  KNOWN_CITY_COORDINATES,
  getCityCoordinates,
  filterAndRankPartners,
} from '@/utils/geoDistance';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  MapPin,
  Building2,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail,
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LocateFixed,
} from 'lucide-react';

interface PartnerLocatorProps {
  initialSchemeId?: string;
  initialCity?: string;
}

const ALL_PARTNERS: ChannelPartner[] = partnersData.partners as ChannelPartner[];

export default function PartnerLocator({
  initialSchemeId,
  initialCity,
}: PartnerLocatorProps) {
  const { t, isHindi } = useLanguage();

  // Selected location
  const [selectedCity, setSelectedCity] = useState<string>(initialCity || 'Lucknow');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number }>(() => {
    const coords = getCityCoordinates(initialCity || 'Lucknow');
    return { lat: coords.lat, lon: coords.lon };
  });

  // Filters
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerType | 'ALL'>('ALL');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(initialSchemeId || 'ALL');
  const [onlyApprovedNPA, setOnlyApprovedNPA] = useState<boolean>(true);
  const [selectedPartnerForVoucher, setSelectedPartnerForVoucher] = useState<PartnerDistanceResult | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Quick select cities
  const quickCities = ['Lucknow', 'New Delhi', 'Gurugram', 'Kanpur', 'Mumbai', 'Bengaluru', 'Patna', 'Jaipur'];

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const coords = getCityCoordinates(cityName);
    setUserCoords({ lat: coords.lat, lon: coords.lon });
  };

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLocating(false);
          setUserCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setSelectedCity('Current Location (GPS)');
        },
        (error) => {
          setIsLocating(false);
          // Fallback to default
          handleCityChange('Lucknow');
        },
        { timeout: 5000 }
      );
    }
  };

  // Rank and filter partners
  const rankedPartners: PartnerDistanceResult[] = useMemo(() => {
    return filterAndRankPartners(ALL_PARTNERS, {
      userLat: userCoords.lat,
      userLon: userCoords.lon,
      selectedSchemeId: selectedSchemeId === 'ALL' ? undefined : selectedSchemeId,
      selectedPartnerType,
      onlyApprovedNPA,
    });
  }, [userCoords, selectedSchemeId, selectedPartnerType, onlyApprovedNPA]);

  const approvedCount = rankedPartners.filter((p) => p.isEligibleForRouting).length;
  const excludedCount = ALL_PARTNERS.filter((p) => !p.activeLendingWindow || p.npaRate > 5.0).length;

  return (
    <div className="w-full space-y-8">
      {/* Top Audit Banner */}
      <div className="bg-black text-white rounded-3xl p-6 md:p-8 border-2 border-black shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-xs font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('locatorAuditBadge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('locatorTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {t('locatorSubtitle')}
          </p>
        </div>

        {/* Audit Stats Widget */}
        <div className="flex gap-4 sm:gap-6 bg-zinc-900 border border-zinc-700 p-4 rounded-2xl flex-shrink-0">
          <div>
            <div className="text-2xl font-extrabold text-white">{approvedCount}</div>
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {isHindi ? 'सत्यापित पार्टनर' : 'Audited Active'}
            </div>
          </div>
          <div className="w-[1px] bg-zinc-700 h-10 my-auto" />
          <div>
            <div className="text-2xl font-extrabold text-zinc-400">{excludedCount}</div>
            <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {isHindi ? 'एनपीए बहिष्कृत' : 'High NPA Blocked'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          {/* Location Input & City Chips (6 cols) */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-sm font-bold text-black flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-700" />
                {t('locatorSelectLocation')}
              </span>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="text-xs font-semibold text-zinc-700 hover:text-black flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300 transition-colors"
              >
                <LocateFixed className="w-3 h-3" />
                {isLocating ? 'Locating...' : t('locatorDetectLocation')}
              </button>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="Enter city (e.g. Lucknow, Delhi, Kanpur, Mumbai)"
                className="flex-1 px-4 py-2.5 font-bold text-sm border-2 border-black rounded-full focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Quick city tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleCityChange(city)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium border transition-colors ${
                    selectedCity.toLowerCase() === city.toLowerCase()
                      ? 'bg-black text-white border-black'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Partner Type Filter (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-zinc-700" />
              {t('locatorFilterType')}
            </label>
            <select
              value={selectedPartnerType}
              onChange={(e) => setSelectedPartnerType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 font-bold text-xs sm:text-sm border-2 border-black rounded-full focus:outline-none bg-white"
            >
              <option value="ALL">{t('locatorAllTypes')}</option>
              <option value="SCA">SCA (State Agencies - UPSCFDC etc.)</option>
              <option value="Public Sector Bank">Public Sector Bank (SBI, PNB, BoB)</option>
              <option value="Regional Rural Bank">Regional Rural Bank (Aryavart, etc.)</option>
              <option value="NBFC-MFI">NBFC-MFI & Nodal (NABFINS, SIDBI)</option>
            </select>
          </div>

          {/* Scheme Filter (3 cols) */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-sm font-bold text-black flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-zinc-700" />
              {t('locatorFilterScheme')}
            </label>
            <select
              value={selectedSchemeId}
              onChange={(e) => setSelectedSchemeId(e.target.value)}
              className="w-full px-3.5 py-2.5 font-bold text-xs sm:text-sm border-2 border-black rounded-full focus:outline-none bg-white"
            >
              <option value="ALL">{t('locatorAllSchemes')}</option>
              <option value="pmegp-01">PMEGP (KVIC / State DIC)</option>
              <option value="mudra-03">MUDRA (Shishu / Kishore / Tarun)</option>
              <option value="standup-india-04">Stand-Up India (Women & SC/ST)</option>
              <option value="pm-vishwakarma-02">PM Vishwakarma Scheme</option>
              <option value="pmfme-08">PMFME (Food Processing)</option>
              <option value="cgtmse-07">CGTMSE Guarantee</option>
              <option value="sc-st-hub-19">National SC-ST Hub</option>
              <option value="pmsvanidhi-05">PM SVANidhi</option>
            </select>
          </div>
        </div>

        {/* Audit Filter Toggle Bar */}
        <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-black">
                {t('locatorAuditToggle')}
              </div>
              <p className="text-xs text-zinc-500">
                {isHindi
                  ? 'उद्यमियों के ऋण आवेदनों को अस्वीकृति से बचाने के लिए 5% से अधिक एनपीए वाले संस्थानों को स्वचालित रूप से हटा दिया जाता है।'
                  : 'Applications are protected by strictly filtering out branches with high NPAs (>5%) or prolonged loan overdues.'}
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={onlyApprovedNPA}
              onChange={(e) => setOnlyApprovedNPA(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            <span className="ml-2 text-xs font-bold text-zinc-800">
              {onlyApprovedNPA ? (isHindi ? 'सक्रिय' : 'Filter Active') : (isHindi ? 'सभी देखें' : 'Show All')}
            </span>
          </label>
        </div>
      </div>

      {/* Visual Proximity Radar Map (B&W High-Contrast Styling) */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-black">
                {isHindi ? 'जियो-स्पेशियल निकटता रडार' : 'Geo-Spatial Proximity Radar'}
              </h3>
              <p className="text-xs text-zinc-500">
                {isHindi
                  ? `आपके चयनित केंद्र (${selectedCity}) के सापेक्ष 50 किमी के दायरे में चैनल पार्टनर्स का मानचित्रण`
                  : `Visual mapping of channel partners within 50km radius of ${selectedCity}`}
              </p>
            </div>
          </div>

          {/* Map legend */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-black" />
              {isHindi ? 'स्वीकृत (कम एनपीए)' : 'Approved (Low NPA)'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 border border-black" />
              {isHindi ? 'बहिष्कृत (उच्च एनपीए)' : 'Excluded (>5% NPA)'}
            </span>
          </div>
        </div>

        {/* SVG Radar Visualization */}
        <div className="relative w-full h-72 sm:h-80 bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800">
          <svg
            className="w-full h-full"
            viewBox="0 0 600 320"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Concentric distance circles from center (300, 160) */}
            <circle cx="300" cy="160" r="45" fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="300" cy="160" r="95" fill="none" stroke="#3f3f46" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="300" cy="160" r="140" fill="none" stroke="#52525b" strokeWidth="1" />

            {/* Radar Crosshairs */}
            <line x1="150" y1="160" x2="450" y2="160" stroke="#27272a" strokeWidth="1" />
            <line x1="300" y1="20" x2="300" y2="300" stroke="#27272a" strokeWidth="1" />

            {/* Distance labels */}
            <text x="305" y="118" fill="#71717a" fontSize="10" fontFamily="sans-serif">10 km</text>
            <text x="305" y="68" fill="#71717a" fontSize="10" fontFamily="sans-serif">25 km</text>
            <text x="305" y="26" fill="#a1a1aa" fontSize="10" fontFamily="sans-serif">50 km</text>

            {/* User Location Pin (Center) */}
            <circle cx="300" cy="160" r="8" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx="300" cy="160" r="16" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.4" className="animate-ping" />
            <text x="300" y="185" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              You ({selectedCity})
            </text>

            {/* Partner Pins */}
            {rankedPartners.slice(0, 10).map((partner, index) => {
              // Calculate screen coordinates relative to center (300, 160)
              // 1 km roughly corresponds to 2.8 pixels up to 50km
              const dLat = (partner.latitude - userCoords.lat) * 111; // km
              const dLon = (partner.longitude - userCoords.lon) * 111 * Math.cos((userCoords.lat * Math.PI) / 180);
              const scale = 2.6;
              const px = Math.min(560, Math.max(40, 300 + dLon * scale));
              const py = Math.min(300, Math.max(30, 160 - dLat * scale));

              const isApproved = partner.isEligibleForRouting;

              return (
                <g key={partner.id} className="cursor-pointer group">
                  <circle
                    cx={px}
                    cy={py}
                    r={isApproved ? 7 : 8}
                    fill={isApproved ? '#10b981' : '#f43f5e'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />
                  <text
                    x={px}
                    y={py - 10}
                    fill="#e4e4e7"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    className="opacity-80 group-hover:opacity-100"
                  >
                    {partner.name.slice(0, 14)}... ({partner.distanceKm}km)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Partner List Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl text-black">
            {isHindi ? 'निकटतम अधिकृत चैनल पार्टनर्स' : 'Nearest Authorized Channel Partners'} ({rankedPartners.length})
          </h3>
          <span className="text-xs text-zinc-500 font-medium">
            {isHindi ? 'दूरी एवं फंड उपयोगिता द्वारा क्रमबद्ध' : 'Sorted by distance & fund health'}
          </span>
        </div>

        {rankedPartners.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-3xl p-12 text-center space-y-4">
            <Building2 className="w-12 h-12 mx-auto text-zinc-400" />
            <h4 className="font-bold text-lg text-black">
              {isHindi ? 'कोई चैनल पार्टनर नहीं मिला' : 'No Channel Partners Found'}
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {isHindi
                ? 'कृपया अपना चयनित शहर या फ़िल्टर बदलें, या सभी संस्थानों को देखने के लिए एनपीए फ़िल्टर को समायोजित करें।'
                : 'Try changing your location or adjusting the scheme and partner type filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {rankedPartners.map((partner) => {
              const isApproved = partner.isEligibleForRouting;

              return (
                <div
                  key={partner.id}
                  className={`bg-white border-2 rounded-3xl p-6 md:p-7 shadow-sm transition-all flex flex-col justify-between gap-5 ${
                    isApproved
                      ? 'border-black hover:shadow-md'
                      : 'border-rose-300 bg-rose-50/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Partner identity */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-black text-white">
                          {partner.type}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-300 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-zinc-600" />
                          {partner.distanceKm} km {isHindi ? 'दूरी' : 'away'}
                        </span>
                        {isApproved ? (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            {t('locatorStatusApproved')}
                          </span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-700" />
                            {t('locatorStatusExcluded')}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg md:text-xl font-extrabold text-black">
                        {isHindi ? partner.nameHi : partner.name}
                      </h4>
                      <p className="text-xs font-semibold text-zinc-600">
                        {partner.branchName} • {partner.address}, {partner.city}, {partner.state} - {partner.pincode}
                      </p>
                    </div>

                    {/* Quick NPA & Utilization Score Box */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 sm:p-4 flex-shrink-0 flex gap-4 text-center">
                      <div>
                        <div className={`text-base sm:text-lg font-extrabold ${partner.npaRate <= 5.0 ? 'text-black' : 'text-rose-600'}`}>
                          {partner.npaRate}%
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          {t('locatorNpaRate')}
                        </div>
                      </div>
                      <div className="w-[1px] bg-zinc-300 h-8 my-auto" />
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-black">
                          {partner.fundUtilizationScore}%
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          {t('locatorFundUtilization')}
                        </div>
                      </div>
                      <div className="w-[1px] bg-zinc-300 h-8 my-auto" />
                      <div>
                        <div className="text-base sm:text-lg font-extrabold text-emerald-700">
                          {formatCurrency(partner.allocatedBudgetRemaining)}
                        </div>
                        <div className="text-[10px] text-zinc-500 uppercase font-semibold">
                          {isHindi ? 'बजट शेष' : 'Budget'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Exclusion alert if disqualified */}
                  {!isApproved && (
                    <div className="bg-rose-100/80 border border-rose-300 rounded-2xl p-3.5 text-xs text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                      <span>
                        <strong>{isHindi ? 'ऑडिट चेतावनी:' : 'Audit Rejection:'}</strong>{' '}
                        {isHindi ? partner.exclusionReasonHi || partner.exclusionReason : partner.exclusionReason}
                      </span>
                    </div>
                  )}

                  {/* Footer details & Action */}
                  <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-zinc-600 space-y-1">
                      <div className="flex items-center gap-2 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-bold text-black">{t('locatorNodalOfficer')}:</span>
                        <span>{partner.nodalOfficer}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {partner.contactPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {partner.contactEmail}
                        </span>
                      </div>
                    </div>

                    {/* Routing CTA */}
                    <div>
                      {isApproved ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPartnerForVoucher(partner)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
                        >
                          {t('locatorRouteBtn')}
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full sm:w-auto px-5 py-2.5 bg-zinc-200 text-zinc-500 font-bold text-xs rounded-full cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isHindi ? 'राउटिंग अवरुद्ध (उच्च एनपीए)' : 'Routing Blocked (High NPA)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Routing Pre-Approval Voucher Modal */}
      {selectedPartnerForVoucher && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Voucher Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-black">
                    {t('locatorRoutingSuccess')}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {t('locatorVoucherText')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartnerForVoucher(null)}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Voucher Slip Details */}
            <div className="bg-zinc-50 border-2 border-dashed border-zinc-400 rounded-2xl p-5 space-y-4 font-mono text-xs">
              <div className="flex justify-between items-center text-zinc-500 border-b border-zinc-200 pb-2">
                <span>VOUCHER REF:</span>
                <span className="font-bold text-black text-sm">
                  USETU-2026-{selectedPartnerForVoucher.id.toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}
                </span>
              </div>

              <div className="space-y-1 font-sans">
                <span className="text-[10px] text-zinc-500 font-mono uppercase">Target Channel Partner:</span>
                <div className="font-extrabold text-sm text-black">
                  {isHindi ? selectedPartnerForVoucher.nameHi : selectedPartnerForVoucher.name}
                </div>
                <div className="text-zinc-600 text-xs">
                  {selectedPartnerForVoucher.branchName} • {selectedPartnerForVoucher.address}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 pt-3">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Nodal Officer:</span>
                  <div className="font-bold text-black font-sans">{selectedPartnerForVoucher.nodalOfficer}</div>
                  <div className="text-zinc-600">{selectedPartnerForVoucher.contactPhone}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">NPA Health Clearance:</span>
                  <div className="font-bold text-emerald-700 font-sans">
                    NPA: {selectedPartnerForVoucher.npaRate}% (Compliant &lt;5%)
                  </div>
                  <div className="text-zinc-600 font-sans">
                    Utilization: {selectedPartnerForVoucher.fundUtilizationScore}%
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-emerald-900 font-sans text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  {isHindi
                    ? 'आवेदन सीधे बैंक/एससीए के प्राथमिकता एमएसएमई डेस्क को अग्रेषित किया गया है।'
                    : 'Priority routing slip active. Present this reference code to the Nodal Branch Officer.'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  alert(isHindi ? 'राउटिंग स्लिप सफलतापूर्वक जनरेट की गई!' : 'Routing voucher slip downloaded successfully.');
                  setSelectedPartnerForVoucher(null);
                }}
                className="flex-1 py-3 bg-black hover:bg-zinc-800 text-white font-bold text-sm rounded-full transition-all text-center"
              >
                {isHindi ? 'राउटिंग स्लिप सेव करें' : 'Download Routing Slip'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPartnerForVoucher(null)}
                className="px-5 py-3 border-2 border-black rounded-full font-bold text-sm text-black hover:bg-zinc-100 transition-all"
              >
                {isHindi ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

