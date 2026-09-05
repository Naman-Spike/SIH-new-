'use client';

import ProfileForm from '@/components/ProfileForm';
import Disclaimer from '@/components/Disclaimer';
import { ClipboardCheck, Sparkles } from 'lucide-react';

export default function SchemeFinderPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-start w-full overflow-hidden">
      {/* Soft atmospheric gradient glow behind hero */}
      <div className="absolute inset-x-0 top-0 -z-10 flex justify-center pointer-events-none overflow-hidden">
        <div className="w-[1100px] h-[520px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent blur-3xl opacity-80 rounded-full -translate-y-24" />
      </div>

      <div className="flex-1 max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full space-y-10">
        {/* Hero Header Section */}
        <div className="text-center flex flex-col items-center space-y-3.5">
          {/* Badge 1: Smart Eligibility Checker */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white border border-neutral-200/90 text-xs font-medium text-neutral-700 shadow-xs">
            <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Smart Eligibility Checker</span>
          </div>

          {/* Badge 2: AI-Assisted Government Scheme Discovery */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Assisted Government Scheme Discovery</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.12] pt-2">
            Find the <span className="text-blue-600">Right Government</span>
            <br />
            <span className="text-indigo-600">Scheme</span> for You
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed pt-1">
            Complete a simple 3-step profile assessment to discover government schemes that best match your personal, business and financial profile.
          </p>
        </div>

        {/* Form Container */}
        <ProfileForm />

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto pt-4">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
