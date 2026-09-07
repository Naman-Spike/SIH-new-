import { Scheme, UserProfile, MatchResult, formatCurrency } from '@/types';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function handleChatMessage(
  message: string,
  scheme: Scheme,
  userProfile: UserProfile | null,
  matchResult: MatchResult | null,
  langPreference?: 'en' | 'hi'
): string {
  const lowerMsg = message.toLowerCase();
  const containsHindiChars = /[\u0900-\u097F]/.test(message);
  const isHindi = langPreference === 'hi' || containsHindiChars;

  // 1. Eligibility questions
  if (lowerMsg.match(/(eligible|qualify|why recommended|why not|पात्र|पात्रता|योग्य)/)) {
    if (matchResult) {
      if (isHindi) {
        let response = `आपके प्रोफाइल के आधार पर, आप **${scheme.name}** के लिए **${matchResult.status === 'Eligible' ? '100% पात्र' : matchResult.status}** हैं।\n\n`;
        if (matchResult.matchedConditions && matchResult.matchedConditions.length > 0) {
          response += `**पात्रता के कारण:**\n- ${matchResult.matchedConditions.join('\n- ')}\n\n`;
        }
        if (matchResult.failedConditions && matchResult.failedConditions.length > 0) {
          response += `**ध्यान देने योग्य बिंदु:**\n- ${matchResult.failedConditions.join('\n- ')}\n\n`;
        }
        return response;
      }
      let response = `Based on your profile, you are **${matchResult.status}** for the ${scheme.name}.\n\n`;
      if (matchResult.matchedConditions && matchResult.matchedConditions.length > 0) {
        response += `**Why you match:**\n- ${matchResult.matchedConditions.join('\n- ')}\n\n`;
      }
      if (matchResult.failedConditions && matchResult.failedConditions.length > 0) {
        response += `**Areas of concern:**\n- ${matchResult.failedConditions.join('\n- ')}\n\n`;
      }
      return response;
    }

    const statesInfo = scheme.eligibility.states?.includes('ALL') ? (isHindi ? 'अखिल भारतीय (Pan-India)' : 'Pan-India') : scheme.eligibility.states?.join(', ');
    if (isHindi) {
      return `**${scheme.name}** के लिए पात्रता जांचने हेतु कृपया बताएं:\n` +
        `- **आयु व लिंग** (योजना सीमा: ${scheme.eligibility.minAge || 18}–${scheme.eligibility.maxAge || 65} वर्ष, ${scheme.eligibility.genders?.join('/') || 'सभी'})\n` +
        `- **राज्य व शहर / ज़िला** (कवरेज: ${statesInfo})\n` +
        `- **सामाजिक श्रेणी** (पात्र: ${scheme.eligibility.categories?.join(', ') || 'सभी'})\n` +
        `- **व्यवसाय क्षेत्र व आवश्यक ऋण** (अधिकतम सीमा: ${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'परियोजना अनुसार'})`;
    }
    return `To evaluate if you qualify for **${scheme.name}**, please share:\n- **Age & Gender** (Scheme covers: ${scheme.eligibility.minAge || 18}–${scheme.eligibility.maxAge || 65} yrs, ${scheme.eligibility.genders?.join('/') || 'All'})\n- **State and City / District** (Coverage: ${statesInfo})\n- **Social Category** (Eligible: ${scheme.eligibility.categories?.join(', ') || 'All'})\n- **Business Sector & Required Funding** (Max limit: ${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'Varies'})`;
  }

  // 2. Document questions
  if (lowerMsg.match(/(document|documents|paper|papers|proof|दस्तावेज|दस्तावेज़|कागजात|कागज़ात|प्रमाणपत्र)/)) {
    if (scheme.documents && scheme.documents.length > 0) {
      if (isHindi) {
        return `**${scheme.name} के लिए आवश्यक दस्तावेज़:**\n\n- ${scheme.documents.join('\n- ')}\n\nकृपया आवेदन के समय इन मूल प्रतियों को अपने पास अवश्य रखें।`;
      }
      return `**Required Documents for ${scheme.name}:**\n\n- ${scheme.documents.join('\n- ')}\n\nMake sure to keep original copies ready when submitting your application.`;
    }
    if (isHindi) {
      return `**${scheme.name}** के लिए विशिष्ट दस्तावेज़ अलग से सूचीबद्ध नहीं हैं, किंतु सामान्यतः पहचान प्रमाण (आधार/पैन कार्ड), निवास प्रमाण, बैंक विवरण और व्यवसाय पंजीकरण आवश्यक होते हैं।`;
    }
    return `Specific documents for ${scheme.name} are not listed, but typically you need Identity Proof (Aadhaar/PAN), Address Proof, and Business Registration (if applicable).`;
  }

  // 3. Amount questions
  if (lowerMsg.match(/(how much|loan amount|maximum|get|ऋण|लोन|राशि|पैसे|कितना)/)) {
    if (isHindi) {
      return `**${scheme.name}** के तहत अधिकतम ऋण या वित्तीय सहायता राशि: **${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'परियोजना आवश्यकतानुसार'}** है।`;
    }
    return `For ${scheme.name}, the maximum loan amount or financial benefit is: **${scheme.maximumLoanAmount ? formatCurrency(scheme.maximumLoanAmount) : 'Varies based on project'}**.`;
  }

  // 4. Interest rate
  if (lowerMsg.match(/(interest|rate|ब्याज|दर)/)) {
    if (isHindi) {
      return `**${scheme.name}** के लिए ब्याज दर: **${scheme.interestRate || 'सरकारी सब्सिडी अथवा बैंक के नियमानुसार'}** है।`;
    }
    return `The interest rate for ${scheme.name} is generally: **${scheme.interestRate || 'Not specified or varies'}**.`;
  }

  // 5. Repayment
  if (lowerMsg.match(/(repayment|tenure|period|how long|अवधि|समय|किस्त)/)) {
    if (isHindi) {
      return `**${scheme.name}** के लिए ऋण अदायगी अवधि: **${scheme.repaymentTenure || 'संबंधित बैंक की शर्तों के अनुसार'}** है।`;
    }
    return `The repayment tenure for ${scheme.name} is: **${scheme.repaymentTenure || 'Depends on the lending institution'}**.`;
  }

  // 6. Application process
  if (lowerMsg.match(/(apply|application|how to|process|आवेदन|प्रक्रिया|कैसे करें)/)) {
    if (scheme.applicationProcess && scheme.applicationProcess.length > 0) {
      if (isHindi) {
        return `**${scheme.name} के लिए आवेदन प्रक्रिया:**\n\n${scheme.applicationProcess.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
      }
      return `**How to apply for ${scheme.name}:**\n\n${scheme.applicationProcess.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
    }
    if (isHindi) {
      return `कृपया ${scheme.name} में आवेदन करने के लिए आधिकारिक सरकारी पोर्टल या निकटतम नोडल बैंक शाखा पर जाएं।`;
    }
    return `Please visit the official government portal or your nearest participating bank to apply for ${scheme.name}.`;
  }

  // 7. Benefits
  if (lowerMsg.match(/(benefit|advantage|what do i get|लाभ|फायदा|सब्सिडी)/)) {
    if (scheme.benefits && scheme.benefits.length > 0) {
      if (isHindi) {
        return `**${scheme.name} के मुख्य लाभ:**\n- ${scheme.benefits.join('\n- ')}`;
      }
      return `**Key Benefits of ${scheme.name}:**\n- ${scheme.benefits.join('\n- ')}`;
    }
    if (isHindi) {
      return `**${scheme.name}** का मुख्य उद्देश्य: ${scheme.description}`;
    }
    return `The main benefit of ${scheme.name} is: ${scheme.description}`;
  }
  
  // 8. Business questions
  if (lowerMsg.match(/(existing business|already have|मौजूदा व्यवसाय|नया व्यवसाय)/)) {
    if (scheme.eligibility.existingBusinessAllowed) {
      if (isHindi) return `हाँ, **${scheme.name}** मौजूदा व्यवसायों के विस्तार और आधुनिकीकरण के लिए भी सहायता प्रदान करती है!`;
      return `Yes, ${scheme.name} supports existing businesses!`;
    } else {
      if (isHindi) return `यह योजना विशेष रूप से नए उद्यमों और स्टार्टअप्स के लिए तैयार की गई है।`;
      return `Actually, ${scheme.name} is primarily targeted at new businesses or startups.`;
    }
  }
  
  // 9. Who can apply
  if (lowerMsg.match(/(who can|target|beneficiary|कौन आवेदन|पात्र कौन)/)) {
    if (isHindi) {
      return `**लक्षित लाभार्थी:** ${scheme.targetBeneficiaries}\n\nपात्रता: आयु ${scheme.eligibility.minAge || 18} से ${scheme.eligibility.maxAge || 65} वर्ष, ${scheme.eligibility.genders?.join(', ') || 'सभी'} लिंग, और ${scheme.eligibility.categories?.join(', ') || 'सभी'} सामाजिक श्रेणियां।`;
    }
    return `**Target Beneficiaries:** ${scheme.targetBeneficiaries}\n\nGenerally, it is for: ages ${scheme.eligibility.minAge || 18} to ${scheme.eligibility.maxAge || 65}, ${scheme.eligibility.genders?.join(', ') || 'All'} genders, and ${scheme.eligibility.categories?.join(', ') || 'All'} categories.`;
  }

  // 10. General description
  if (lowerMsg.match(/(what is|about|tell me|describe|योजना क्या है|विवरण)/)) {
    return `**${scheme.name}**\n\n${scheme.description}`;
  }

  if (isHindi) {
    return "मुझे वर्तमान योजना डेटा में इसके बारे में विशिष्ट जानकारी नहीं मिली। आप मुझसे पात्रता, आवश्यक दस्तावेज़, ऋण राशि, ब्याज दर, अदायगी अवधि, लाभ या आवेदन प्रक्रिया के बारे में पूछ सकते हैं।";
  }

  return "I don't have verified information about that in the current scheme data. You can ask me about eligibility, documents, loan amounts, interest rates, repayment, benefits, or the application process.";
}
