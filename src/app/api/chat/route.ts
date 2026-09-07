import { NextRequest, NextResponse } from 'next/server';
import { handleChatMessage } from '@/services/chatbotService';
import { getSchemeByIdAsync } from '@/services/schemeService';
import { matchSingleScheme } from '@/services/matchingEngine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, schemeId, userProfile, matchResult, language } = body;
    
    if (!message || !schemeId) {
      return NextResponse.json({ error: 'Message and schemeId are required' }, { status: 400 });
    }
    
    const scheme = await getSchemeByIdAsync(schemeId);
    if (!scheme) {
      return NextResponse.json({ error: 'Scheme not found' }, { status: 404 });
    }
    
    let currentMatchResult = matchResult || null;
    
    if (!currentMatchResult && userProfile) {
      currentMatchResult = matchSingleScheme(userProfile, scheme);
    }
    
    const response = handleChatMessage(message, scheme, userProfile || null, currentMatchResult, language);
    
    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
