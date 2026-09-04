import { NextRequest, NextResponse } from 'next/server';
import { matchSchemesAsync } from '@/services/matchingEngine';
import { UserProfile } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile = body as UserProfile;
    
    if (!profile) {
      return NextResponse.json({ error: 'User profile is required' }, { status: 400 });
    }
    
    const matches = await matchSchemesAsync(profile);
    
    return NextResponse.json({ matches });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to match schemes' }, { status: 500 });
  }
}
