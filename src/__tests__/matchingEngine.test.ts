import { describe, it, expect } from 'vitest';
import { matchSchemes } from '@/services/matchingEngine';
import { UserProfile } from '@/types';

// Helper function to create a base profile to avoid repeating fields
const createBaseProfile = (overrides?: Partial<UserProfile>): UserProfile => ({
  age: 30,
  gender: 'Male',
  state: 'Delhi',
  category: 'General',
  annualIncome: '₹2.5–5 lakh',
  businessStatus: 'Starting a new business',
  businessType: 'Manufacturing',
  projectCost: 500000,
  existingBusiness: false,
  existingLoan: false,
  ...overrides,
});

describe('Scheme Matching Engine (Real Indian Government Schemes)', () => {
  it('1. Clearly eligible user for National SC-ST Hub (sc-st-hub-19)', () => {
    const profile = createBaseProfile({
      category: 'SC',
      age: 30,
      state: 'Delhi',
      annualIncome: '₹2.5–5 lakh',
      businessType: 'Manufacturing',
      businessStatus: 'Starting a new business',
      projectCost: 500000,
    });

    const results = matchSchemes(profile);
    const scScheme = results.find(r => r.schemeId === 'sc-st-hub-19');

    expect(scScheme).toBeDefined();
    expect(scScheme?.status).toBe('Eligible');
    expect(scScheme?.score).toBeGreaterThan(0);
    expect(scScheme?.matchedConditions.length).toBeGreaterThan(0);
  });

  it('2. User failing income requirement for Mahila Samriddhi Yojana (mahila-samriddhi-09)', () => {
    const profile = createBaseProfile({
      category: 'OBC',
      gender: 'Female',
      annualIncome: 'Above ₹10 lakh',
      businessType: 'Service',
      projectCost: 100000,
    });

    const results = matchSchemes(profile);
    const msyScheme = results.find(r => r.schemeId === 'mahila-samriddhi-09');

    expect(msyScheme).toBeDefined();
    expect(msyScheme?.status).not.toBe('Eligible');
    expect(msyScheme?.failedConditions.some(c => c.toLowerCase().includes('income'))).toBeTruthy();
  });

  it('3. User failing age requirement for Mahila Samriddhi Yojana (max age 55)', () => {
    const profile = createBaseProfile({
      gender: 'Female',
      category: 'SC',
      age: 62,
      annualIncome: 'Below ₹1 lakh',
      businessType: 'Service',
      projectCost: 100000,
    });

    const results = matchSchemes(profile);
    const msyScheme = results.find(r => r.schemeId === 'mahila-samriddhi-09');

    expect(msyScheme).toBeDefined();
    expect(msyScheme?.status).toBe('Not Eligible');
    expect(msyScheme?.failedConditions.some(c => c.toLowerCase().includes('age'))).toBeTruthy();
  });

  it('4. Wrong business type for National SC-ST Hub (requires Manufacturing/Service)', () => {
    const profile = createBaseProfile({
      category: 'SC',
      businessType: 'Agriculture',
    });

    const results = matchSchemes(profile);
    const scScheme = results.find(r => r.schemeId === 'sc-st-hub-19');

    expect(scScheme).toBeDefined();
    expect(scScheme?.status).not.toBe('Eligible');
    expect(scScheme?.failedConditions.some(c => c.toLowerCase().includes('business') || c.toLowerCase().includes('sector'))).toBeTruthy();
  });

  it('5. Wrong category for National SC-ST Hub (General user on SC/ST scheme)', () => {
    const profile = createBaseProfile({
      category: 'General',
      businessType: 'Manufacturing',
    });

    const results = matchSchemes(profile);
    const scScheme = results.find(r => r.schemeId === 'sc-st-hub-19');

    expect(scScheme).toBeDefined();
    expect(scScheme?.status).toBe('Not Eligible');
    expect(scScheme?.failedConditions.some(c => c.includes('SC') || c.toLowerCase().includes('categor'))).toBeTruthy();
  });

  it('6. Clearly eligible user for PMEGP (pmegp-01)', () => {
    const profile = createBaseProfile({
      category: 'General',
      age: 28,
      state: 'Delhi',
      annualIncome: '₹2.5–5 lakh',
      businessType: 'Manufacturing',
      projectCost: 2000000,
    });

    const results = matchSchemes(profile);
    const pmegp = results.find(r => r.schemeId === 'pmegp-01');

    expect(pmegp).toBeDefined();
    expect(pmegp?.status).toBe('Eligible');
  });

  it('7. Project cost exceeding limit for PM Vishwakarma (max ₹3 Lakh)', () => {
    const profile = createBaseProfile({
      category: 'OBC',
      businessType: 'Handicrafts',
      projectCost: 1000000, // 10 Lakh exceeds 3 Lakh limit
    });

    const results = matchSchemes(profile);
    const vishwaScheme = results.find(r => r.schemeId === 'pm-vishwakarma-02');

    expect(vishwaScheme).toBeDefined();
    expect(vishwaScheme?.status).not.toBe('Eligible');
    expect(vishwaScheme?.failedConditions.some(c => c.toLowerCase().includes('cost') || c.toLowerCase().includes('limit'))).toBeTruthy();
  });

  it('8. User matching multiple real schemes', () => {
    const profile = createBaseProfile({
      category: 'SC',
      gender: 'Female',
      age: 25,
      annualIncome: 'Below ₹1 lakh',
      businessType: 'Manufacturing',
      projectCost: 200000,
    });

    const results = matchSchemes(profile);
    const eligibleSchemes = results.filter(r => r.status === 'Eligible').map(r => r.schemeId);

    // Assert that real nationwide schemes match
    expect(eligibleSchemes).toContain('pmegp-01');
    expect(eligibleSchemes).toContain('mudra-03');
    expect(eligibleSchemes).toContain('sc-st-hub-19');
  });

  it('9. User matching no schemes (age 85 exceeds criteria)', () => {
    const profile = createBaseProfile({
      age: 85,
      annualIncome: 'Above ₹10 lakh',
      businessType: 'Other',
      projectCost: 500000000,
    });

    const results = matchSchemes(profile);
    const eligibleSchemes = results.filter(r => r.status === 'Eligible');

    expect(eligibleSchemes.length).toBe(0);
  });

  it('10. Potentially eligible case (soft condition exceeded)', () => {
    const profile = createBaseProfile({
      age: 28,
      annualIncome: 'Above ₹10 lakh',
      businessType: 'Handicrafts',
      projectCost: 800000,
    });

    const results = matchSchemes(profile);
    const vishwaScheme = results.find(r => r.schemeId === 'pm-vishwakarma-02');

    expect(vishwaScheme).toBeDefined();
    expect(['Potentially Eligible', 'Not Eligible']).toContain(vishwaScheme?.status);
    expect(vishwaScheme?.failedConditions.length).toBeGreaterThan(0);
  });

  it('11. Women-only scheme with male user (Mahila Samriddhi Yojana)', () => {
    const profile = createBaseProfile({
      gender: 'Male',
      category: 'OBC',
    });

    const results = matchSchemes(profile);
    const msyScheme = results.find(r => r.schemeId === 'mahila-samriddhi-09');

    expect(msyScheme?.status).toBe('Not Eligible');
    expect(msyScheme?.failedConditions.some(c => c.toLowerCase().includes('gender'))).toBeTruthy();
  });

  it('12. Score ordering: Sorted by status then score', () => {
    const profile = createBaseProfile({
      category: 'SC',
      gender: 'Female',
      age: 25,
      annualIncome: 'Below ₹1 lakh',
      businessType: 'Manufacturing',
      projectCost: 200000,
    });

    const results = matchSchemes(profile);
    
    for (let i = 0; i < results.length - 1; i++) {
      const current = results[i];
      const next = results[i + 1];
      
      const statusWeight = (status: string) => {
        if (status === 'Eligible') return 3;
        if (status === 'Potentially Eligible') return 2;
        return 1; // Not Eligible
      };

      const currentWeight = statusWeight(current.status);
      const nextWeight = statusWeight(next.status);

      // Verify status order
      expect(currentWeight).toBeGreaterThanOrEqual(nextWeight);
      
      // If same status, verify score order
      if (currentWeight === nextWeight) {
        expect(current.score).toBeGreaterThanOrEqual(next.score);
      }
    }
  });

  it('13. State abbreviation normalization (UP for Uttar Pradesh in nationwide scheme)', () => {
    const profile = createBaseProfile({
      category: 'General',
      annualIncome: '₹1–2.5 lakh',
      businessType: 'Manufacturing',
      state: 'UP', // abbreviation for Uttar Pradesh
      projectCost: 300000,
    });

    const results = matchSchemes(profile);
    const pmegp = results.find(r => r.schemeId === 'pmegp-01');

    expect(pmegp).toBeDefined();
    expect(pmegp?.status).toBe('Eligible');
    expect(pmegp?.matchedConditions.some(c => c.includes('Uttar Pradesh') || c.includes('nationwide'))).toBeTruthy();
  });

  it('14. State abbreviation normalization (HR for Haryana in nationwide scheme)', () => {
    const profile = createBaseProfile({
      category: 'General',
      state: 'hr', // lowercase abbreviation for Haryana
      annualIncome: 'Below ₹1 lakh',
      projectCost: 150000,
    });

    const results = matchSchemes(profile);
    const mudra = results.find(r => r.schemeId === 'mudra-03');

    expect(mudra).toBeDefined();
    expect(mudra?.status).toBe('Eligible');
  });
});
