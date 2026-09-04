import { Scheme, UserProfile, MatchResult, EligibilityStatus, normalizeStateName, formatCurrency } from '@/types';
import { incomeRangeToMaxValue } from '@/types';
import { getAllSchemes, getAllSchemesAsync } from './schemeService';

export async function matchSchemesAsync(profile: UserProfile): Promise<MatchResult[]> {
  const schemes = await getAllSchemesAsync();
  const results = schemes.map((scheme) => matchSingleScheme(profile, scheme));

  return results.sort((a, b) => {
    const statusWeight = {
      'Eligible': 3,
      'Potentially Eligible': 2,
      'Not Eligible': 1,
    };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }
    return b.score - a.score;
  });
}

export function matchSchemes(profile: UserProfile): MatchResult[] {
  const schemes = getAllSchemes();
  const results = schemes.map((scheme) => matchSingleScheme(profile, scheme));

  return results.sort((a, b) => {
    const statusWeight = {
      'Eligible': 3,
      'Potentially Eligible': 2,
      'Not Eligible': 1,
    };
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[b.status] - statusWeight[a.status];
    }
    return b.score - a.score;
  });
}

export function matchSingleScheme(profile: UserProfile, scheme: Scheme): MatchResult {
  let score = 0;
  const matchedConditions: string[] = [];
  const failedConditions: string[] = [];
  const uncertainConditions: string[] = [];
  
  let hasMandatoryFailure = false;
  let hasSoftFailure = false;

  const elig = scheme.eligibility;

  // Gender check (Mandatory)
  if (elig.genders && elig.genders.length > 0 && !elig.genders.includes('ALL') && profile.gender) {
    if ((elig.genders as string[]).includes(profile.gender)) {
      matchedConditions.push(`Gender requirement met (${profile.gender}).`);
    } else {
      failedConditions.push(`Gender mismatch: Scheme specifically targets ${elig.genders.join(', ')}.`);
      hasMandatoryFailure = true;
    }
  } else {
    matchedConditions.push('No specific gender restrictions.');
  }

  // Category check (Mandatory, 20 points)
  if (elig.categories && elig.categories.length > 0 && !elig.categories.includes('ALL') && profile.category) {
    if (elig.categories.includes(profile.category)) {
      score += 20;
      matchedConditions.push(`Category requirement met (${profile.category}).`);
    } else {
      failedConditions.push(`Scheme targets categories: ${elig.categories.join(', ')}.`);
      hasMandatoryFailure = true;
    }
  } else {
    score += 20;
    matchedConditions.push('Open to all categories or category matches.');
  }

  // Age check (Mandatory, 10 points)
  if (profile.age !== undefined && profile.age !== null) {
    let ageValid = true;
    if (elig.minAge !== undefined && elig.minAge !== null && profile.age < elig.minAge) {
      ageValid = false;
      failedConditions.push(`Age is below the minimum required (${elig.minAge} years).`);
    }
    if (elig.maxAge !== undefined && elig.maxAge !== null && profile.age > elig.maxAge) {
      ageValid = false;
      failedConditions.push(`Age is above the maximum allowed (${elig.maxAge} years).`);
    }
    if (ageValid) {
      score += 10;
      matchedConditions.push(`Age requirement met (${elig.minAge || 18}-${elig.maxAge || 65} years).`);
    } else {
      hasMandatoryFailure = true;
    }
  } else {
    uncertainConditions.push('Age not provided.');
  }

  // State check (Mandatory, 10 points)
  const normalizedState = normalizeStateName(profile.state || '');
  if (elig.states && elig.states.length > 0 && !elig.states.includes('ALL') && normalizedState) {
    if (elig.states.includes(normalizedState)) {
      score += 10;
      matchedConditions.push(`State eligibility met (${normalizedState}).`);
    } else {
      failedConditions.push(`Scheme is limited to specific states: ${elig.states.join(', ')}.`);
      hasMandatoryFailure = true;
    }
  } else {
    score += 10;
    matchedConditions.push('Available nationwide or state eligibility met.');
  }

  // Income eligibility (Soft, 20 points)
  if (elig.maxAnnualIncome !== undefined && elig.maxAnnualIncome !== null && profile.annualIncome) {
    const userIncomeMax = incomeRangeToMaxValue(profile.annualIncome);
    if (userIncomeMax <= elig.maxAnnualIncome) {
      score += 20;
      matchedConditions.push(`Income is within the required limit (Up to ${formatCurrency(elig.maxAnnualIncome)}).`);
    } else {
      failedConditions.push(`Income exceeds the scheme limit of ${formatCurrency(elig.maxAnnualIncome)}.`);
      hasSoftFailure = true;
    }
  } else {
    score += 20;
    matchedConditions.push('No income limit restrictions or income condition met.');
  }

  // Business type match (Soft, 15 points)
  if (elig.businessTypes && elig.businessTypes.length > 0 && !elig.businessTypes.includes('ALL') && profile.businessType) {
    if (elig.businessTypes.includes(profile.businessType)) {
      score += 15;
      matchedConditions.push(`Business sector requirement met (${profile.businessType}).`);
    } else {
      failedConditions.push(`Scheme targets business types: ${elig.businessTypes.join(', ')}.`);
      hasSoftFailure = true;
    }
  } else {
    score += 15;
    matchedConditions.push('Open to all business sectors or business type matched.');
  }

  // Project-cost compatibility (Soft, 15 points)
  if (elig.maxProjectCost !== undefined && elig.maxProjectCost !== null && profile.projectCost !== undefined && profile.projectCost !== null) {
    if (profile.projectCost <= elig.maxProjectCost) {
      score += 15;
      matchedConditions.push(`Project cost (${formatCurrency(profile.projectCost)}) is within the maximum limit (${formatCurrency(elig.maxProjectCost)}).`);
    } else {
      failedConditions.push(`Project cost (${formatCurrency(profile.projectCost)}) exceeds scheme limit of ${formatCurrency(elig.maxProjectCost)}.`);
      hasSoftFailure = true;
    }
  } else {
    score += 15;
    matchedConditions.push('Project cost requirement met or not applicable.');
  }

  // Business-status compatibility (Soft, 10 points)
  if (profile.businessStatus) {
    const isNew = ['Starting a new business', 'Unemployed'].includes(profile.businessStatus);
    const isExisting = ['Existing business', 'Self-employed'].includes(profile.businessStatus);

    let statusValid = false;
    if (isNew && elig.newBusinessAllowed) statusValid = true;
    if (isExisting && elig.existingBusinessAllowed) statusValid = true;

    if (statusValid) {
      score += 10;
      matchedConditions.push(`Business status (${profile.businessStatus}) is eligible.`);
    } else {
      const reasons: string[] = [];
      if (!elig.newBusinessAllowed) reasons.push('new business not supported');
      if (!elig.existingBusinessAllowed) reasons.push('existing business not supported');
      failedConditions.push(`Business status incompatible (${profile.businessStatus}): ${reasons.join(', ')}.`);
      hasSoftFailure = true;
    }
  } else {
    uncertainConditions.push('Business status not provided.');
  }

  let status: EligibilityStatus = 'Eligible';
  if (hasMandatoryFailure) {
    status = 'Not Eligible';
  } else if (hasSoftFailure) {
    status = 'Potentially Eligible';
  } else if (uncertainConditions.length > 0) {
    status = 'Potentially Eligible';
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    status,
    score,
    matchedConditions,
    failedConditions,
    uncertainConditions,
  };
}
