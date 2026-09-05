'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Sparkles, ArrowRight, Send, User, Bot, RefreshCw, CheckCircle2 } from 'lucide-react';
import { STATE_ALIASES, normalizeStateName, INDIAN_STATES, formatCurrency } from '@/types';
import type { UserProfile } from '@/types';
import Disclaimer from '@/components/Disclaimer';

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
}

export default function ChatModePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: "Hello! I am your Udhyog-Setu AI Assistant. I will guide you with a few quick questions to find government schemes that 100% match your profile.\n\nTo start: What is your **age** and **gender**?",
    },
  ]);
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
  }, [messages]);

  const parseMessage = (text: string, current: Partial<UserProfile>): Partial<UserProfile> => {
    const updated = { ...current };
    const lower = text.toLowerCase();

    // 1. Age
    const ageMatch = text.match(/(\d{2})\s*(?:year|yr|age|years old)?/i);
    if (ageMatch && parseInt(ageMatch[1], 10) >= 18 && parseInt(ageMatch[1], 10) <= 100) {
      updated.age = parseInt(ageMatch[1], 10);
    }

    // 2. Gender
    if (lower.match(/\b(woman|female|women|girl)\b/)) updated.gender = 'Female';
    else if (lower.match(/\b(man|male|men|boy)\b/)) updated.gender = 'Male';
    else if (lower.match(/\b(other|transgender)\b/)) updated.gender = 'Other';

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
    const cityRegex = /(?:in|from|city|district|at|near|living in|located in)\s+([a-zA-Z]+)(?:[,\s]+(?:city|district|town))?/i;
    const cityMatch = text.match(cityRegex);
    if (cityMatch && cityMatch[1]) {
      const cand = cityMatch[1].trim();
      const ignore = ['a', 'the', 'my', 'our', 'new', 'general', 'sc', 'st', 'obc', 'female', 'male', 'india', 'state', 'want', 'need'];
      const isState = INDIAN_STATES.some((s) => s.toLowerCase() === cand.toLowerCase()) ||
                      Object.keys(STATE_ALIASES).some((a) => a.toLowerCase() === cand.toLowerCase());
      if (!ignore.includes(cand.toLowerCase()) && !isState && cand.length > 2) {
        updated.city = cand.charAt(0).toUpperCase() + cand.slice(1);
      }
    } else if (updated.state && !updated.city) {
      // If user typed e.g. "Lucknow, UP" or "Pune"
      const parts = text.split(/[,;\s]+/).map((p) => p.trim());
      for (const p of parts) {
        const isState = INDIAN_STATES.some((s) => s.toLowerCase() === p.toLowerCase()) ||
                        Object.keys(STATE_ALIASES).some((a) => a.toLowerCase() === p.toLowerCase());
        const ignore = ['and', 'from', 'in', 'i', 'am', 'im', 'live', 'living', 'at', 'near', 'my', 'the'];
        if (!isState && !ignore.includes(p.toLowerCase()) && p.length > 2 && /^[a-zA-Z]+$/.test(p)) {
          updated.city = p.charAt(0).toUpperCase() + p.slice(1);
          break;
        }
      }
    }

    // 5. Category
    if (lower.match(/\b(sc)\b/)) updated.category = 'SC';
    else if (lower.match(/\b(st)\b/)) updated.category = 'ST';
    else if (lower.match(/\b(obc)\b/)) updated.category = 'OBC';
    else if (lower.match(/\b(minority|muslim|christian|sikh|jain|buddhist)\b/)) updated.category = 'Minority';
    else if (lower.match(/\b(general|unreserved|ur)\b/)) updated.category = 'General';

    // 6. Sector
    if (lower.match(/(farm|agri|crop|dairy|poultry)/)) updated.businessType = 'Agriculture';
    else if (lower.match(/(manufactur|factory|product|plant|mak)/)) updated.businessType = 'Manufacturing';
    else if (lower.match(/(food|cook|bakery|canteen|restaurant|cafe|snack)/)) updated.businessType = 'Food';
    else if (lower.match(/(tailor|textile|cloth|boutique|garment|stitch)/)) updated.businessType = 'Tailoring/Textiles';
    else if (lower.match(/(craft|handicraft|artisan|pottery|leather)/)) updated.businessType = 'Handicrafts';
    else if (lower.match(/(shop|retail|trad|store|mart|wholesal|sell|distribut)/)) updated.businessType = 'Trading';
    else if (lower.match(/(service|repair|salon|consult|clean|it|software|agency)/)) updated.businessType = 'Service';

    // 7. Project Cost
    const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)/i);
    if (lakhMatch) {
      updated.projectCost = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = text.match(/(?:need|require|cost|loan|funding|project of)?\s*(?:rs\.?|rupees|₹)?\s*(\d{5,8})/i);
      if (numMatch) {
        updated.projectCost = parseInt(numMatch[1], 10);
      }
    }

    return updated;
  };

  const getNextPrompt = (p: Partial<UserProfile>): string | null => {
    if (!p.age || !p.gender) {
      return "Please tell me your **age** (between 18 and 100) and **gender** (Male, Female, or Other).";
    }
    if (!p.state) {
      return "Which **State** (e.g. UP, HR, Maharashtra, Delhi) and **City / District** are you located in?";
    }
    if (!p.city) {
      return `Got it, ${p.state}! What is your **City or District**?`;
    }
    if (!p.category) {
      return "What is your **social category**? (Options: General, OBC, SC, ST, or Minority)";
    }
    if (!p.businessType) {
      return "What type of **business industry or sector** are you starting or running? (e.g. Manufacturing, Food, Service, Trading, Agriculture, Tailoring, Handicrafts)";
    }
    if (!p.projectCost) {
      return "What is your estimated **project cost or loan requirement** in ₹? (e.g. 3 Lakh, 5 Lakh, 10 Lakh)";
    }
    return null; // All collected!
  };

  const handleSend = (textToSend?: string) => {
    const raw = (textToSend || inputText).trim();
    if (!raw) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: raw,
    };

    const newProfile = parseMessage(raw, profile);
    setProfile(newProfile);
    setInputText('');

    const nextPrompt = getNextPrompt(newProfile);

    let botResponseText = '';
    if (nextPrompt) {
      botResponseText = nextPrompt;
    } else {
      botResponseText = `🎉 **Profile Complete!** Here is what we collected:\n\n` +
        `• **Age & Gender**: ${newProfile.age} yrs, ${newProfile.gender}\n` +
        `• **Location**: ${newProfile.city ? `${newProfile.city}, ` : ''}${newProfile.state}\n` +
        `• **Category**: ${newProfile.category}\n` +
        `• **Sector**: ${newProfile.businessType}\n` +
        `• **Project Requirement**: ${newProfile.projectCost ? formatCurrency(newProfile.projectCost) : '₹5 Lakh'}\n\n` +
        `You can now view all schemes that **100% match** your profile!`;
    }

    const botMessage: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'assistant',
      text: botResponseText,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
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

      <div className="flex-1 max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Conversational Scheme Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            AI Scheme Assistant
          </h1>
          <p className="text-sm text-neutral-500 max-w-lg mx-auto">
            Answer a few quick questions about your age, location (state & city), category, and venture.
          </p>
        </div>

        {/* Chat Window */}
        <div className="bg-white shadow-xl shadow-neutral-100/60 border border-neutral-200/90 rounded-3xl overflow-hidden flex flex-col h-[520px]">
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
                    className={`max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick reply shortcuts */}
          <div className="px-4 py-2 border-t border-neutral-100 bg-white flex flex-wrap gap-1.5 text-xs text-neutral-600">
            <span className="text-neutral-400 self-center mr-1">Suggested:</span>
            {['28, Female', 'Lucknow, UP', 'OBC Category', 'Food Processing', '₹5 Lakh loan'].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleSend(sug)}
                className="px-3 py-1 rounded-full border border-neutral-200 hover:border-black bg-neutral-50 hover:bg-neutral-100 transition-all"
              >
                {sug}
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
              placeholder="Type your answer (e.g. 28 Female, Lucknow UP, 5 Lakh)..."
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
              <h3 className="text-sm font-bold text-neutral-900">Live Detected Profile</h3>
              <p className="text-xs text-neutral-400">Updates as you chat with the assistant.</p>
            </div>
            {isProfileComplete && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready to Match</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">Age & Gender</span>
              <span className="font-bold text-neutral-900">
                {profile.age ? `${profile.age} yrs` : '—'} {profile.gender ? `(${profile.gender})` : ''}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">State</span>
              <span className="font-bold text-neutral-900">{profile.state || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">City / District</span>
              <span className="font-bold text-neutral-900">{profile.city || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">Category</span>
              <span className="font-bold text-neutral-900">{profile.category || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">Business Sector</span>
              <span className="font-bold text-neutral-900">{profile.businessType || '—'}</span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100">
              <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">Project Cost</span>
              <span className="font-bold text-neutral-900">
                {profile.projectCost ? formatCurrency(profile.projectCost) : '—'}
              </span>
            </div>

            <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-100 col-span-2 flex items-center justify-between">
              <div>
                <span className="block text-neutral-400 uppercase font-semibold text-[10px] mb-0.5">Or use structured form:</span>
                <Link href="/scheme-finder" className="text-xs font-semibold text-neutral-800 hover:underline">
                  Go to 3-Step Scheme Finder →
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
                <span>Evaluating 100% Matches...</span>
              </>
            ) : (
              <>
                <span>Find 100% Matching Schemes</span>
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
