'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Shield, EyeOff, Trash2, Download } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100/70 text-forest-800 border border-forest-200 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-forest-600" />
          <span>Data Protection Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          NutriAgent is built on strict data minimization: we do not sell your health data or monetize via targeted advertising.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-ivory-300 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">1. Local-First Architecture</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            By default, NutriAgent runs entirely on your local device. Your personal dietary restrictions, allergy selections, and scanned food records are stored in your device&apos;s local storage. They are never sent to external brokers or commercial tracking networks.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">2. Uploaded Food Label Images</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            When you upload or photograph a food label, the image is used solely to extract text (via server-side OCR adapter). By default, raw image files are discarded immediately after text extraction to protect your storage and privacy. You may opt in to thumbnail persistence in Profile Settings.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">3. No Advertising Monetization</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We never share your dietary restrictions, food allergies, or scan history with advertisers, pharmaceutical manufacturers, or packaged-food brands.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-charcoal-900">4. Right to Export & Deletion</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            You can download a complete JSON archive of all your saved assessments and profile settings at any time from your Profile screen. You can also permanently wipe all records from your browser with a single click.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-4">
        <span>Last Updated: October 2026</span>
        <Link href="/profile" className="text-forest-700 font-semibold underline">
          Go to Data Management in Profile →
        </Link>
      </div>
    </div>
  );
}

