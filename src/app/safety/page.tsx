'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  HeartHandshake,
  AlertTriangle,
  Stethoscope,
  Pill,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export default function MedicalSafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>Clinical & Safety Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-950 tracking-tight">
          Medical Scope & Safety Disclaimers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          NutriAgent is designed as an educational and decision-support assistant. Please read our clinical boundaries carefully.
        </p>
      </div>

      {/* Emergency Alert Callout */}
      <div className="bg-red-50 border-2 border-red-300 rounded-3xl p-6 sm:p-8 space-y-3 text-red-950">
        <div className="flex items-center gap-2.5 text-red-700 font-bold text-base">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h2>Emergency Allergy & Medical Notice</h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed">
          If you or someone in your care is experiencing symptoms of severe anaphylaxis (difficulty breathing, swelling of the throat or tongue, hives, dizziness, or vomiting) after consuming a food product, <strong>call emergency services immediately (911 in the US)</strong> or administer prescribed emergency epinephrine (EpiPen). Do not consult NutriAgent or any mobile application during a medical emergency.
        </p>
      </div>

      {/* Core Safety Declarations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Item 1 */}
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-forest-700" />
          </div>
          <h3 className="text-base font-bold text-charcoal-900">Not a Medical Diagnostic System</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            NutriAgent does not diagnose medical conditions, prescribe specialized diets, or guarantee clinical outcomes. It calculates nutritional ratios and checks keyword lists against FDA, USDA, and AHA published guidelines. Always work with your physician or registered dietitian (RD/RDN) for individualized medical nutrition therapy.
          </p>
        </div>

        {/* Item 2 */}
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <h3 className="text-base font-bold text-charcoal-900">No Absolute Safety Guarantees</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Food manufacturers frequently change formulations, reformulate products, or share processing equipment without updating online databases or packaging immediately. NutriAgent evaluates only the visible printed label text supplied by the user. If ingredient text is missing, obscured, or uncertain, NutriAgent will refuse to declare the item allergen-free.
          </p>
        </div>

        {/* Item 3 */}
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-mint-50 text-mint-800 flex items-center justify-center">
            <Pill className="w-5 h-5 text-forest-700" />
          </div>
          <h3 className="text-base font-bold text-charcoal-900">Food-Drug Interactions</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Certain foods interact with prescription medications (e.g., grapefruit with statins, high-vitamin-K greens with warfarin, or tyramine with MAOIs). NutriAgent does not attempt to deduce unverified medication interactions. Never stop, start, or adjust medications based on food label scans; ask your dispensing pharmacist or prescriber.
          </p>
        </div>

        {/* Item 4 */}
        <div className="bg-white rounded-2xl border border-ivory-300 p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-base font-bold text-charcoal-900">Non-Diagnostic Chronic Health Context</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Guidance for conditions like hypertension or diabetes reflects public health benchmarks (such as the American Heart Association&apos;s 1,500mg daily sodium target or the American Diabetes Association&apos;s added sugar standards). These are informational reference points, not personal clinical limits.
          </p>
        </div>
      </div>

      {/* Guidelines Citations */}
      <div className="bg-ivory-100/60 rounded-3xl border border-ivory-300 p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-charcoal-900">
          Clinical & Regulatory Guideline References
        </h3>
        <p className="text-xs sm:text-sm text-slate-600">
          Our deterministic evaluation logic is grounded in established, public guidelines:
        </p>

        <ul className="space-y-3 text-xs">
          <li className="flex items-start gap-2">
            <span className="font-bold text-pencil-sage-600">•</span>
            <div>
              <strong className="text-coffee-900">ICMR–NIN Dietary Guidelines for Indians (2024):</strong> Guideline 3 added sugar limit (&lt;25g/day), Guideline 5 salt ceiling (&lt;5g/day / 2,000mg sodium), Guideline 4 saturated fat ceiling (&lt;10% energy), Guideline 9 HFSS (High Fat, Sugar, Salt) food reduction.{' '}
              <a
                href="https://www.nin.res.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pencil-sage-700 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>NIN Portal</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-pencil-sage-600">•</span>
            <div>
              <strong className="text-coffee-900">FSSAI Labelling and Display Regulations (2022 Gazette Notification):</strong> Mandatory saturated &amp; trans fat declarations when total fat &gt;0.5%; trans fat cap &le;2% of total fat; vegetarian green dot vs non-vegetarian brown dot standards.{' '}
              <a
                href="https://www.fssai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pencil-sage-700 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>FSSAI Portal</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-pencil-sage-600">•</span>
            <div>
              <strong className="text-coffee-900">U.S. FDA Nutrition Facts Regulations:</strong> Daily Values based on 2,000 calorie reference diet; 21 CFR § 101.9.{' '}
              <a
                href="https://www.fda.gov/food/food-labeling-nutrition"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pencil-sage-700 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>FDA Portal</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-pencil-sage-600">•</span>
            <div>
              <strong className="text-coffee-900">American Heart Association (AHA):</strong> Dietary sodium recommendations for cardiovascular health and blood pressure management.{' '}
              <a
                href="https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pencil-sage-700 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>AHA Guidelines</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-pencil-sage-600">•</span>
            <div>
              <strong className="text-coffee-900">Food Allergy Research &amp; Education (FARE):</strong> Precautionary allergen labeling standards and cross-contact awareness.{' '}
              <a
                href="https://www.foodallergy.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pencil-sage-700 underline font-semibold inline-flex items-center gap-0.5"
              >
                <span>FARE Guidelines</span> <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </li>
        </ul>
      </div>

      <div className="pt-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-forest-800 text-white font-bold text-xs sm:text-sm hover:bg-forest-700 transition-colors shadow-sm"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}

