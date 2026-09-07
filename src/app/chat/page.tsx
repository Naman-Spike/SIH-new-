'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Sparkles, ArrowRight, Send, User, Bot, CheckCircle2, FileText, Globe } from 'lucide-react';
import { STATE_ALIASES, INDIAN_STATES, formatCurrency } from '@/types';
import type { UserProfile, Scheme } from '@/types';
import Disclaimer from '@/components/Disclaimer';
import { useLanguage } from '@/context/LanguageContext';
import localSchemesData from '@/data/schemes.json';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

export default function ChatModePage() {
  const router = useRouter();
  const { language, setLanguage, isHindi, t } = useLanguage();

  const getWelcomeText = (lang: 'en' | 'hi') => {
    if (lang === 'hi') {
      return "नमस्ते! मैं आपका उद्योग-सेतु एआई सहायक हूँ। 🇮🇳\n\n" +
        "मैं कुछ आसान सवालों के ज़रिए आपके लिए **100% उपयुक्त सरकारी योजनाएं** और उनके **आवश्यक दस्तावेज़** ढूंढने में मदद करूँगा।\n\n" +
        "शुरू करने के लिए: आपकी **आयु** और **लिंग** क्या है?";
    }
    return "Hello! I am your Udhyog-Setu AI Assistant. 🇮🇳\n\n" +
      "I will guide you with a few quick questions to find government schemes that **100% match your profile**, along with the **Required Documents** for each.\n\n" +
      "To start: What is your **age** and **gender**?";
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: getWelcomeText(language),
    },
  ]);

  // Synchronize initial message if user switches language at start
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg-0') {
        return [{
          id: 'msg-0',
          sender: 'assistant',
          text: getWelcomeText(language),
        }];
      }
      return prev;
    });
  }, [language]);

  const [inputText, setInputText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    existingBusiness: false,
    existingLoan: false,
    annualIncome: '₹2.5–5 lakh',
    businessStatus: 'Starting a new business',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isMatching]);

  const parseMessage = (text: string, current: Partial<UserProfile>): Partial<UserProfile> => {
    const updated = { ...current };
    const lower = text.toLowerCase();

    // 1. Age
    const ageMatch = text.match(/(\d{2})\s*(?:year|yr|age|years old|वर्ष|साल)?/i);
    if (ageMatch && parseInt(ageMatch[1], 10) >= 18 && parseInt(ageMatch[1], 10) <= 100) {
      updated.age = parseInt(ageMatch[1], 10);
    }

    // 2. Gender
    if (lower.match(/\b(woman|female|women|girl)\b/) || text.match(/(महिला|औरत|लड़की)/)) updated.gender = 'Female';
    else if (lower.match(/\b(man|male|men|boy)\b/) || text.match(/(पुरुष|आदमी|लड़का)/)) updated.gender = 'Male';
    else if (lower.match(/\b(other|transgender)\b/) || text.match(/(अन्य|ट्रांसजेंडर)/)) updated.gender = 'Other';

    // 3. State
    for (const [alias, fullState] of Object.entries(STATE_ALIASES)) {
      const pattern = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        updated.state = fullState;
        break;
      }
    }
    if (!updated.state) {
      for (const st of INDIAN_STATES) {
        if (lower.includes(st.toLowerCase())) {
          updated.state = st;
          break;
        }
      }
    }

    // 4. City / District
    const cityRegex = /(?:in|from|city|district|at|near|living in|located in|में|से|ज़िला|जिला|शहर)\s+([a-zA-Z\u0900-\u097F]+)/i;
    const cityMatch = text.match(cityRegex);
    if (cityMatch && cityMatch[1]) {
      const cand = cityMatch[1].trim();
      const ignore = ['a', 'the', 'my', 'our', 'new', 'general', 'sc', 'st', 'obc', 'female', 'male', 'india', 'state', 'want', 'need', 'me', 'se', 'hai'];
      const isState = INDIAN_STATES.some((s) => s.toLowerCase() === cand.toLowerCase()) ||
                      Object.keys(STATE_ALIASES).some((a) => a.toLowerCase() === cand.toLowerCase());
      if (!ignore.includes(cand.toLowerCase()) && !isState && cand.length > 2) {
        updated.city = cand.charAt(0).toUpperCase() + cand.slice(1);
      }
    } else if (updated.state && !updated.city) {
      const parts = text.split(/[,;\s]+/).map((p) => p.trim());
      for (const p of parts) {
        const isState = INDIAN_STATES.some((s) => s.toLowerCase() === p.toLowerCase()) ||
                        Object.keys(STATE_ALIASES).some((a) => a.toLowerCase() === p.toLowerCase());
        const ignore = ['and', 'from', 'in', 'i', 'am', 'im', 'live', 'living', 'at', 'near', 'my', 'the', 'me', 'se', 'hai', 'mera'];
        if (!isState && !ignore.includes(p.toLowerCase()) && p.length > 2) {
          updated.city = p.charAt(0).toUpperCase() + p.slice(1);
          break;
        }
      }
    }

    // 5. Category
    if (lower.match(/\b(sc)\b/) || text.match(/(अनुसूचित जाति|एससी)/)) updated.category = 'SC';
    else if (lower.match(/\b(st)\b/) || text.match(/(अनुसूचित जनजाति|एसटी)/)) updated.category = 'ST';
    else if (lower.match(/\b(obc)\b/) || text.match(/(अन्य पिछड़ा वर्ग|ओबीसी)/)) updated.category = 'OBC';
    else if (lower.match(/\b(minority|muslim|christian|sikh|jain|buddhist)\b/) || text.match(/(अल्पसंख्यक|मुस्लिम|सिख|जैन|ईसाई|बौद्ध)/)) updated.category = 'Minority';
    else if (lower.match(/\b(general|unreserved|ur)\b/) || text.match(/(सामान्य)/)) updated.category = 'General';

    // 6. Sector
    if (lower.match(/(farm|agri|crop|dairy|poultry)/) || text.match(/(कृषि|खेती|डेयरी|पशुपालन)/)) updated.businessType = 'Agriculture';
    else if (lower.match(/(manufactur|factory|product|plant|mak)/) || text.match(/(उत्पादन|विनिर्माण|फैक्ट्री|कारखाना)/)) updated.businessType = 'Manufacturing';
    else if (lower.match(/(food|cook|bakery|canteen|restaurant|cafe|snack)/) || text.match(/(खाद्य|खाना|रेस्टोरेंट|बेकरी|मिठाई|कैंटीन)/)) updated.businessType = 'Food';
    else if (lower.match(/(tailor|textile|cloth|boutique|garment|stitch)/) || text.match(/(सिलाई|कपड़ा|वस्त्र|बुटीक)/)) updated.businessType = 'Tailoring/Textiles';
    else if (lower.match(/(craft|handicraft|artisan|pottery|leather)/) || text.match(/(हस्तशिल्प|कारीगर|शिल्प|मिट्टी|चमड़ा)/)) updated.businessType = 'Handicrafts';
    else if (lower.match(/(shop|retail|trad|store|mart|wholesal|sell|distribut)/) || text.match(/(दुकान|व्यापार|थोक|खुदरा|ट्रेडिंग)/)) updated.businessType = 'Trading';
    else if (lower.match(/(service|repair|salon|consult|clean|it|software|agency)/) || text.match(/(सेवा|सर्विस|मरम्मत|सैलून|सॉफ्टवेयर)/)) updated.businessType = 'Service';

    // 7. Project Cost
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs|लाख)/i);
    if (lakhMatch) {
      updated.projectCost = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = text.match(/(?:need|require|cost|loan|funding|project of|ऋण|लोन|लागत)?\s*(?:rs\.?|rupees|₹|रुपये)?\s*(\d{5,8})/i);
      if (numMatch) {
        updated.projectCost = parseInt(numMatch[1], 10);
      }
    }

    return updated;
  };

  const getNextPrompt = (p: Partial<UserProfile>): string | null => {
    if (!p.age || !p.gender) {
      return isHindi
        ? "कृपया अपनी **आयु** (18 से 100 वर्ष) और **लिंग** (पुरुष, महिला, या अन्य) बताएं।"
        : "Please tell me your **age** (between 18 and 100) and **gender** (Male, Female, or Other).";
    }
    if (!p.state) {
      return isHindi
        ? "आप किस **राज्य** (उदा. UP, HR, Maharashtra, Delhi) और **शहर / ज़िला** में स्थित हैं?"
        : "Which **State** (e.g. UP, HR, Maharashtra, Delhi) and **City / District** are you located in?";
    }
    if (!p.city) {
      return isHindi
        ? `बढ़िया, ${p.state}! आपका **शहर या ज़िला** कौन सा है?`
        : `Got it, ${p.state}! What is your **City or District**?`;
    }
    if (!p.category) {
      return isHindi
        ? "आपकी **सामाजिक श्रेणी** क्या है? (विकल्प: सामान्य, ओबीसी, एससी, एसटी, या अल्पसंख्यक)"
        : "What is your **social category**? (Options: General, OBC, SC, ST, or Minority)";
    }
    if (!p.businessType) {
      return isHindi
        ? "आप किस प्रकार का **व्यवसाय या उद्योग क्षेत्र** शुरू कर रहे हैं या चला रहे हैं? (उदा. विनिर्माण, खाद्य प्रसंस्करण, सेवा, व्यापार, कृषि, सिलाई, हस्तशिल्प)"
        : "What type of **business industry or sector** are you starting or running? (e.g. Manufacturing, Food, Service, Trading, Agriculture, Tailoring, Handicrafts)";
    }
    if (!p.projectCost) {
      return isHindi
        ? "आपकी अनुमानित **परियोजना लागत या ऋण आवश्यकता** ₹ में कितनी है? (उदा. 3 लाख, 5 लाख, 10 लाख)"
        : "What is your estimated **project cost or loan requirement** in ₹? (e.g. 3 Lakh, 5 Lakh, 10 Lakh)";
    }
    return null;
  };

  // Helper to generate list of required documents for all top schemes
  const getDocumentsOverviewResponse = (lang: 'en' | 'hi') => {
    const schemesList = localSchemesData.schemes as unknown as Scheme[];
    const topSchemes = schemesList.slice(0, 6);

    if (lang === 'hi') {
      let text = "📋 **प्रमुख सरकारी योजनाओं के लिए आवश्यक दस्तावेज़:**\n\n";
      topSchemes.forEach((s, idx) => {
        text += `**${idx + 1}. ${s.name}**\n`;
        text += `• अधिकतम सहायता: ${s.maximumLoanAmount ? formatCurrency(s.maximumLoanAmount) : 'परियोजना अनुसार'}\n`;
        text += `• **आवश्यक दस्तावेज़:**\n`;
        s.documents.forEach((doc) => {
          text += `  - ${doc}\n`;
        });
        text += "\n";
      });
      text += "💡 *आप ऊपर अपनी आयु, लिंग, राज्य और व्यवसाय बताकर यह भी जान सकते हैं कि आप इनमें से किस योजना के लिए 100% पात्र हैं!*";
      return text;
    }

    let text = "📋 **Required Documents for Major Government Schemes:**\n\n";
    topSchemes.forEach((s, idx) => {
      text += `**${idx + 1}. ${s.name}**\n`;
      text += `• Max Financial Assistance: ${s.maximumLoanAmount ? formatCurrency(s.maximumLoanAmount) : 'Varies'}\n`;
      text += `• **Required Documents:**\n`;
      s.documents.forEach((doc) => {
        text += `  - ${doc}\n`;
      });
      text += "\n";
    });
    text += "💡 *You can also answer a few quick questions (age, state, sector) to discover which schemes you 100% qualify for!*";
    return text;
  };

  const handleSend = async (textToSend?: string) => {
    const raw = (textToSend || inputText).trim();
    if (!raw) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: raw,
    };

    setInputText('');

    // Check if user specifically asks for language switch
    const lower = raw.toLowerCase();
    if (lower === 'hindi' || lower === 'हिन्दी' || lower.includes('in hindi') || lower.includes('हिन्दी में')) {
      setLanguage('hi');
      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: "भाषा बदलकर **हिन्दी** कर दी गई है! 🇮🇳\n\n" +
          "आइए आपके लिए 100% उपयुक्त सरकारी योजनाएं और आवश्यक दस्तावेज़ खोजते हैं।\n\n" +
          "आपकी **आयु** (Age) और **लिंग** (Gender) क्या है?",
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
      return;
    }

    if (lower === 'english' || lower.includes('in english')) {
      setLanguage('en');
      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: "Language set to **English**! 🇬🇧\n\n" +
          "Let's find government schemes that 100% match your profile along with the required documents.\n\n" +
          "What is your **age** and **gender**?",
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
      return;
    }

    // Check if user asks for required documents overview
    if (lower.match(/(document|documents|paper|papers|proof|दस्तावेज|दस्तावेज़|कागजात|कागज़ात|प्रमाणपत्र)/i) && 
        (lower.includes('all') || lower.includes('each') || lower.includes('scheme') || lower.includes('list') || lower.includes('योजना') || lower.includes('आवश्यक'))) {
      const docsOverview = getDocumentsOverviewResponse(language);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: docsOverview,
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
      return;
    }

    const newProfile = parseMessage(raw, profile);
    setProfile(newProfile);

    const nextPrompt = getNextPrompt(newProfile);

    if (nextPrompt) {
      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: nextPrompt,
      };
      setMessages((prev) => [...prev, userMessage, botMessage]);
      return;
    }

    // All collected! Run matching automatically and present schemes + documents directly in chat
    setMessages((prev) => [...prev, userMessage]);
    setIsMatching(true);

    try {
      const response = await fetch('/api/match-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });

      const data = await response.json();
      sessionStorage.setItem('user-profile', JSON.stringify(newProfile));
      sessionStorage.setItem('match-results', JSON.stringify(data.matches));

      const eligibleMatches = (data.matches || []).filter((m: any) => m.score === 100 && m.status === 'Eligible');
      const schemesList = localSchemesData.schemes as unknown as Scheme[];
      const schemeMap = new Map<string, Scheme>();
      schemesList.forEach((s) => schemeMap.set(s.id, s));

      let botResponseText = '';
      if (isHindi) {
        botResponseText = `🎉 **प्रोफाइल पूर्ण!** आपके विवरण के आधार पर **100% उपयुक्त सरकारी योजनाएं** और उनके **आवश्यक दस्तावेज़**:\n\n`;
        if (eligibleMatches.length > 0) {
          eligibleMatches.slice(0, 4).forEach((m: any, idx: number) => {
            const s = schemeMap.get(m.schemeId);
            botResponseText += `**${idx + 1}. 🏛️ ${m.schemeName}**\n`;
            if (s?.maximumLoanAmount) {
              botResponseText += `• अधिकतम ऋण सहायता: **${formatCurrency(s.maximumLoanAmount)}**\n`;
            }
            if (s?.documents && s.documents.length > 0) {
              botResponseText += `• **📄 आवश्यक दस्तावेज़:**\n`;
              s.documents.forEach((doc) => {
                botResponseText += `  ✓ ${doc}\n`;
              });
            }
            botResponseText += "\n";
          });
          botResponseText += `👉 **[यहाँ क्लिक करके सभी ${eligibleMatches.length} योजनाओं का पूरा विवरण और तुलना देखें](/results)**`;
        } else {
          botResponseText += `आपके द्वारा दर्ज विवरण के अनुसार वर्तमान में कोई 100% मेल खाती योजना नहीं मिली। कृपया अपने व्यवसाय क्षेत्र या ऋण राशि में थोड़ा बदलाव करके देखें।`;
        }
      } else {
        botResponseText = `🎉 **Profile Complete!** Here are your **100% Matching Government Schemes** and the **Required Documents** for each:\n\n`;
        if (eligibleMatches.length > 0) {
          eligibleMatches.slice(0, 4).forEach((m: any, idx: number) => {
            const s = schemeMap.get(m.schemeId);
            botResponseText += `**${idx + 1}. 🏛️ ${m.schemeName}**\n`;
            if (s?.maximumLoanAmount) {
              botResponseText += `• Max Loan Assistance: **${formatCurrency(s.maximumLoanAmount)}**\n`;
            }
            if (s?.documents && s.documents.length > 0) {
              botResponseText += `• **📄 Required Documents:**\n`;
              s.documents.forEach((doc) => {
                botResponseText += `  ✓ ${doc}\n`;
              });
            }
            botResponseText += "\n";
          });
          botResponseText += `👉 **[Click here to view full scheme details & apply on Results Page](/results)**`;
        } else {
          botResponseText += `No schemes 100% matched these specific parameters. Try adjusting your business sector or loan amount.`;
        }
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now() + 1}`,
        sender: 'assistant',
        text: botResponseText,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Matching failed:', err);
    } finally {
      setIsMatching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMatchSchemes = async () => {
    if (!profile.age || !profile.gender || !profile.state || !profile.category || !profile.businessType || !profile.projectCost) {
      return;
    }

    setIsMatching(true);

    try {
      const response = await fetch('/api/match-schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to match schemes');

      const data = await response.json();
      sessionStorage.setItem('user-profile', JSON.stringify(profile));
      sessionStorage.setItem('match-results', JSON.stringify(data.matches));

      router.push('/results');
    } catch (err) {
      console.error('Matching failed:', err);
      setIsMatching(false);
    }
  };

  const isProfileComplete = Boolean(
    profile.age &&
    profile.gender &&
    profile.state &&
    profile.category &&
    profile.businessType &&
    profile.projectCost
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-start w-full overflow-hidden">
      {/* Soft atmospheric gradient glow behind hero */}
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none overflow-hidden">
        <div className="w-[1100px] h-[520px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl opacity-80 rounded-full -translate-y-24" />
      </div>

      <div className="flex-1 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{isHindi ? 'संवादात्मक सरकारी योजना खोज' : 'Conversational Scheme Discovery'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {isHindi ? 'एआई योजना सहायक' : 'AI Scheme Assistant'}
          </h1>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto">
            {isHindi 
              ? 'अपनी आयु, स्थान (राज्य व शहर), सामाजिक श्रेणी और व्यवसाय के बारे में बताएं।'
              : 'Answer a few quick questions to find government schemes and their required documents.'}
          </p>
        </div>

        {/* Chat Window */}
        <div className="bg-white shadow-xl shadow-neutral-100/60 border border-neutral-200/90 rounded-3xl overflow-hidden flex flex-col h-[540px]">
          {/* Prominent Chat Sub-Header with Language Toggle */}
          <div className="px-5 py-3 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight">
                  {isHindi ? 'उद्योग-सेतु संवादात्मक सहायक' : 'Udhyog-Setu AI Assistant'}
                </h3>
                <span className="text-[11px] text-neutral-400">
                  {isHindi ? '100% योजना मिलान व दस्तावेज़ सूची' : '100% Scheme Matching & Documents'}
                </span>
              </div>
            </div>

            {/* Language Switcher Pill inside Chat Header */}
            <div className="flex items-center bg-white/10 p-1 rounded-full border border-white/20 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setLanguage('en');
                  handleSend('English');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'en'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('hi');
                  handleSend('हिन्दी');
                }}
                className={`px-3 py-1 rounded-full transition-all ${
                  language === 'hi'
                    ? 'bg-white text-black font-bold shadow-xs'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/40">
            {messages.map((msg) => {
              const isBot = msg.sender === 'assistant';
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
                  {isBot && (
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      isBot
                        ? 'bg-white border border-neutral-200 text-neutral-800 shadow-xs'
                        : 'bg-black text-white font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {!isBot && (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}
            {isMatching && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-neutral-200 text-neutral-600 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>
                    {isHindi ? '100% उपयुक्त योजनाएं और आवश्यक दस्तावेज़ जांचे जा रहे हैं...' : 'Matching 100% schemes & compiling required documents...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply shortcuts */}
          <div className="px-4 py-2 border-t border-neutral-100 bg-white flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
            <span className="text-neutral-400 self-center mr-1">{t('quickPick')}</span>
            {[
              { label: '📋 ' + (isHindi ? 'आवश्यक दस्तावेज़ सूची' : 'Required Documents for Schemes'), val: isHindi ? 'आवश्यक दस्तावेज़ क्या हैं?' : 'What documents are required for each scheme?' },
              { label: isHindi ? '28, महिला, लखनऊ UP' : '28, Female, Lucknow UP', val: isHindi ? '28 वर्ष, महिला, लखनऊ उत्तर प्रदेश' : '28, Female, Lucknow UP' },
              { label: isHindi ? 'ओबीसी (OBC) श्रेणी' : 'OBC Category', val: 'OBC' },
              { label: isHindi ? 'खाद्य प्रसंस्करण (Food)' : 'Food Processing', val: 'Food' },
              { label: isHindi ? '₹5 लाख ऋण' : '₹5 Lakh loan', val: '500000' },
            ].map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sug.val)}
                className="px-3 py-1 rounded-full border border-neutral-200 hover:border-black bg-neutral-50 hover:bg-neutral-100 transition-all font-medium"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHindi ? 'अपना उत्तर या प्रश्न लिखें (उदा. 28 महिला लखनऊ, आवश्यक दस्तावेज)...' : 'Type your answer or question (e.g. 28 Female Lucknow, documents required)...'}
              className="flex-1 px-4 py-3 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Detected Profile Preview & Submit */}
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                {isHindi ? 'स्वतः संकलित प्रोफाइल (Live Profile)' : 'Live Detected Profile'}
              </h3>
              <p className="text-xs text-neutral-400">
                {isHindi ? 'बातचीत के दौरान यह स्वतः अपडेट होता है।' : 'Updates as you chat with the assistant.'}
              </p>
            </div>
            {isProfileComplete && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'योजना जांच हेतु तैयार' : 'Ready to Match'}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'आयु व लिंग' : 'Age & Gender'}
              </span>
              <span className="font-bold text-neutral-900">
                {profile.age ? `${profile.age} ${isHindi ? 'वर्ष' : 'yrs'}` : '—'} {profile.gender ? `(${profile.gender})` : ''}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'राज्य' : 'State'}
              </span>
              <span className="font-bold text-neutral-900">{profile.state || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'शहर / ज़िला' : 'City / District'}
              </span>
              <span className="font-bold text-neutral-900">{profile.city || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'श्रेणी' : 'Category'}
              </span>
              <span className="font-bold text-neutral-900">{profile.category || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'व्यवसाय क्षेत्र' : 'Business Sector'}
              </span>
              <span className="font-bold text-neutral-900">{profile.businessType || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                {isHindi ? 'परियोजना लागत' : 'Project Cost'}
              </span>
              <span className="font-bold text-neutral-900">
                {profile.projectCost ? formatCurrency(profile.projectCost) : '—'}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 col-span-2 flex items-center justify-between">
              <div>
                <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">
                  {isHindi ? 'या चरणबद्ध फॉर्म का उपयोग करें:' : 'Or use structured form:'}
                </span>
                <Link href="/scheme-finder" className="text-xs font-semibold text-neutral-800 hover:underline">
                  {isHindi ? '3-चरणीय योजना खोजक पर जाएं →' : 'Go to 3-Step Scheme Finder →'}
                </Link>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMatchSchemes}
            disabled={!isProfileComplete || isMatching}
            className="w-full py-3.5 px-6 rounded-full bg-black text-white font-semibold text-sm hover:bg-neutral-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {isMatching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isHindi ? '100% उपयुक्त योजनाएं जांची जा रही हैं...' : 'Evaluating 100% Matches...'}</span>
              </>
            ) : (
              <>
                <span>{isHindi ? '100% पात्र योजनाएं व दस्तावेज़ देखें' : 'Find 100% Matching Schemes & Documents'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
