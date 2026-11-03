'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Sparkles, Camera, AlertCircle, FileSearch, CheckCircle2 } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How does NutriAgent decide "Can I Eat This?"',
      a: 'We evaluate the confirmed ingredients and nutrition numbers from the label against your saved dietary profile. If an allergen or severe restriction is present, the app flags "Review carefully". If everything aligns cleanly without warnings, it flags "Potentially fits preferences". If essential facts like the ingredients list are missing or unreadable, it flags "Not enough information".',
    },
    {
      q: 'Does NutriAgent replace my doctor or allergist?',
      a: 'No. NutriAgent is an informational decision-support and educational tool. It does not provide medical diagnoses, treatment plans, or absolute clinical safety clearances. For severe allergies or medically prescribed diets, always verify packaging and ask your clinician.',
    },
    {
      q: 'What if the camera photo is blurry or misses text?',
      a: 'NutriAgent highlights an OCR confidence score and flags uncertain fields before assessment. You can review and edit every single extracted value on the Product Review screen before generating your verdict.',
    },
    {
      q: 'What is the 5% / 20% Daily Value rule?',
      a: 'According to the U.S. FDA, a Daily Value of 5% or less is considered low for that nutrient, while 20% or more is high. When managing blood pressure, look for low sodium (<5% DV); when managing blood sugar, look for minimal added sugars.',
    },
    {
      q: 'Can I install NutriAgent on my phone?',
      a: 'Yes! NutriAgent is built as a Progressive Web App (PWA). In Safari on iOS, tap Share and select "Add to Home Screen". In Chrome on Android or desktop, click the Install App prompt in the address bar.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100/70 text-forest-800 border border-forest-200 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-forest-600" />
          <span>Support & Label Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 tracking-tight">
          Help & Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Learn how to get the most out of food label scanning and nutritional interpretations.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm space-y-2 hover:border-forest-200 transition-colors"
          >
            <h3 className="text-base font-bold text-charcoal-900 flex items-start gap-2.5">
              <span className="text-forest-700 font-extrabold">Q:</span>
              <span>{item.q}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 pl-6 leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>

      <div className="p-6 bg-ivory-100/60 rounded-3xl border border-ivory-300 text-center space-y-3">
        <h3 className="text-base font-bold text-charcoal-900">Need to test right now?</h3>
        <p className="text-xs text-slate-500">
          Try scanning a sample label or enter a grocery item manually.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 text-white font-bold text-xs shadow-sm hover:bg-forest-700 transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-mint-300" />
          <span>Open Scanner</span>
        </Link>
      </div>
    </div>
  );
}

