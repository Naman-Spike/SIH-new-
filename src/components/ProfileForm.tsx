'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GENDERS, 
  CATEGORIES, 
  BUSINESS_STATUSES, 
  BUSINESS_TYPES, 
  INCOME_RANGES, 
  INDIAN_STATES, 
  normalizeStateName,
  formatCurrency
} from '@/types';
import type { UserProfile } from '@/types';
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const GENDER_LABELS: Record<string, { en: string; hi: string }> = {
  'Male': { en: 'Male', hi: 'पुरुष (Male)' },
  'Female': { en: 'Female', hi: 'महिला (Female)' },
  'Other': { en: 'Other', hi: 'अन्य (Other)' },
  'Prefer not to say': { en: 'Prefer not to say', hi: 'बताना नहीं चाहते' }
};

const CATEGORY_LABELS: Record<string, { en: string; hi: string }> = {
  'General': { en: 'General', hi: 'सामान्य (General)' },
  'OBC': { en: 'OBC', hi: 'अन्य पिछड़ा वर्ग (OBC)' },
  'SC': { en: 'SC', hi: 'अनुसूचित जाति (SC)' },
  'ST': { en: 'ST', hi: 'अनुसूचित जनजाति (ST)' },
  'Minority': { en: 'Minority', hi: 'अल्पसंख्यक (Minority)' },
  'Other': { en: 'Other', hi: 'अन्य (Other)' }
};

const STATUS_LABELS: Record<string, { en: string; hi: string }> = {
  'Starting a new business': { en: 'Starting a new business', hi: 'नया व्यवसाय शुरू करना (New Business)' },
  'Existing business': { en: 'Existing business', hi: 'मौजूदा व्यवसाय विस्तार (Existing Business)' },
  'Self-employed': { en: 'Self-employed', hi: 'स्व-रोज़गार (Self-employed)' },
  'Unemployed': { en: 'Unemployed', hi: 'बेरोज़गार / आकांक्षी उद्यमी' }
};

const SECTOR_LABELS: Record<string, { en: string; hi: string }> = {
  'Manufacturing': { en: 'Manufacturing', hi: 'विनिर्माण / उत्पादन (Manufacturing)' },
  'Service': { en: 'Service', hi: 'सेवा क्षेत्र (Service)' },
  'Trading': { en: 'Trading', hi: 'व्यापार / दुकान / खुदरा (Trading)' },
  'Agriculture': { en: 'Agriculture', hi: 'कृषि / डेयरी / संबद्ध (Agriculture)' },
  'Food': { en: 'Food', hi: 'खाद्य प्रसंस्करण / रेस्टोरेंट / बेकरी (Food)' },
  'Tailoring/Textiles': { en: 'Tailoring/Textiles', hi: 'सिलाई / परिधान / वस्त्र (Tailoring/Textiles)' },
  'Handicrafts': { en: 'Handicrafts', hi: 'हस्तशिल्प / कुटीर उद्योग (Handicrafts)' },
  'Other': { en: 'Other', hi: 'अन्य क्षेत्र (Other)' }
};

