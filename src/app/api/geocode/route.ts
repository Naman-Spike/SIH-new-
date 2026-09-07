import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    if (!q) {
      return NextResponse.json({ error: 'Missing query parameter "q"' }, { status: 400 });
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'UdhyogSetu-SIH/1.0 (scheme-matching-app)',
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Nominatim request failed', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const result = data[0];
    return NextResponse.json({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      display_name: result.display_name,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Geocoding failed', details: err.message },
      { status: 500 }
    );
  }
}
