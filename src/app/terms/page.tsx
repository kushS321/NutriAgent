'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldAlert } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100/70 text-forest-800 border border-forest-200 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5 text-forest-600" />
          <span>Terms of Use</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Please review these terms before using the NutriAgent decision-support platform.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">1. Acceptance of Terms</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By accessing or using NutriAgent, you acknowledge that you have read, understood, and agree to be bound by these terms. If you do not agree, do not use the application.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">2. Educational Scope & Assumption of Risk</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            NutriAgent is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis for general educational and nutritional decision support only. It does not provide medical diagnoses, treatment, or guaranteed allergy clearance. You assume full personal responsibility for your dietary choices, checking physical packaging, and consulting medical professionals.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">3. Label Changes & OCR Accuracy</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            While NutriAgent strives for high precision, computer vision and OCR algorithms can be affected by lighting, folds, reflections, or print quality. You must review and confirm all extracted numbers on the Product Review screen before relying on analysis.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">4. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Under no circumstances shall NutriAgent, its developers, or affiliates be liable for direct, indirect, incidental, or consequential damages resulting from food consumption, allergic reactions, dietary adjustments, or reliance on information presented within the application.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4">
        <span>Effective: October 2026</span>
        <Link href="/safety" className="text-forest-700 font-semibold underline">
          Read Medical Safety Boundaries →
        </Link>
      </div>
    </div>
  );
}

