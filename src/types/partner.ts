export type PartnerType =
  | 'SCA'
  | 'Public Sector Bank'
  | 'Regional Rural Bank'
  | 'NBFC-MFI';

export type RoutingHealthStatus =
  | 'Approved - High Allocation'
  | 'Approved - Standard'
  | 'Excluded - High NPA';

export interface ChannelPartner {
  id: string;
  name: string;
  nameHi: string;
  type: PartnerType;
  branchName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  contactEmail: string;
  nodalOfficer: string;
  authorizedSchemes: string[]; // scheme ids or 'ALL'
  fundUtilizationScore: number; // e.g. 92 (%)
  npaRate: number; // e.g. 2.1 (%)
  overdueDays: number; // e.g. 15
  routingStatus: RoutingHealthStatus;
  activeLendingWindow: boolean;
  allocatedBudgetRemaining: number; // in INR
  exclusionReason?: string;
  exclusionReasonHi?: string;
}

export interface PartnerDistanceResult extends ChannelPartner {
  distanceKm: number;
  isEligibleForRouting: boolean;
}

