'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import styles from './partner-map.module.css';
import 'leaflet/dist/leaflet.css';
import { PartnerDistanceResult } from '@/types/partner';
import { useLanguage } from '@/context/LanguageContext';

// Fix Leaflet default icon path issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom animated beacon icon
const createBeaconIcon = (color: string, size: number = 28) =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};
          opacity:0.25;
          animation:beacon-ping 2s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;inset:${size * 0.14}px;border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.7);
          box-shadow:0 0 12px ${color};
        "></div>
      </div>
      <style>
        @keyframes beacon-ping {
          0% { transform: scale(1); opacity: 0.4; }
          75% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

const userIcon = createBeaconIcon('#ffffff', 32);
const partnerApprovedIcon = createBeaconIcon('#10b981', 24);
const partnerExcludedIcon = createBeaconIcon('#f43f5e', 24);

// Infrastructure category colors
const INFRA_COLORS: Record<string, string> = {
  'Government Office': '#a1a1aa',
  'District Administration': '#8b5cf6',
  Hospital: '#ef4444',
  'Police Station': '#3b82f6',
  'Fire Station': '#f97316',
  Bank: '#22c55e',
  'Nearby Service': '#71717a',
};

// Recenter helper component
function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    if (map && lat && lon) {
      map.setView([lat, lon], map.getZoom(), { animate: true });
    }
  }, [map, lat, lon]);
  return null;
}

export interface NearbyPlace {
  id: number | string;
  lat: number;
  lon: number;
  name: string;
  category: string;
  distance_m: number;
}

interface PartnerMapClientProps {
  userLat: number;
  userLon: number;
  selectedCity: string;
  partners: PartnerDistanceResult[];
  onSelectPartner: (partner: PartnerDistanceResult) => void;
}

export default function PartnerMapClient({
  userLat,
  userLon,
  selectedCity,
  partners,
  onSelectPartner,
}: PartnerMapClientProps) {
  const { isHindi } = useLanguage();
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [showInfra, setShowInfra] = useState(true);

  // Fetch nearby infrastructure when user location changes
  useEffect(() => {
    if (!userLat || !userLon) return;

    let active = true;
    setLoadingPlaces(true);

    const fetchNearby = async () => {
      try {
        const params = new URLSearchParams({
          lat: String(userLat),
          lon: String(userLon),
          radius: '5000',
        });
        const res = await fetch(`/api/map/nearby?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data.places) {
            setNearbyPlaces(data.places);
          }
        }
      } catch {
        // Silently fail — infrastructure overlay is optional
      } finally {
        if (active) setLoadingPlaces(false);
      }
    };

    fetchNearby();
    return () => { active = false; };
  }, [userLat, userLon]);

  // Memoize partner markers
  const partnerMarkers = useMemo(
    () =>
      partners.slice(0, 20).map((partner) => ({
        partner,
        icon: partner.isEligibleForRouting ? partnerApprovedIcon : partnerExcludedIcon,
      })),
    [partners]
  );

  return (
    <div className={styles.mapRoot}>
      {/* Infrastructure toggle */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setShowInfra(!showInfra)}
          className={`text-[10px] font-bold px-3 py-1.5 rounded-full border-2 transition-colors ${
            showInfra
              ? 'bg-black text-white border-black'
              : 'bg-white/90 text-zinc-700 border-zinc-400'
          }`}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {showInfra
            ? isHindi ? '🏛️ इन्फ्रा छिपाएं' : '🏛️ Hide Infra'
            : isHindi ? '🏛️ इन्फ्रा दिखाएं' : '🏛️ Show Infra'}
        </button>
      </div>

      {/* Loading overlay */}
      {loadingPlaces && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>
            {isHindi ? 'नज़दीकी संसाधन खोज रहे हैं...' : 'Loading nearby infrastructure...'}
          </span>
        </div>
      )}

      <MapContainer
        center={[userLat, userLon]}
        zoom={12}
        zoomControl={false}
        style={{ height: '420px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <ZoomControl position="bottomright" />
        <Recenter lat={userLat} lon={userLon} />

        {/* Dark-themed tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        <Marker position={[userLat, userLon]} icon={userIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 4 }}>
                📍 {isHindi ? 'आपकी लोकेशन' : 'Your Location'}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: 11 }}>{selectedCity}</div>
              <div style={{ color: '#71717a', fontSize: 10, marginTop: 4 }}>
                {userLat.toFixed(4)}°N, {userLon.toFixed(4)}°E
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Channel Partner markers */}
        {partnerMarkers.map(({ partner, icon }) => (
          <Marker
            key={partner.id}
            position={[partner.latitude, partner.longitude]}
            icon={icon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    marginBottom: 6,
                    borderBottom: '1px solid #3f3f46',
                    paddingBottom: 6,
                  }}
                >
                  {isHindi ? partner.nameHi : partner.name}
                </div>
                <div style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 2 }}>
                  {partner.branchName} • {partner.city}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: partner.npaRate <= 5 ? '#10b981' : '#f43f5e' }}>
                    NPA: {partner.npaRate}%
                  </span>
                  <span style={{ color: '#e4e4e7' }}>
                    {partner.distanceKm} km
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                      background: partner.isEligibleForRouting ? '#065f46' : '#7f1d1d',
                      color: '#fff',
                    }}
                  >
                    {partner.type}
                  </span>
                </div>
                {partner.isEligibleForRouting && (
                  <button
                    type="button"
                    onClick={() => onSelectPartner(partner)}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      padding: '6px 0',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      borderRadius: 999,
                      fontWeight: 800,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {isHindi ? 'राउट करें →' : 'Route to Partner →'}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Nearby infrastructure markers */}
        {showInfra &&
          nearbyPlaces.map((place) => (
            <CircleMarker
              key={place.id}
              center={[place.lat, place.lon]}
              radius={6}
              pathOptions={{
                fillColor: INFRA_COLORS[place.category] || '#71717a',
                fillOpacity: 0.8,
                color: '#fff',
                weight: 1.5,
              }}
            >
              <Popup>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
                    {place.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#a1a1aa' }}>
                    {place.category} • {(place.distance_m / 1000).toFixed(1)} km
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Map legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 36,
          left: 12,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.85)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          backdropFilter: 'blur(8px)',
          border: '1px solid #3f3f46',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#e4e4e7', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '1px solid #000', display: 'inline-block' }} />
          {isHindi ? 'आपकी लोकेशन' : 'You'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#10b981', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          {isHindi ? 'स्वीकृत पार्टनर' : 'Approved Partner'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#f43f5e', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
          {isHindi ? 'बहिष्कृत (NPA)' : 'Excluded (NPA)'}
        </div>
        {showInfra && (
          <>
            <div style={{ borderTop: '1px solid #3f3f46', paddingTop: 4, marginTop: 2 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#22c55e', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              {isHindi ? 'बैंक' : 'Banks'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#a1a1aa', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a1a1aa', display: 'inline-block' }} />
              {isHindi ? 'सरकारी कार्यालय' : 'Govt Offices'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#ef4444', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              {isHindi ? 'अस्पताल' : 'Hospitals'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
