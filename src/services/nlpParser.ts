import { UserProfile, IncomeRange, Gender, Category, BusinessStatus, BusinessType, STATE_ALIASES, INDIAN_STATES } from '@/types';

export function parseNaturalLanguageProfile(text: string): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {};
  const lowerText = text.toLowerCase();

  // Age extraction
  const ageMatch = lowerText.match(/(\d+)\s*(year|years|age|y\/o)/);
  if (ageMatch && ageMatch[1]) {
    profile.age = parseInt(ageMatch[1], 10);
  }

  // Gender extraction
  if (lowerText.match(/\b(woman|female|women|girl)\b/)) {
    profile.gender = 'Female';
  } else if (lowerText.match(/\b(man|male|men|boy)\b/)) {
    profile.gender = 'Male';
  } else if (lowerText.match(/\b(other|transgender)\b/)) {
    profile.gender = 'Other';
  }

  // Category extraction
  if (lowerText.match(/\b(sc)\b/)) {
    profile.category = 'SC';
  } else if (lowerText.match(/\b(st)\b/)) {
    profile.category = 'ST';
  } else if (lowerText.match(/\b(obc)\b/)) {
    profile.category = 'OBC';
  } else if (lowerText.match(/\b(minority)\b/)) {
    profile.category = 'Minority';
  } else if (lowerText.match(/\b(general|unreserved)\b/)) {
    profile.category = 'General';
  }

  // Income extraction
  if (lowerText.match(/(income|earn|make|salary)/)) {
    if (lowerText.match(/(less than 1|under 1|<=1)\s*lakh/)) profile.annualIncome = 'Below ₹1 lakh';
    else if (lowerText.match(/(1 to 2\.5|1-2\.5)\s*lakh/)) profile.annualIncome = '₹1–2.5 lakh';
    else if (lowerText.match(/(2\.5 to 5|2\.5-5)\s*lakh/)) profile.annualIncome = '₹2.5–5 lakh';
    else if (lowerText.match(/(5 to 10|5-10)\s*lakh/)) profile.annualIncome = '₹5–10 lakh';
    else if (lowerText.match(/(more than 10|over 10|>10|above 10)\s*lakh/)) profile.annualIncome = 'Above ₹10 lakh';
    else {
      // Try to extract a numeric income value and map to range
      const incomeNumMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*lakh/);
      if (incomeNumMatch) {
        const val = parseFloat(incomeNumMatch[1]);
        if (val < 1) profile.annualIncome = 'Below ₹1 lakh';
        else if (val <= 2.5) profile.annualIncome = '₹1–2.5 lakh';
        else if (val <= 5) profile.annualIncome = '₹2.5–5 lakh';
        else if (val <= 10) profile.annualIncome = '₹5–10 lakh';
        else profile.annualIncome = 'Above ₹10 lakh';
      }
    }
  }

  // Business status
  if (lowerText.match(/(new business|start|starting|planning)/)) {
    profile.businessStatus = 'Starting a new business';
  } else if (lowerText.match(/(existing|running|already have|expand)/)) {
    profile.businessStatus = 'Existing business';
  } else if (lowerText.match(/(unemployed|no job)/)) {
    profile.businessStatus = 'Unemployed';
  } else if (lowerText.match(/(self employed|freelance)/)) {
    profile.businessStatus = 'Self-employed';
  }

  // Project cost extraction
  const costMatch = lowerText.match(/(cost|need|require|project|loan).*?(\d+(\.\d+)?)\s*lakh/);
  if (costMatch && costMatch[2]) {
    profile.projectCost = parseFloat(costMatch[2]) * 100000;
  }

  // Business Type / Sector
  if (lowerText.match(/(manufacturing|make|produce|factory)/)) profile.businessType = 'Manufacturing';
  else if (lowerText.match(/(service|salon|repair|it|software)/)) profile.businessType = 'Service';
  else if (lowerText.match(/(trading|shop|retail|wholesale|sell)/)) profile.businessType = 'Trading';
  else if (lowerText.match(/(agriculture|farm|crop|dairy)/)) profile.businessType = 'Agriculture';
  else if (lowerText.match(/(food|cook|restaurant|canteen)/)) profile.businessType = 'Food';
  else if (lowerText.match(/(tailor|textile|cloth|stitch)/)) profile.businessType = 'Tailoring/Textiles';
  else if (lowerText.match(/(handicraft|craft|artisan)/)) profile.businessType = 'Handicrafts';

  // Indian States extraction with alias & abbreviation support (e.g. UP, HR, DL, MP, RJ, etc.)
  for (const [alias, fullState] of Object.entries(STATE_ALIASES)) {
    const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(lowerText)) {
      profile.state = fullState;
      break;
    }
  }

  if (!profile.state) {
    for (const state of INDIAN_STATES) {
      if (lowerText.includes(state.toLowerCase())) {
        profile.state = state;
        break;
      }
    }
  }

  // City / District extraction
  const cityRegex = /(?:in|from|city|district|living in|located in|at)\s+([a-zA-Z]+)(?:[,\s]+(?:city|district|town))?/i;
  const cityMatch = text.match(cityRegex);
  if (cityMatch && cityMatch[1]) {
    const candidate = cityMatch[1].trim();
    const commonWords = ['a', 'the', 'my', 'our', 'new', 'start', 'general', 'sc', 'st', 'obc', 'female', 'male', 'india'];
    const isState = INDIAN_STATES.some((s) => s.toLowerCase() === candidate.toLowerCase()) || 
                    Object.keys(STATE_ALIASES).some((a) => a.toLowerCase() === candidate.toLowerCase());
    if (!commonWords.includes(candidate.toLowerCase()) && !isState && candidate.length > 2) {
      profile.city = candidate.charAt(0).toUpperCase() + candidate.slice(1);
    }
  }

  return profile;
}
