export interface SchemePreset {
  id: string;
  schemeId?: string; // links to schemes.json id
  name: string;
  nameHi: string;
  maxLoanLimit: number;
  defaultLoanAmount: number;
  defaultInterestRate: number;
  interestRateRange: { min: number; max: number };
  defaultTenureMonths: number;
  defaultMoratoriumMonths: number; // 3 to 12 months
  defaultSubsidyPercent: number;
  subsidyRange: { min: number; max: number };
  tag?: string;
  tagHi?: string;
}

export const SCHEME_PRESETS: SchemePreset[] = [
  {
    id: 'pmegp-01',
    schemeId: 'pmegp-01',
    name: 'PMEGP (Prime Minister Employment Generation Programme)',
    nameHi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
    maxLoanLimit: 5000000,
    defaultLoanAmount: 2500000,
    defaultInterestRate: 8.5,
    interestRateRange: { min: 7.5, max: 11.5 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 25,
    subsidyRange: { min: 15, max: 35 },
    tag: 'Up to 35% Capital Subsidy • 6m Moratorium',
    tagHi: '35% तक पूंजी सब्सिडी • 6 माह मोराटोरियम',
  },
  {
    id: 'mudra-shishu',
    schemeId: 'mudra-03',
    name: 'MUDRA - Shishu (PMMY)',
    nameHi: 'मुद्रा - शिशु ऋण (पीएमएमवाई)',
    maxLoanLimit: 50000,
    defaultLoanAmount: 50000,
    defaultInterestRate: 9.5,
    interestRateRange: { min: 8.5, max: 12.0 },
    defaultTenureMonths: 36,
    defaultMoratoriumMonths: 3,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: 'Micro-loan up to ₹50k • 3m Grace',
    tagHi: '₹50 हजार तक ऋण • 3 माह छूट',
  },
  {
    id: 'mudra-kishore',
    schemeId: 'mudra-03',
    name: 'MUDRA - Kishore (PMMY)',
    nameHi: 'मुद्रा - किशोर ऋण (पीएमएमवाई)',
    maxLoanLimit: 500000,
    defaultLoanAmount: 350000,
    defaultInterestRate: 10.0,
    interestRateRange: { min: 8.5, max: 13.0 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: 'Mid-scale ₹50k to ₹5L • 6m Moratorium',
    tagHi: 'मध्यम ₹50 हजार से ₹5 लाख • 6 माह मोराटोरियम',
  },
  {
    id: 'mudra-tarun',
    schemeId: 'mudra-03',
    name: 'MUDRA - Tarun (PMMY)',
    nameHi: 'मुद्रा - तरुण ऋण (पीएमएमवाई)',
    maxLoanLimit: 1000000,
    defaultLoanAmount: 800000,
    defaultInterestRate: 10.5,
    interestRateRange: { min: 9.0, max: 14.0 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: 'Growth loan ₹5L to ₹10L • Collateral Free',
    tagHi: 'विकास ऋण ₹5 लाख से ₹10 लाख • संपार्श्विक मुक्त',
  },
  {
    id: 'standup-india-04',
    schemeId: 'standup-india-04',
    name: 'Stand-Up India (Women & SC/ST)',
    nameHi: 'स्टैंड-अप इंडिया (महिला एवं अ.जा./अ.ज.जा.)',
    maxLoanLimit: 10000000,
    defaultLoanAmount: 5000000,
    defaultInterestRate: 8.5,
    interestRateRange: { min: 7.5, max: 11.0 },
    defaultTenureMonths: 84,
    defaultMoratoriumMonths: 12,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 15 },
    tag: '₹10L to ₹1 Crore • Up to 18m Moratorium (12m standard)',
    tagHi: '₹10 लाख से ₹1 करोड़ • 12 माह मोराटोरियम',
  },
  {
    id: 'pm-vishwakarma-02',
    schemeId: 'pm-vishwakarma-02',
    name: 'PM Vishwakarma Scheme',
    nameHi: 'पीएम विश्वकर्मा योजना',
    maxLoanLimit: 300000,
    defaultLoanAmount: 200000,
    defaultInterestRate: 5.0,
    interestRateRange: { min: 5.0, max: 8.0 },
    defaultTenureMonths: 36,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: 'Concessional 5% (8% Subvention by GoI)',
    tagHi: 'रियायती 5% ब्याज (8% भारत सरकार छूट)',
  },
  {
    id: 'pmfme-08',
    schemeId: 'pmfme-08',
    name: 'PMFME (Food Processing Enterprises)',
    nameHi: 'पीएमएफएमई (सूक्ष्म खाद्य प्रसंस्करण)',
    maxLoanLimit: 3000000,
    defaultLoanAmount: 1500000,
    defaultInterestRate: 9.0,
    interestRateRange: { min: 8.0, max: 12.0 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 35,
    subsidyRange: { min: 10, max: 35 },
    tag: '35% Credit Linked Subsidy (Max ₹10L)',
    tagHi: '35% क्रेडिट लिंक्ड सब्सिडी (अधिकतम ₹10L)',
  },
  {
    id: 'cgtmse-07',
    schemeId: 'cgtmse-07',
    name: 'CGTMSE (Credit Guarantee Scheme)',
    nameHi: 'सीजीटीएमएसई (क्रेडिट गारंटी योजना)',
    maxLoanLimit: 50000000,
    defaultLoanAmount: 10000000,
    defaultInterestRate: 9.5,
    interestRateRange: { min: 8.0, max: 13.5 },
    defaultTenureMonths: 84,
    defaultMoratoriumMonths: 12,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: 'Collateral-free up to ₹5 Crore',
    tagHi: '₹5 करोड़ तक बिना किसी गारंटी के',
  },
  {
    id: 'sc-st-hub-19',
    schemeId: 'sc-st-hub-19',
    name: 'National SC-ST Hub (SCLCSS)',
    nameHi: 'राष्ट्रीय अनुसूचित जाति-जनजाति हब (एससीएलसीएसएस)',
    maxLoanLimit: 10000000,
    defaultLoanAmount: 4000000,
    defaultInterestRate: 8.75,
    interestRateRange: { min: 7.5, max: 11.5 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 25,
    subsidyRange: { min: 15, max: 25 },
    tag: '25% Special Capital Subsidy for Tech Upgradation',
    tagHi: 'तकनीकी उन्नयन हेतु 25% विशेष पूंजी सब्सिडी',
  },
  {
    id: 'pmsvanidhi-05',
    schemeId: 'pmsvanidhi-05',
    name: 'PM SVANidhi (Street Vendors)',
    nameHi: 'पीएम स्वनिधि (स्ट्रीट वेंडर)',
    maxLoanLimit: 50000,
    defaultLoanAmount: 20000,
    defaultInterestRate: 7.0,
    interestRateRange: { min: 6.5, max: 9.0 },
    defaultTenureMonths: 18,
    defaultMoratoriumMonths: 3,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 0 },
    tag: '7% Interest Subvention on timely repayment',
    tagHi: 'समय पर पुनर्भुगतान पर 7% ब्याज सब्सिडी',
  },
  {
    id: 'custom',
    name: 'Custom Loan Parameters',
    nameHi: 'कस्टम ऋण पैरामीटर',
    maxLoanLimit: 100000000,
    defaultLoanAmount: 1000000,
    defaultInterestRate: 9.0,
    interestRateRange: { min: 5.0, max: 18.0 },
    defaultTenureMonths: 60,
    defaultMoratoriumMonths: 6,
    defaultSubsidyPercent: 0,
    subsidyRange: { min: 0, max: 50 },
    tag: 'Manual Custom Calculation',
    tagHi: 'मैन्युअल कस्टम गणना',
  },
];

export function getSchemePreset(schemeOrPresetId: string): SchemePreset | undefined {
  return (
    SCHEME_PRESETS.find((p) => p.id === schemeOrPresetId) ||
    SCHEME_PRESETS.find((p) => p.schemeId === schemeOrPresetId)
  );
}

export interface EMICalculationInput {
  principal: number;
  annualRate: number; // e.g. 9.5 for 9.5%
  tenureMonths: number; // total tenure
  moratoriumMonths: number; // grace period in months (3 to 12)
  subsidyPercent: number; // 0 to 100
}

export interface YearlyRepayment {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface EMICalculationResult {
  grossPrincipal: number;
  subsidyAmount: number;
  effectivePrincipal: number;
  monthlyEMIPostMoratorium: number;
  moratoriumMonthlyPayment: number;
  moratoriumMonths: number;
  amortizationMonths: number;
  totalMoratoriumInterest: number;
  totalAmortizationInterest: number;
  totalInterest: number;
  totalPayable: number;
  yearlySchedule: YearlyRepayment[];
}

/**
 * Calculates dynamic EMI accounting for capital subsidy, moratorium periods (3 to 12 months),
 * and generates a full year-by-year amortization schedule.
 */
export function calculateEMI(input: EMICalculationInput): EMICalculationResult {
  const grossPrincipal = Math.max(0, input.principal);
  const subsidyPercent = Math.min(100, Math.max(0, input.subsidyPercent));
  const subsidyAmount = Math.round((grossPrincipal * subsidyPercent) / 100);
  const effectivePrincipal = Math.max(0, grossPrincipal - subsidyAmount);

  const annualRate = Math.max(0, input.annualRate);
  const monthlyRate = annualRate > 0 ? annualRate / 12 / 100 : 0;

  const totalTenureMonths = Math.max(1, input.tenureMonths);
  const moratoriumMonths = Math.min(
    totalTenureMonths - 1,
    Math.max(0, input.moratoriumMonths)
  );
  const amortizationMonths = Math.max(1, totalTenureMonths - moratoriumMonths);

  // During moratorium, borrower pays simple monthly interest only (standard Indian banking practice)
  const moratoriumMonthlyPayment =
    moratoriumMonths > 0 && effectivePrincipal > 0 && monthlyRate > 0
      ? Math.round(effectivePrincipal * monthlyRate)
      : 0;
  const totalMoratoriumInterest = moratoriumMonthlyPayment * moratoriumMonths;

  // Post-moratorium amortization EMI formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
  let monthlyEMIPostMoratorium = 0;
  if (effectivePrincipal > 0) {
    if (monthlyRate === 0) {
      monthlyEMIPostMoratorium = Math.round(effectivePrincipal / amortizationMonths);
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, amortizationMonths);
      monthlyEMIPostMoratorium = Math.round(
        (effectivePrincipal * monthlyRate * compoundFactor) / (compoundFactor - 1)
      );
    }
  }

  // Generate month-by-month and aggregate into yearly schedule
  let currentBalance = effectivePrincipal;
  const yearlySchedule: YearlyRepayment[] = [];
  let yearPrincipal = 0;
  let yearInterest = 0;
  let totalAmortizationInterest = 0;

  for (let month = 1; month <= totalTenureMonths; month++) {
    if (month <= moratoriumMonths) {
      // Moratorium month: Interest only, principal remains constant
      const interestForMonth = Math.round(currentBalance * monthlyRate);
      yearInterest += interestForMonth;
    } else {
      // Amortization month
      const interestForMonth = Math.round(currentBalance * monthlyRate);
      let principalForMonth = monthlyEMIPostMoratorium - interestForMonth;

      // Final month adjustment
      if (month === totalTenureMonths || principalForMonth > currentBalance) {
        principalForMonth = currentBalance;
      }

      currentBalance = Math.max(0, currentBalance - principalForMonth);
      yearPrincipal += principalForMonth;
      yearInterest += interestForMonth;
      totalAmortizationInterest += interestForMonth;
    }

    // End of year or end of tenure
    if (month % 12 === 0 || month === totalTenureMonths) {
      yearlySchedule.push({
        year: Math.ceil(month / 12),
        principalPaid: yearPrincipal,
        interestPaid: yearInterest,
        remainingBalance: Math.max(0, currentBalance),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }
  }

  const totalInterest = totalMoratoriumInterest + totalAmortizationInterest;
  const totalPayable = effectivePrincipal + totalInterest;

  return {
    grossPrincipal,
    subsidyAmount,
    effectivePrincipal,
    monthlyEMIPostMoratorium,
    moratoriumMonthlyPayment,
    moratoriumMonths,
    amortizationMonths,
    totalMoratoriumInterest,
    totalAmortizationInterest,
    totalInterest,
    totalPayable,
    yearlySchedule,
  };
}
