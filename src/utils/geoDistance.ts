import { ChannelPartner, PartnerDistanceResult, PartnerType } from '@/types/partner';

export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lon: number; state: string }> = {
  'lucknow': { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  'kanpur': { lat: 26.4499, lon: 80.3319, state: 'Uttar Pradesh' },
  'varanasi': { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  'agra': { lat: 27.1767, lon: 78.0081, state: 'Uttar Pradesh' },
  'new delhi': { lat: 28.6139, lon: 77.209, state: 'Delhi' },
  'delhi': { lat: 28.6139, lon: 77.209, state: 'Delhi' },
  'gurugram': { lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  'gurgaon': { lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  'faridabad': { lat: 28.4089, lon: 77.3178, state: 'Haryana' },
  'noida': { lat: 28.5355, lon: 77.391, state: 'Uttar Pradesh' },
  'mumbai': { lat: 19.076, lon: 72.8777, state: 'Maharashtra' },
  'pune': { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  'nagpur': { lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  'bangalore': { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  'patna': { lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  'jaipur': { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lon: 73.0243, state: 'Rajasthan' },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  'bhopal': { lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
  'indore': { lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  'kolkata': { lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  'hyderabad': { lat: 17.385, lon: 78.4867, state: 'Telangana' },
  'chennai': { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, state: 'Punjab' },
};

/**
 * Calculates Haversine distance in kilometers between two latitude/longitude points.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export function getCityCoordinates(
  cityOrState: string
): { lat: number; lon: number; city: string; state: string } {
  const query = cityOrState.trim().toLowerCase();
  for (const [key, val] of Object.entries(KNOWN_CITY_COORDINATES)) {
    if (query.includes(key) || key.includes(query)) {
      return {
        lat: val.lat,
        lon: val.lon,
        city: key.charAt(0).toUpperCase() + key.slice(1),
        state: val.state,
      };
    }
  }

  // Fallback default: Lucknow, Uttar Pradesh
  return {
    lat: 26.8467,
    lon: 80.9462,
    city: 'Lucknow',
    state: 'Uttar Pradesh',
  };
}

/**
 * Geocode a city/state string using Nominatim (via /api/geocode proxy).
 * Falls back to local KNOWN_CITY_COORDINATES if the API call fails.
 */
export async function geocodeCity(
  query: string
): Promise<{ lat: number; lon: number; displayName?: string; source: 'nominatim' | 'local' }> {
  // First try the Nominatim API for accurate global coverage
  try {
    const searchQuery = query.includes('India') ? query : `${query}, India`;
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lon) {
        return {
          lat: data.lat,
          lon: data.lon,
          displayName: data.display_name,
          source: 'nominatim',
        };
      }
    }
  } catch {
    // Fall through to local lookup
  }

  // Fallback to local city coordinates dictionary
  const local = getCityCoordinates(query);
  return {
    lat: local.lat,
    lon: local.lon,
    displayName: `${local.city}, ${local.state}`,
    source: 'local',
  };
}

export interface PartnerFilterOptions {
  userLat: number;
  userLon: number;
  selectedSchemeId?: string;
  selectedPartnerType?: PartnerType | 'ALL';
  onlyApprovedNPA?: boolean;
}

/**
 * Evaluates channel partners for distance and fund-utilization / NPA eligibility.
 * Excludes or flags partners with NPA > 5.0% or overdue > 60 days.
 */
export function filterAndRankPartners(
  partners: ChannelPartner[],
  options: PartnerFilterOptions
): PartnerDistanceResult[] {
  const {
    userLat,
    userLon,
    selectedSchemeId,
    selectedPartnerType = 'ALL',
    onlyApprovedNPA = true,
  } = options;

  let results: PartnerDistanceResult[] = partners.map((p) => {
    const distanceKm = haversineDistanceKm(userLat, userLon, p.latitude, p.longitude);
    const isEligibleForRouting =
      p.routingStatus !== 'Excluded - High NPA' &&
      p.activeLendingWindow &&
      p.npaRate <= 5.0 &&
      p.overdueDays <= 60;

    return {
      ...p,
      distanceKm,
      isEligibleForRouting,
    };
  });

  // Filter by Institution Type
  if (selectedPartnerType && selectedPartnerType !== 'ALL') {
    results = results.filter((p) => p.type === selectedPartnerType);
  }

  // Filter by Authorized Scheme
  if (selectedSchemeId && selectedSchemeId !== 'ALL') {
    results = results.filter(
      (p) =>
        p.authorizedSchemes.includes('ALL') ||
        p.authorizedSchemes.includes(selectedSchemeId)
    );
  }

  // Filter by NPA Audit Rule
  if (onlyApprovedNPA) {
    results = results.filter((p) => p.isEligibleForRouting);
  }

  // Sort logic:
  // 1. Approved partners first (if showing mixed)
  // 2. Proximity ascending
  // 3. Fund utilization descending
  results.sort((a, b) => {
    if (a.isEligibleForRouting !== b.isEligibleForRouting) {
      return a.isEligibleForRouting ? -1 : 1;
    }
    if (Math.abs(a.distanceKm - b.distanceKm) > 1.0) {
      return a.distanceKm - b.distanceKm;
    }
    return b.fundUtilizationScore - a.fundUtilizationScore;
  });

  return results;
}

