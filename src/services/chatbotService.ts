import { Scheme, UserProfile, MatchResult, formatCurrency } from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function handleChatMessage(
  message: string,
  scheme: Scheme,
  userProfile: UserProfile | null,
  matchResult: MatchResult | null
): string {
  const lowerMsg = message.toLowerCase();

  // Eligibility questions
  if (lowerMsg.match(/(eligible|qualify|why recommended|why not)/)) {
    if (matchResult) {
      let response = `Based on your profile, you are **${matchResult.status}** for the ${scheme.name}.\n\n`;
      if (matchResult.matchedConditions && matchResult.matchedConditions.length > 0) {
        response += `**Why you match:**\n- ${matchResult.matchedConditions.join('\n- ')}\n\n`;
      }
      if (matchResult.failedConditions && matchResult.failedConditions.length > 0) {
        response += `**Areas of concern:**\n- ${matchResult.failedConditions.join('\n- ')}\n\n`;
      }
      return response;
    }
    const statesInfo = scheme.eligibility.states?.includes('ALL') ? 'Pan-India' : scheme.eligibility.states?.join(', ');
    return `To evaluate if you qualify for **${scheme.name}**, please share:\n- **Age & Gender** (Scheme covers: ${scheme.eligibility.minAge || 18}–${scheme.eligibility.maxAge || 65} yrs, ${scheme.eligibility.genders?.join('/') || 'All'})\n- **State and City / District** (Coverage: ${statesInfo})\n- **Social Category** (Eligible: ${scheme.eligibility.categories?.join(', ') || 'All'})\n- **Business Sector & Required Funding** (Max limit: ${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'Varies'})`;
  }

  // Document questions
  if (lowerMsg.match(/(document|papers|proof)/)) {
    if (scheme.documents && scheme.documents.length > 0) {
      return `To apply for ${scheme.name}, you will need the following documents:\n- ${scheme.documents.join('\n- ')}`;
    }
    return `Specific documents for ${scheme.name} are not listed, but typically you need Identity Proof (Aadhaar/PAN), Address Proof, and Business Registration (if applicable).`;
  }

  // Amount questions
  if (lowerMsg.match(/(how much|loan amount|maximum|get)/)) {
    return `For ${scheme.name}, the maximum loan amount or financial benefit is: **${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'Varies based on project'}**.`;
  }

  // Interest rate
  if (lowerMsg.match(/(interest|rate)/)) {
    return `The interest rate for ${scheme.name} is generally: **${scheme.interestRate || 'Not specified or varies'}**.`;
  }

  // Repayment
  if (lowerMsg.match(/(repayment|tenure|period|how long)/)) {
    return `The repayment tenure for ${scheme.name} is: **${scheme.repaymentTenure || 'Depends on the lending institution'}**.`;
  }

  // Application process
  if (lowerMsg.match(/(apply|application|how to|process)/)) {
    if (scheme.applicationProcess && scheme.applicationProcess.length > 0) {
      return `**How to apply for ${scheme.name}:**\n\n${scheme.applicationProcess.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    }
    return `Please visit the official government portal or your nearest participating bank to apply for ${scheme.name}.`;
  }

  // Benefits
  if (lowerMsg.match(/(benefit|advantage|what do i get)/)) {
    if (scheme.benefits && scheme.benefits.length > 0) {
      return `**Key Benefits of ${scheme.name}:**\n- ${scheme.benefits.join('\n- ')}`;
    }
    return `The main benefit of ${scheme.name} is: ${scheme.description}`;
  }
  
  // Business questions
  if (lowerMsg.match(/(existing business|already have)/)) {
    if (scheme.eligibility.existingBusinessAllowed) {
      return `Yes, ${scheme.name} supports existing businesses!`;
    } else {
      return `Actually, ${scheme.name} is primarily targeted at new businesses or startups.`;
    }
  }
  
  // Who can apply
  if (lowerMsg.match(/(who can|target|beneficiary)/)) {
    return `**Target Beneficiaries:** ${scheme.targetBeneficiaries}\n\nGenerally, it is for: ages ${scheme.eligibility.minAge || 18} to ${scheme.eligibility.maxAge || 65}, ${scheme.eligibility.genders?.join(', ') || 'All'} genders, and ${scheme.eligibility.categories?.join(', ') || 'All'} categories.`;
  }

  // General description
  if (lowerMsg.match(/(what is|about|tell me|describe)/)) {
    return `**${scheme.name}**\n\n${scheme.description}`;
  }

  return "I don't have verified information about that in the current scheme data. You can ask me about eligibility, documents, loan amounts, interest rates, repayment, benefits, or the application process.";
}