export default function ProfileForm() {
  const router = useRouter();
  const { language, setLanguage, t, isHindi } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateInput, setStateInput] = useState('');

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    existingBusiness: false,
    existingLoan: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = value ? Number(value) : '';
    } else if (type === 'radio') {
      parsedValue = value === 'true';
    }
    
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setStateInput(rawVal);

    // Auto-map abbreviations like 'UP' -> 'Uttar Pradesh', 'HR' -> 'Haryana'
    const normalized = normalizeStateName(rawVal);
    if (INDIAN_STATES.includes(normalized)) {
      setFormData((prev) => ({ ...prev, state: normalized }));
    } else {
      setFormData((prev) => ({ ...prev, state: rawVal }));
    }
  };

  const handleStateBlur = () => {
    if (stateInput) {
      const normalized = normalizeStateName(stateInput);
      if (INDIAN_STATES.includes(normalized)) {
        setStateInput(normalized);
        setFormData((prev) => ({ ...prev, state: normalized }));
      }
    }
  };

  const selectStateFromList = (stateName: string) => {
    setStateInput(stateName);
    setFormData((prev) => ({ ...prev, state: stateName }));
  };

  const validateStep1 = () => {
    if (!formData.age || formData.age < 18 || formData.age > 100) return t('errAge');
    if (!formData.gender) return t('errGender');
    
    // Ensure state is normalized
    const normalizedState = normalizeStateName(formData.state || stateInput);
    if (!normalizedState) return t('errState');
    if (!INDIAN_STATES.includes(normalizedState)) {
      return t('errStateUnrecognized', formData.state || stateInput);
    }
    // Update normalized state in form
    setFormData((prev) => ({ ...prev, state: normalizedState }));

    if (!formData.city || !formData.city.trim()) return t('errCity');
    if (!formData.category) return t('errCategory');
    return '';
  };

  const validateStep2 = () => {
    if (!formData.businessStatus) return t('errStatus');
    if (!formData.businessType) return t('errSector');
    if (formData.existingBusiness === undefined) return t('errExistingBiz');
    if (formData.existingLoan === undefined) return t('errExistingLoan');
    return '';
  };

  const validateStep3 = () => {
    if (!formData.annualIncome) return t('errIncome');
    if (!formData.projectCost || formData.projectCost <= 0) return t('errProjectCost');
    return '';
  };

  const nextStep = () => {
    let err = '';
    if (step === 1) err = validateStep1();
    if (step === 2) err = validateStep2();
    
    if (err) {
      setError(err);
    } else {
      setError('');
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep3();
    if (err) {
      setError(err);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/match-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to match schemes');
      }

      const data = await response.json();
      
      sessionStorage.setItem('user-profile', JSON.stringify(formData));
      sessionStorage.setItem('match-results', JSON.stringify(data.matches));
      
      router.push('/results');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-10 max-w-2xl mx-auto shadow-xl shadow-neutral-100/50">
      {/* Language Switcher Bar at top of Form Card */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-100">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {isHindi ? '🌐 भाषा चयन' : '🌐 Select Language'}
        </span>
        <div className="inline-flex bg-neutral-100 p-1 rounded-full border border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3.5 py-1 rounded-full transition-all ${
              language === 'en'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-3.5 py-1 rounded-full transition-all ${
              language === 'hi'
                ? 'bg-black text-white font-bold shadow-xs'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="mb-10 max-w-md mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-6 right-6 top-4 h-[1px] bg-neutral-200 z-0"></div>
          <div 
            className="absolute left-6 top-4 h-[1px] bg-black z-0 transition-all duration-300" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
          
          {[
            { num: 1, label: t('stepPersonal') },
            { num: 2, label: t('stepBusiness') },
            { num: 3, label: t('stepFinancial') },
          ].map((item) => {
            const isCompleted = step > item.num;
            const isCurrent = step === item.num;
            return (
              <div key={item.num} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                    isCurrent || isCompleted
                      ? 'bg-black text-white font-bold'
                      : 'bg-white border border-neutral-300 text-neutral-400 font-medium'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.num}
                </div>
                <span 
                  className={`text-xs mt-2 transition-colors ${
                    isCurrent || isCompleted 
                      ? 'text-neutral-900 font-bold' 
                      : 'text-neutral-400 font-normal'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-neutral-100 border border-neutral-300 text-neutral-900 rounded-2xl text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">{t('step1Heading')}</h3>
              <p className="text-sm text-neutral-500 mt-1">{t('step1Subheading')}</p>
            </div>
            
            <div>
              <label className="label-text">{t('ageLabel')}</label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                min="18"
                max="100"
                className="input-field"
                placeholder={t('agePlaceholder')}
              />
            </div>
            
            <div>
              <label className="label-text">{t('genderLabel')}</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">{t('genderSelect')}</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {isHindi && GENDER_LABELS[g] ? GENDER_LABELS[g].hi : g}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-text mb-0">{t('stateLabel')}</label>
                <span className="text-xs text-neutral-400 font-medium">{t('stateShortcuts')}</span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  list="indian-states-list"
                  value={stateInput || formData.state || ''}
                  onChange={handleStateChange}
                  onBlur={handleStateBlur}
                  className="input-field"
                  placeholder={t('statePlaceholder')}
                  autoComplete="off"
                />
                <datalist id="indian-states-list">
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Quick shortcut pills */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-xs text-neutral-400 self-center mr-1">{t('quickPick')}</span>
                {['UP', 'HR', 'Delhi', 'MP', 'Rajasthan', 'Maharashtra', 'Bihar', 'Gujarat'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => selectStateFromList(normalizeStateName(st))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      formData.state === normalizeStateName(st)
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-text">{t('cityLabel')}</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="input-field"
                placeholder={t('cityPlaceholder')}
              />
            </div>
            
            <div>
              <label className="label-text">{t('categoryLabel')}</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">{t('categorySelect')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {isHindi && CATEGORY_LABELS[c] ? CATEGORY_LABELS[c].hi : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">{t('step2Heading')}</h3>
              <p className="text-sm text-neutral-500 mt-1">{t('step2Subheading')}</p>
            </div>
            
            <div>
              <label className="label-text">{t('statusLabel')}</label>
              <select
                name="businessStatus"
                value={formData.businessStatus || ''}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">{t('statusSelect')}</option>
                {BUSINESS_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {isHindi && STATUS_LABELS[s] ? STATUS_LABELS[s].hi : s}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label-text">{t('sectorLabel')}</label>
              <select
                name="businessType"
                value={formData.businessType || ''}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">{t('sectorSelect')}</option>
                {BUSINESS_TYPES.map((tItem) => (
                  <option key={tItem} value={tItem}>
                    {isHindi && SECTOR_LABELS[tItem] ? SECTOR_LABELS[tItem].hi : tItem}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="label-text">{t('existingBizLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.existingBusiness === true 
                    ? 'border-black bg-neutral-900 text-white font-semibold' 
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="existingBusiness" 
                    value="true" 
                    checked={formData.existingBusiness === true} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <span>{t('existingBizYes')}</span>
                </label>
                
                <label className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.existingBusiness === false 
                    ? 'border-black bg-neutral-900 text-white font-semibold' 
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="existingBusiness" 
                    value="false" 
                    checked={formData.existingBusiness === false} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <span>{t('existingBizNo')}</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-text">{t('existingLoanLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.existingLoan === true 
                    ? 'border-black bg-neutral-900 text-white font-semibold' 
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="existingLoan" 
                    value="true" 
                    checked={formData.existingLoan === true} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <span>{t('existingLoanYes')}</span>
                </label>
                
                <label className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  formData.existingLoan === false 
                    ? 'border-black bg-neutral-900 text-white font-semibold' 
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                }`}>
                  <input 
                    type="radio" 
                    name="existingLoan" 
                    value="false" 
                    checked={formData.existingLoan === false} 
                    onChange={handleChange} 
                    className="sr-only" 
                  />
                  <span>{t('existingLoanNo')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Financial Details */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">{t('step3Heading')}</h3>
              <p className="text-sm text-neutral-500 mt-1">{t('step3Subheading')}</p>
            </div>
            
            <div>
              <label className="label-text">{t('incomeLabel')}</label>
              <select
                name="annualIncome"
                value={formData.annualIncome || ''}
                onChange={handleChange}
                className="select-field"
              >
                <option value="">{t('incomeSelect')}</option>
                {INCOME_RANGES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label-text mb-0">{t('projectCostLabel')}</label>
                {formData.projectCost && Number(formData.projectCost) > 0 ? (
                  <span className="text-xs font-bold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-300">
                    {formatCurrency(Number(formData.projectCost))}
                  </span>
                ) : null}
              </div>
              <input
                type="number"
                name="projectCost"
                value={formData.projectCost || ''}
                onChange={handleChange}
                min="0"
                step="any"
                className="input-field"
                placeholder={t('projectCostPlaceholder')}
              />
              <span className="text-xs text-neutral-400 mt-1.5 block">
                {t('projectCostHelp')}
              </span>

              {/* Quick funding shortcuts */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <span className="text-xs text-neutral-400 self-center mr-1">{t('quickPick')}</span>
                {[
                  { label: '₹1 Lakh', val: 100000 },
                  { label: '₹3 Lakh', val: 300000 },
                  { label: '₹5 Lakh', val: 500000 },
                  { label: '₹10 Lakh', val: 1000000 },
                  { label: '₹15 Lakh', val: 1500000 },
                  { label: '₹25 Lakh', val: 2500000 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, projectCost: item.val }))}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      formData.projectCost === item.val
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-black'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex justify-between items-center gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 px-6 py-3 border border-neutral-300 rounded-full text-neutral-800 font-medium text-sm hover:bg-neutral-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('btnBack')}</span>
            </button>
          ) : (
            <div />
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm"
            >
              <span>{t('btnContinue')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white rounded-full font-medium text-sm hover:bg-neutral-800 transition-all disabled:opacity-60 shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? t('btnMatchingSchemes') : t('btnFindSchemes')}</span>
              {!isLoading && <Sparkles className="w-4 h-4" />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
