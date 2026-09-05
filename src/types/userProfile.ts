export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";

export type Category = "SC" | "ST" | "OBC" | "Minority" | "General" | "Other";

export type BusinessStatus =
  | "Starting a new business"
  | "Existing business"
  | "Self-employed"
  | "Unemployed";

export type BusinessType =
  | "Manufacturing"
  | "Service"
  | "Trading"
  | "Agriculture"
  | "Food"
  | "Tailoring/Textiles"
  | "Handicrafts"
  | "Other";

export type IncomeRange =
  | "Below ₹1 lakh"
  | "₹1–2.5 lakh"
  | "₹2.5–5 lakh"
  | "₹5–10 lakh"
  | "Above ₹10 lakh";

export interface UserProfile {
  age: number;
  gender: Gender;
  state: string;
  city?: string;
  category: Category;
  annualIncome: IncomeRange;
  businessStatus: BusinessStatus;
  businessType: BusinessType;
  projectCost: number;
  existingBusiness: boolean;
  existingLoan: boolean;
}

/** Convert an IncomeRange to its upper bound numeric value (INR). */
export function incomeRangeToMaxValue(range: IncomeRange): number {
  switch (range) {
    case "Below ₹1 lakh":
      return 100000;
    case "₹1–2.5 lakh":
      return 250000;
    case "₹2.5–5 lakh":
      return 500000;
    case "₹5–10 lakh":
      return 1000000;
    case "Above ₹10 lakh":
      return Infinity;
  }
}

/** Convert an IncomeRange to its midpoint numeric value (INR) for scoring. */
export function incomeRangeToMidValue(range: IncomeRange): number {
  switch (range) {
    case "Below ₹1 lakh":
      return 50000;
    case "₹1–2.5 lakh":
      return 175000;
    case "₹2.5–5 lakh":
      return 375000;
    case "₹5–10 lakh":
      return 750000;
    case "Above ₹10 lakh":
      return 1500000;
  }
}

export const GENDERS: Gender[] = ["Male", "Female", "Other", "Prefer not to say"];

export const CATEGORIES: Category[] = ["SC", "ST", "OBC", "Minority", "General", "Other"];

export const BUSINESS_STATUSES: BusinessStatus[] = [
  "Starting a new business",
  "Existing business",
  "Self-employed",
  "Unemployed",
];

export const BUSINESS_TYPES: BusinessType[] = [
  "Manufacturing",
  "Service",
  "Trading",
  "Agriculture",
  "Food",
  "Tailoring/Textiles",
  "Handicrafts",
  "Other",
];

export const INCOME_RANGES: IncomeRange[] = [
  "Below ₹1 lakh",
  "₹1–2.5 lakh",
  "₹2.5–5 lakh",
  "₹5–10 lakh",
  "Above ₹10 lakh",
];

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

