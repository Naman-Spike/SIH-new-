import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3;
  const p1 = toRad(lat1);
  const p2 = toRad(lat2);
  const dp = toRad(lat2 - lat1);
  const dl = toRad(lon2 - lon1);
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.openstreetmap.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function tryOverpass(query: string) {
  const errors: any[] = [];
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'text/plain' },
      });
      const text = await res.text();
      if (!res.ok) {
        errors.push({ endpoint: url, status: res.status, body: text.slice(0, 200) });
        continue;
      }
      try {
        const json = JSON.parse(text);
        return { json, endpoint: url };
      } catch (parseErr) {
        errors.push({ endpoint: url, parseError: String(parseErr) });
        continue;
      }
    } catch (err: any) {
      errors.push({ endpoint: url, error: String(err) });
    }
  }
  return { error: 'All Overpass endpoints failed', details: errors };
}

function getCategory(tags: Record<string, string> = {}): string {
  if (tags.office === 'government') return 'Government Office';
  if (tags.amenity === 'townhall') return 'District Administration';
  if (tags.amenity === 'hospital') return 'Hospital';
  if (tags.amenity === 'police') return 'Police Station';
  if (tags.amenity === 'fire_station') return 'Fire Station';
  if (tags.amenity === 'bank') return 'Bank';
  return 'Nearby Service';
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const city = params.get('city');
    const state = params.get('state');
    const latParam = params.get('lat');
    const lonParam = params.get('lon');
    const radius = Number(params.get('radius') ?? '5000');

    let centerLat: number | null = null;
    let centerLon: number | null = null;
    let displayName: string | undefined;

    // Use lat/lon if provided, otherwise geocode city/state
    if (latParam && lonParam) {
      centerLat = Number(latParam);
      centerLon = Number(lonParam);
    } else if (city || state) {
      const query = [city, state, 'India'].filter(Boolean).join(', ');
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'UdhyogSetu-SIH/1.0 (scheme-matching-app)',
            Accept: 'application/json',
          },
        }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {
          centerLat = parseFloat(geoData[0].lat);
          centerLon = parseFloat(geoData[0].lon);
          displayName = geoData[0].display_name;
        }
      }
    }

    if (centerLat === null || centerLon === null) {
      return NextResponse.json(
        { error: 'Could not determine location. Provide lat/lon or city/state.' },
        { status: 400 }
      );
    }

    // Query Overpass API for nearby infrastructure
    const amenitiesToQuery = [
      'amenity=hospital',
      'amenity=police',
      'amenity=fire_station',
      'amenity=bank',
      'office=government',
      'amenity=townhall',
    ];

    const clauses = amenitiesToQuery
      .map(
        (tag) =>
          `node[${tag}](around:${radius},${centerLat},${centerLon});`
      )
      .join('\n');

    const overpassQuery = `[out:json][timeout:15];(\n${clauses}\n);out body 50;`;

    const result = await tryOverpass(overpassQuery);
    if ('error' in result) {
      return NextResponse.json(result, { status: 502 });
    }

    const elements = result.json.elements || [];
    const places = elements.map((el: any) => ({
      id: el.id,
      lat: el.lat,
      lon: el.lon,
      name: el.tags?.name || el.tags?.['name:en'] || 'Unnamed',
      category: getCategory(el.tags || {}),
      tags: el.tags || {},
      distance_m: haversineDistanceMeters(centerLat!, centerLon!, el.lat, el.lon),
    }));

    // Sort by distance
    places.sort((a: any, b: any) => a.distance_m - b.distance_m);

    return NextResponse.json({
      center: { lat: centerLat, lon: centerLon, display_name: displayName },
      places,
      radius,
      source: result.endpoint,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Nearby search failed', details: err.message },
      { status: 500 }
    );
  }
}
