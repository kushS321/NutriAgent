'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Educational Disclaimer" className="bg-forest-900 text-forest-100 text-xs py-2 px-4 border-b border-forest-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="leading-snug">
            <strong className="font-semibold text-white">Educational Tool Only:</strong>{' '}
            NutriAgent provides food-label analysis for personal decision support. It does not provide medical diagnoses, treatment, or absolute safety guarantees.{' '}
            <Link href="/safety" className="text-emerald-300 underline underline-offset-2 hover:text-white transition-colors">
              Read Medical Safety Scope
            </Link>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-forest-300 hover:text-white p-1 rounded transition-colors shrink-0"
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

