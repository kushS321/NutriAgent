'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, HeartHandshake, ExternalLink, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-coffee-950 text-coffee-200 pt-12 pb-24 lg:pb-12 border-t border-coffee-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-coffee-800 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-pencil-sage-300" />
              </div>
              <span className="text-lg font-serif font-bold text-white tracking-tight">
                NutriAgent
              </span>
            </div>
            <p className="text-xs text-coffee-300 leading-relaxed">
              AI-powered food-label scanning and personal nutrition assistant. Answering “Can I Eat This?” with transparent, evidence-aware decision support.
            </p>
            <div className="flex items-center gap-2 text-xs text-pencil-sage-300">
              <Shield className="w-3.5 h-3.5" />
              <span>ICMR-NIN & FSSAI Grounded</span>
            </div>
          </div>

          {/* Core App Navigation */}
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white mb-3">
              Core Application
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/scan" className="hover:text-white transition-colors">
                  Check a Food (Scanner)
                </Link>
              </li>
              <li>
                <Link href="/meal-planner" className="hover:text-white transition-colors">
                  Meal Planner & Food Diary
                </Link>
              </li>
              <li>
                <Link href="/insights" className="hover:text-white transition-colors">
                  Nutrition Trends & Insights
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Apples-to-Apples Comparison
                </Link>
              </li>
              <li>
                <Link href="/assistant" className="hover:text-white transition-colors">
                  Nutrition Assistant (AI Chat)
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="hover:text-white transition-colors">
                  Ingredient & Additives Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Safety Resources */}
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white mb-3">
              Resources &amp; Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About NutriAgent
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors text-pencil-sage-300 font-medium">
                  Safety &amp; Clinical Boundaries
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white transition-colors">
                  Personal Dietary Profile
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Data Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Sources & Official Guidelines */}
          <div>
            <h4 className="text-xs font-serif font-bold uppercase tracking-wider text-white mb-3">
              Standards & Data Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://world.openfoodfacts.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>Open Food Facts (ODbL License)</span>
                  <ExternalLink className="w-3 h-3 text-coffee-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.nin.res.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>ICMR-NIN Dietary Guidelines (2024)</span>
                  <ExternalLink className="w-3 h-3 text-coffee-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.fssai.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>FSSAI Labelling Regulations (2022)</span>
                  <ExternalLink className="w-3 h-3 text-coffee-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.who.int/publications/i/item/9789241504836"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  <span>WHO Daily Sodium Guidance</span>
                  <ExternalLink className="w-3 h-3 text-coffee-400" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="pt-6 border-t border-coffee-800 text-[11px] text-coffee-400 leading-relaxed flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="max-w-3xl text-center sm:text-left">
            <strong>Educational Disclaimer:</strong> NutriAgent is an informational personal nutrition assistant. It does not provide medical diagnoses, treatment plans, or clinician-prescribed diets. Always consult a qualified physician or registered dietitian for medical nutrition therapy.
          </p>
          <div className="shrink-0 text-center sm:text-right text-coffee-500">
            © {new Date().getFullYear()} NutriAgent. Know Your Food. Know Your Health.
          </div>
        </div>
      </div>
    </footer>
  );
}
