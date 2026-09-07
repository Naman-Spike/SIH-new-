'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';
import type { UserProfile, MatchResult } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface ChatBoxProps {
  schemeId: string;
  schemeName: string;
  userProfile: UserProfile | null;
  matchResult: MatchResult | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBox({ schemeId, schemeName, userProfile, matchResult }: ChatBoxProps) {
  const { language, isHindi, t } = useLanguage();

  const suggestedQuestions = isHindi ? [
    'आवश्यक दस्तावेज़ क्या हैं?',
    'मैं कैसे आवेदन करूँ?',
    'इसके क्या लाभ हैं?',
    'अधिकतम ऋण राशि कितनी है?'
  ] : [
    'What documents do I need?',
    'How do I apply?',
    'What are the benefits?',
    'Why am I eligible?'
  ];

  const initialGreeting = isHindi
    ? `नमस्ते! मैं ${schemeName} के बारे में आपके सभी प्रश्नों का उत्तर दे सकता हूँ। मुझसे आवश्यक दस्तावेज़, ऋण राशि, ब्याज दर, सब्सिडी या आवेदन प्रक्रिया के बारे में पूछें।`
    : `Hello! I can answer any questions about ${schemeName}. Ask me about your eligibility, required documents, benefits, loan amounts, or application steps.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: initialGreeting
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg = text.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          schemeId,
          userProfile,
          matchResult,
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: isHindi 
            ? 'क्षमा करें, उत्तर प्राप्त करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' 
            : 'Sorry, I encountered an error. Please try again later.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm max-h-[620px]">
      {/* Chat Header */}
      <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight">{schemeName} Assistant</h4>
            <span className="text-xs text-neutral-400">
              {isHindi ? 'योजना संवादात्मक सहायक' : 'Contextual Scheme Assistant'}
            </span>
          </div>
        </div>
        <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>AI</span>
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-white text-neutral-900 border border-neutral-200 rounded-2xl rounded-tl-sm shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-neutral-200 text-neutral-600 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-2 text-sm shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>{isHindi ? 'योजना विवरण विश्लेषित किए जा रहे हैं...' : 'Analyzing scheme details...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input & Suggestions */}
      <div className="p-4 bg-white border-t border-neutral-200">
        {messages.length < 3 && !isLoading && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="text-xs bg-neutral-50 border border-neutral-200 text-neutral-700 px-3 py-1.5 rounded-full hover:bg-black hover:text-white hover:border-black transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend(input)}
            placeholder={isHindi ? 'योजना के बारे में प्रश्न पूछें (उदा. दस्तावेज, ऋण)...' : 'Ask a question about this scheme...'}
            disabled={isLoading}
            className="flex-1 rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-neutral-100 pr-12 transition-all"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-black text-white rounded-full hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
