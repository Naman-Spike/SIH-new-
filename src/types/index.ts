export type { Scheme, SchemeEligibility } from "./scheme";
export type { UserProfile, Gender, Category, BusinessStatus, BusinessType, IncomeRange } from "./userProfile";
export {
  incomeRangeToMaxValue,
  incomeRangeToMidValue,
  GENDERS,
  CATEGORIES,
  BUSINESS_STATUSES,
  BUSINESS_TYPES,
  INCOME_RANGES,
  INDIAN_STATES,
} from "./userProfile";
export type { MatchResult, EligibilityStatus } from "./matchResult";
export type {
  PartnerType,
  RoutingHealthStatus,
  ChannelPartner,
  PartnerDistanceResult,
} from "./partner";
export { normalizeStateName, STATE_ALIASES } from "@/utils/stateMapping";
export { formatCurrency } from "@/utils/formatCurrency";

