import { Scheme, SchemeEligibility, Category, BusinessType } from '@/types';
import localData from '@/data/schemes.json';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/formatCurrency';

let memoryCache: Scheme[] = localData.schemes as unknown as Scheme[];
let lastFetchedTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

function mapSectorToBusinessTypes(sectors: string[]): (BusinessType | 'ALL')[] {
  if (!sectors || sectors.length === 0) return ['ALL'];
  const set = new Set<BusinessType | 'ALL'>();
  for (const s of sectors) {
    const lower = s.toLowerCase();
    if (lower.includes('manufacturing')) set.add('Manufacturing');
    if (lower.includes('service')) set.add('Service');
    if (lower.includes('trading') || lower.includes('vending')) set.add('Trading');
    if (lower.includes('agriculture') || lower.includes('agri') || lower.includes('dairy')) set.add('Agriculture');
    if (lower.includes('food')) set.add('Food');
    if (lower.includes('textile') || lower.includes('tailor')) set.add('Tailoring/Textiles');
    if (lower.includes('craft') || lower.includes('handicraft') || lower.includes('coir')) set.add('Handicrafts');
    if (lower.includes('tech') || lower.includes('software') || lower.includes('defence') || lower.includes('energy') || lower.includes('bio')) {
      set.add('Service');
      set.add('Other');
    }
  }
  if (set.size === 0) set.add('ALL');
  return Array.from(set);
}

function mapGender(genders: string[]): ('Male' | 'Female' | 'Other' | 'ALL')[] {
  if (!genders || genders.length === 0 || genders.includes('All')) return ['ALL'];
  return genders.map((g) => {
    if (g === 'Female') return 'Female';
    if (g === 'Male') return 'Male';
    if (g === 'Other') return 'Other';
    return 'ALL';
  });
}

function mapCategories(cats: string[]): (Category | 'ALL')[] {
  if (!cats || cats.length === 0 || cats.includes('All')) return ['ALL'];
  const valid: Category[] = ['SC', 'ST', 'OBC', 'Minority', 'General', 'Other'];
  return cats.filter((c): c is Category => valid.includes(c as Category));
}

function transformDbScheme(s: any, e: any): Scheme {
  const businessTypes = mapSectorToBusinessTypes(e?.allowed_business_sectors || []);
  const genders = mapGender(e?.allowed_genders || ['All']);
  const categories = mapCategories(e?.allowed_social_categories || ['All']);
  const states = (!e?.allowed_states || e.allowed_states.includes('All')) ? ['ALL'] : e.allowed_states;

  const benefits: string[] = [];
  if (s.max_loan_amount) benefits.push(`Financial assistance up to ${formatCurrency(s.max_loan_amount)}`);
  if (s.subsidy_percentage > 0) benefits.push(`Capital subsidy up to ${s.subsidy_percentage}%`);
  if (s.interest_rate_subsidy > 0) benefits.push(`Interest rate subsidy of ${s.interest_rate_subsidy}%`);
  if (s.nodal_agency) benefits.push(`Implemented via ${s.nodal_agency}`);
  if (s.official_portal_url) benefits.push(`Official Portal: ${s.official_portal_url}`);

  let interestRate = 'Concessional / Bank Base Rate';
  if (s.interest_rate_subsidy > 0) interestRate = `${s.interest_rate_subsidy}% Interest Subvention`;
  else if (s.subsidy_percentage > 0) interestRate = `Subsidized (up to ${s.subsidy_percentage}% capital grant)`;

  let targetBeneficiaries = s.category_type || 'Entrepreneurs & Small Business Owners';
  if (e) {
    const catStr = categories.includes('ALL') ? 'All categories' : categories.join(', ');
    const genStr = genders.includes('ALL') ? 'All genders' : genders.join(', ');
    targetBeneficiaries = `${catStr} (${genStr}), Age ${e.min_age || 18}–${e.max_age || 70} years`;
  }

  const eligibility: SchemeEligibility = {
    categories: categories.length === 0 ? ['ALL'] : categories,
    minAge: e?.min_age || 18,
    maxAge: e?.max_age || 70,
    maxAnnualIncome: e?.max_annual_turnover || null,
    businessTypes,
    states,
    genders,
    newBusinessAllowed: true,
    existingBusinessAllowed: true,
    maxProjectCost: e?.max_investment || s.max_loan_amount || null,
  };

  return {
    id: s.id,
    name: s.name,
    ministry: s.ministry || 'Government of India',
    shortDescription: s.short_description || s.name,
    description: s.detailed_description || s.short_description || s.name,
    targetBeneficiaries,
    eligibility,
    benefits: benefits.length > 0 ? benefits : [s.short_description || 'Financial and technical support'],
    maximumLoanAmount: s.max_loan_amount || e?.max_investment || 0,
    interestRate,
    repaymentTenure: '3 to 7 Years (Bank terms apply)',
    documents: s.documents_required || ['Aadhaar Card', 'PAN Card', 'Project Report', 'Bank Account Details'],
    applicationProcess: [
      `Visit the official portal at ${s.official_portal_url || 'https://www.myscheme.gov.in/'}`,
      'Register with Aadhaar and enter personal & business details',
      'Upload required documents and project report',
      `Submit to nodal agency (${s.nodal_agency || s.ministry}) or bank for verification`,
    ],
    stateCoverage: (!e?.allowed_states || e.allowed_states.includes('All'))
      ? 'All States and Union Territories (Pan-India)'
      : e.allowed_states.join(', '),
    sourceUrl: s.official_portal_url || 'https://www.myscheme.gov.in/',
    lastUpdated: s.updated_at || s.created_at || '2026-08-31',
  };
}

/**
 * Live fetch schemes and eligibility criteria directly from Supabase PostgreSQL.
 * Falls back to local cached schemes if database is unreachable.
 */
export async function getAllSchemesAsync(): Promise<Scheme[]> {
  const now = Date.now();
  if (memoryCache.length > 0 && now - lastFetchedTime < CACHE_TTL_MS) {
    return memoryCache;
  }

  try {
    const [schemesRes, eligRes] = await Promise.all([
      supabase.from('schemes').select('*'),
      supabase.from('scheme_eligibility').select('*'),
    ]);

    if (!schemesRes.error && schemesRes.data && schemesRes.data.length > 0) {
      const eligMap = new Map<string, any>();
      if (eligRes.data) {
        eligRes.data.forEach((e) => eligMap.set(e.scheme_id, e));
      }

      const transformed = schemesRes.data.map((s) => transformDbScheme(s, eligMap.get(s.id)));
      memoryCache = transformed;
      lastFetchedTime = now;
      return memoryCache;
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using local schemes cache:', err);
  }

  return memoryCache;
}

/**
 * Synchronous getter for schemes (cached or fallback).
 */
export function getAllSchemes(): Scheme[] {
  return memoryCache;
}

/**
 * Live fetch single scheme by ID from Supabase.
 */
export async function getSchemeByIdAsync(id: string): Promise<Scheme | undefined> {
  const schemes = await getAllSchemesAsync();
  return schemes.find((s) => s.id === id);
}

/**
 * Synchronous scheme lookup by ID.
 */
export function getSchemeById(id: string): Scheme | undefined {
  return getAllSchemes().find((s) => s.id === id);
}
