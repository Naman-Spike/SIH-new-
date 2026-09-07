import { describe, it, expect } from 'vitest';
import { calculateEMI, getSchemePreset, SCHEME_PRESETS } from '@/utils/calculator';
import {
  haversineDistanceKm,
  filterAndRankPartners,
} from '@/utils/geoDistance';
import { ChannelPartner } from '@/types/partner';

describe('Financial Calculator (Amortization, Moratorium & Subsidy)', () => {
  it('should calculate standard EMI correctly with zero moratorium and zero subsidy', () => {
    // ₹10 Lakh at 10% annual interest for 60 months (5 years)
    const result = calculateEMI({
      principal: 1000000,
      annualRate: 10.0,
      tenureMonths: 60,
      moratoriumMonths: 0,
      subsidyPercent: 0,
    });

    expect(result.grossPrincipal).toBe(1000000);
    expect(result.effectivePrincipal).toBe(1000000);
    expect(result.subsidyAmount).toBe(0);
    expect(result.moratoriumMonths).toBe(0);
    expect(result.moratoriumMonthlyPayment).toBe(0);
    // Standard EMI formula for 10L @ 10% 5y is approx ₹21,247
    expect(result.monthlyEMIPostMoratorium).toBeGreaterThan(21200);
    expect(result.monthlyEMIPostMoratorium).toBeLessThan(21300);
    expect(result.totalPayable).toBeGreaterThan(1250000);
    expect(result.yearlySchedule.length).toBe(5);
    // Final balance at end of year 5 should be 0
    expect(result.yearlySchedule[4].remainingBalance).toBe(0);
  });

  it('should accurately calculate moratorium interest and post-moratorium EMI', () => {
    // ₹50 Lakh at 8.5% with 6 months moratorium over 60 months total tenure
    const result = calculateEMI({
      principal: 5000000,
      annualRate: 8.5,
      tenureMonths: 60,
      moratoriumMonths: 6,
      subsidyPercent: 0,
    });

    expect(result.moratoriumMonths).toBe(6);
    expect(result.amortizationMonths).toBe(54); // 60 - 6

    // Monthly interest during moratorium: P * (8.5 / 12 / 100) = 5000000 * 0.0070833 = ~₹35,417
    expect(result.moratoriumMonthlyPayment).toBe(Math.round(5000000 * (8.5 / 12 / 100)));
    expect(result.totalMoratoriumInterest).toBe(result.moratoriumMonthlyPayment * 6);

    // Amortization EMI over remaining 54 months
    expect(result.monthlyEMIPostMoratorium).toBeGreaterThan(110000);
    expect(result.yearlySchedule.length).toBe(5);
    // Ending balance should be 0
    expect(result.yearlySchedule[4].remainingBalance).toBe(0);
  });

  it('should correctly deduct capital subsidy from effective loan liability', () => {
    // PMEGP 25% subsidy on ₹20 Lakh loan
    const result = calculateEMI({
      principal: 2000000,
      annualRate: 9.0,
      tenureMonths: 60,
      moratoriumMonths: 6,
      subsidyPercent: 25,
    });

    expect(result.grossPrincipal).toBe(2000000);
    expect(result.subsidyAmount).toBe(500000); // 25% of 20L = 5L
    expect(result.effectivePrincipal).toBe(1500000); // Net 15L liability

    // Moratorium interest should be calculated on net effective principal (15L)
    const expectedMoratoriumMonthly = Math.round(1500000 * (9.0 / 12 / 100));
    expect(result.moratoriumMonthlyPayment).toBe(expectedMoratoriumMonthly);
  });

  it('should provide presets for real Indian government schemes', () => {
    const pmegp = getSchemePreset('pmegp-01');
    expect(pmegp).toBeDefined();
    expect(pmegp?.maxLoanLimit).toBe(5000000);
    expect(pmegp?.defaultMoratoriumMonths).toBe(6);
    expect(pmegp?.defaultSubsidyPercent).toBe(25);

    const mudraShishu = getSchemePreset('mudra-shishu');
    expect(mudraShishu).toBeDefined();
    expect(mudraShishu?.maxLoanLimit).toBe(50000);

    const standup = getSchemePreset('standup-india-04');
    expect(standup).toBeDefined();
    expect(standup?.maxLoanLimit).toBe(10000000);
  });
});

describe('Geo-Spatial Partner Locator & Health Audit Routing', () => {
  it('should calculate Haversine distance accurately in kilometers', () => {
    // Distance between Lucknow (26.8467, 80.9462) and Kanpur (26.4499, 80.3319) is ~75-80 km
    const dist = haversineDistanceKm(26.8467, 80.9462, 26.4499, 80.3319);
    expect(dist).toBeGreaterThan(70);
    expect(dist).toBeLessThan(85);

    // Distance to same coordinates is 0
    expect(haversineDistanceKm(28.6139, 77.209, 28.6139, 77.209)).toBe(0);
  });

  it('should strictly exclude partners with NPA > 5.0% or overdue > 60 days when audit filter is active', () => {
    const testPartners: ChannelPartner[] = [
      {
        id: 'bank-good-1',
        name: 'SBI SME Hub',
        nameHi: 'एसबीआई एसएमई',
        type: 'Public Sector Bank',
        branchName: 'Main',
        address: 'MG Marg',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
        latitude: 26.846,
        longitude: 80.946,
        contactPhone: '0522-123456',
        contactEmail: 'sbi@example.com',
        nodalOfficer: 'Officer A',
        authorizedSchemes: ['ALL'],
        fundUtilizationScore: 92,
        npaRate: 2.1, // Healthy < 5%
        overdueDays: 14,
        routingStatus: 'Approved - High Allocation',
        activeLendingWindow: true,
        allocatedBudgetRemaining: 50000000,
      },
      {
        id: 'bank-bad-2',
        name: 'Distressed Co-op Bank',
        nameHi: 'संकटग्रस्त बैंक',
        type: 'Regional Rural Bank',
        branchName: 'Old City',
        address: 'Station Rd',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
        latitude: 26.845,
        longitude: 80.945,
        contactPhone: '0522-654321',
        contactEmail: 'bad@example.com',
        nodalOfficer: 'Officer B',
        authorizedSchemes: ['ALL'],
        fundUtilizationScore: 45,
        npaRate: 7.8, // Bad > 5%
        overdueDays: 85, // Bad > 60 days
        routingStatus: 'Excluded - High NPA',
        activeLendingWindow: false,
        allocatedBudgetRemaining: 2000000,
      },
    ];

    // Filter with onlyApprovedNPA = true
    const approvedResults = filterAndRankPartners(testPartners, {
      userLat: 26.8467,
      userLon: 80.9462,
      onlyApprovedNPA: true,
    });

    expect(approvedResults.length).toBe(1);
    expect(approvedResults[0].id).toBe('bank-good-1');
    expect(approvedResults[0].isEligibleForRouting).toBe(true);

    // Filter with onlyApprovedNPA = false (shows both, but bad one flagged ineligible)
    const allResults = filterAndRankPartners(testPartners, {
      userLat: 26.8467,
      userLon: 80.9462,
      onlyApprovedNPA: false,
    });

    expect(allResults.length).toBe(2);
    const badPartner = allResults.find((p) => p.id === 'bank-bad-2');
    expect(badPartner).toBeDefined();
    expect(badPartner?.isEligibleForRouting).toBe(false);
  });
});

