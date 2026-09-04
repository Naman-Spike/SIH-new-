import { NextRequest, NextResponse } from 'next/server';
import { getAllSchemesAsync } from '@/services/schemeService';

export async function GET(request: NextRequest) {
  try {
    const schemes = await getAllSchemesAsync();
    return NextResponse.json({ schemes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schemes' }, { status: 500 });
  }
}
