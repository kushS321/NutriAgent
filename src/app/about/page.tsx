'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Cpu,
  BookOpen,
  Lock,
  ArrowRight,
  Users,
  Layers,
  CheckCircle2,
  FileText,
  Lightbulb,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title */}
      <div className="space-y-3 text-center sm:text-left border-b border-beige-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#275A3A]" />
          <span>Evidence-Based Nutrition Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-coffee-950 tracking-tight">
          About NutriAgent
        </h1>
        <p className="text-sm sm:text-base text-coffee-700 leading-relaxed font-serif italic">
          &ldquo;Know Your Food. Know Your Health.&rdquo; — The central question: &ldquo;Can I Eat This?&rdquo;
        </p>
      </div>

      {/* Project Overview */}
      <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-serif font-bold text-coffee-950">Project Origins & Vision</h2>
        <p className="text-xs sm:text-sm text-coffee-700 leading-relaxed">
          NutriAgent was engineered to solve a ubiquitous consumer problem: 
          deciphering dense, confusing packaged-food labels. Whether managing high blood pressure, type 2 diabetes, celiac disease, or a strict vegetarian diet, standing in a supermarket aisle and reading microscopic numbers is stressful and prone to error.
        </p>
        <p className="text-xs sm:text-sm text-coffee-700 leading-relaxed">
          NutriAgent bridges the gap between raw manufacturer declarations and individual health needs by combining 
          camera barcode scanning, Open Food Facts database integration, human-in-the-loop OCR review, and explainable rule engines grounded in <strong>ICMR-NIN 2024 Dietary Guidelines for Indians</strong> and <strong>FSSAI 2022 Regulations</strong>.
        </p>
      </div>

      {/* 5 Stages of Development & Evaluation */}
      <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-beige-200 pb-3">
          <Layers className="w-5 h-5 text-coffee-800" />
          <h2 className="text-lg font-serif font-bold text-coffee-950">
            Human-Centred Product & Evaluation Process
          </h2>
        </div>

        <div className="space-y-5 text-xs text-coffee-700 leading-relaxed">
          {/* Stage 1: Empathize */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-coffee-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#E5F0FA] text-[#254F75] flex items-center justify-center text-xs">
                1
              </span>
              <span>Empathize: Understanding Real-World Frustrations</span>
            </div>
            <p>
              We conducted <strong>5 informal stakeholder interviews</strong>, which were transcribed, cleaned, and categorized into 8 thematic categories: Buying Factors, Food Label Confusion, Personal Health Needs, Current Workarounds, Time & Effort, Marketing vs. Reality, Trust & Reliability, and Desired Features.
            </p>
          </div>

          {/* Stage 2: Define */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-coffee-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FDE8E0] text-[#8D3418] flex items-center justify-center text-xs">
                2
              </span>
              <span>Define: Final Problem Statement</span>
            </div>
            <p className="italic bg-white p-3 rounded-xl border border-beige-200">
              &ldquo;People with different health and dietary needs find it difficult to choose packaged food. Food labels contain complex nutrition information and unfamiliar ingredients. They need a simple and personalized way to understand whether a food is suitable for them and why.&rdquo;
            </p>
          </div>

          {/* Stage 3: Ideate */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-coffee-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FAF0AE] text-[#715707] flex items-center justify-center text-xs">
                3
              </span>
              <span>Ideate & Teammate Feature Rating</span>
            </div>
            <p>
              Generated a 15-question feature priority questionnaire rated across five teammates. Photo scanning (4.6/5), simplifying technical terms (4.4/5), and explainable reasoning behind recommendations (4.4/5) emerged as decisive core capabilities.
            </p>
          </div>

          {/* Stage 4: Prototype */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-coffee-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#E4F1E9] text-[#275A3A] flex items-center justify-center text-xs">
                4
              </span>
              <span>Prototype: 9-Screen Medium-Fidelity Journey</span>
            </div>
            <p>
              Designed paper sketches communicating the 9 connected screens: Splash/Welcome, Sign Up, Home/Dashboard, Meal Plan, Food Scanner, Nutrition Insights, Profile/Settings, Goal Setup, and Nutrition Assistant.
            </p>
          </div>

          {/* Stage 5: Test */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
            <div className="flex items-center gap-2 font-serif font-bold text-coffee-950 text-sm">
              <span className="w-6 h-6 rounded-full bg-[#FCE6DF] text-[#A8442A] flex items-center justify-center text-xs">
                5
              </span>
              <span>Test: Working Web Application Implementation</span>
            </div>
            <p>
              Progressed from paper sketches into this fully working Next.js and TypeScript application, ensuring real API calls to Open Food Facts, reliable OCR review, and verified unit test suites.
            </p>
          </div>
        </div>
      </div>

      {/* Trust & Engineering Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-warm bg-white border border-beige-200 p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#E4F1E9] text-[#275A3A] flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-coffee-950">Deterministic Rules</h3>
          <p className="text-xs text-coffee-600 leading-relaxed">
            Safety assessments run on deterministic code, not black-box hallucinating chatbot prompts.
          </p>
        </div>

        <div className="card-warm bg-white border border-beige-200 p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#E5F0FA] text-[#254F75] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-coffee-950">Guideline Citing</h3>
          <p className="text-xs text-coffee-600 leading-relaxed">
            Every flag cites ICMR-NIN 2024, FSSAI 2022, or WHO standards with clear evidence.
          </p>
        </div>

        <div className="card-warm bg-white border border-beige-200 p-5 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0AE] text-[#715707] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif font-bold text-coffee-950">Local-First Privacy</h3>
          <p className="text-xs text-coffee-600 leading-relaxed">
            Personal health details stay in your browser. We never monetize or sell personal dietary data.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-4 flex items-center justify-center">
        <Link href="/scan" className="btn-pencil-brown text-xs py-3 px-6 font-bold shadow-warm">
          <span>Explore Food Scanner</span>
          <ArrowRight className="w-4 h-4 text-pencil-sage-300" />
        </Link>
      </div>
    </div>
  );
}
