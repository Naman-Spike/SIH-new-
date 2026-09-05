import Link from 'next/link';
import { Search, ShieldCheck, Sparkles, ArrowRight, Layers } from 'lucide-react';
import Disclaimer from '@/components/Disclaimer';

export default function Home() {
  return (
    <div className="flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full space-y-12">
      {/* Minimalist Hero Section */}
      <section className="bg-white border border-neutral-200/90 rounded-3xl p-8 sm:p-14 lg:p-16 text-center shadow-xl shadow-neutral-100/50 relative overflow-hidden">
        {/* Soft atmospheric gradient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent blur-3xl opacity-70 pointer-events-none -z-0 -translate-y-24" />

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-600 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Assisted Government Scheme Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight mb-6 leading-[1.15]">
            Find the <span className="text-blue-600">Right Government</span>
            <br />
            <span className="text-indigo-600">Scheme</span> for You
          </h1>
          
          <p className="text-lg sm:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tell us about yourself and your business. We'll evaluate structured criteria and identify eligible schemes with full transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/scheme-finder" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-black hover:bg-neutral-800 shadow-md transition-all"
            >
              <span>Find My Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/chat" 
              className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Features Section */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">How It Works</h2>
          <p className="text-sm text-neutral-500 mt-1">Simple, deterministic, and explainable assistance for entrepreneurs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">1. Smart Matching</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              We evaluate your demographic, business sector, state, and income criteria against structured scheme rules.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">2. Transparent Results</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Clear explainable scoring showing matched conditions and specific eligibility criteria without black-box guessing.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 hover:border-black transition-all shadow-sm">
            <div className="w-12 h-12 bg-neutral-100 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 border border-neutral-200">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2">3. Contextual Assistant</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Ask scheme-specific questions about required documents, loan caps, interest subsidies, and application steps.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Disclaimer */}
      <div>
        <Disclaimer />
      </div>
    </div>
  );
}
