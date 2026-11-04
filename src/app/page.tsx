'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Barcode,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileSearch,
  BookOpen,
  Scale,
  Zap,
  Lock,
  Utensils,
  Bot,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  HeartHandshake,
  TrendingUp,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';
import { AssessmentEngine } from '@/lib/assessment/rulesEngine';
import { UserRepository, DEFAULT_GUEST_PROFILE } from '@/lib/storage/userRepository';
import StatusBadge from '@/components/nutrition/StatusBadge';

export default function LandingPage() {
  const router = useRouter();
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const sampleProd = SAMPLE_PRODUCTS[selectedSampleIndex];
  const sampleAssessment = AssessmentEngine.assess(sampleProd, DEFAULT_GUEST_PROFILE);

  const handleTestSampleClick = (prod: typeof sampleProd) => {
    UserRepository.setActiveProduct(prod);
    router.push('/review');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'What is NutriAgent and what is its primary purpose?',
      a: 'NutriAgent is an AI-powered food-label scanning and personal nutrition decision-support assistant. Its central mission is to answer one practical question: "Can I Eat This?" by decoding packaged-food ingredients, nutritional values, allergens, and chemical additives against your stated dietary restrictions, allergies, and health goals.',
    },
    {
      q: 'Does NutriAgent provide clinical medical diagnoses or safety guarantees?',
      a: 'No. NutriAgent is an informational and educational decision-support tool. It does not provide medical diagnoses, prescribe dietary treatments, or issue clinical safety guarantees. Individuals with life-threatening food allergies or medical conditions must always inspect physical product packaging and consult licensed healthcare professionals.',
    },
    {
      q: 'How does the barcode scanner and product lookup work?',
      a: 'When you scan or enter a barcode, NutriAgent queries the public Open Food Facts database (over 3 million products) and our local verified Indian food catalog. It retrieves the product name, brands, ingredients list, allergens, and nutrition facts. If a barcode is not found, you can search by product name, upload a label photo for OCR extraction, or enter numbers manually.',
    },
    {
      q: 'How does NutriAgent evaluate Indian foods and regulations?',
      a: 'NutriAgent incorporates the Food Safety and Standards Authority of India (FSSAI 2022) Labelling and Display Regulations and the ICMR–National Institute of Nutrition (ICMR-NIN 2024) Dietary Guidelines for Indians. It monitors added sugar caps (<25g/day), daily sodium ceilings (<2,000mg/day or <5g salt), trans fat thresholds (<=2% of total fats), and FSSAI vegetarian/non-vegetarian symbols.',
    },
    {
      q: 'How does the Food Label OCR work and can I correct errors?',
      a: 'OCR is treated as an automated extraction, not a verified fact. When you photograph a food package, NutriAgent extracts visible text and presents a Review & Correction screen. You can edit any field, verify units (per 100g vs per serving), inspect raw OCR text, and verify values before any assessment is generated.',
    },
    {
      q: 'Is my personal dietary profile kept private?',
      a: 'Yes. NutriAgent operates with a local-first privacy architecture. Your profile, allergies, scan history, and meal logs are stored locally on your device in your browser. When Supabase is configured, data is secured using PostgreSQL Row Level Security (RLS) so that users can access only their own private records.',
    },
  ];

  return (
    <div className="flex flex-col bg-beige-50">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-beige-300">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5EFEB]/80 via-beige-50 to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission & Headline */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F0FA] border border-[#ABCFF0] text-[#254F75] text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#254F75]" />
                <span>AI-Powered Food-Label & Nutrition Assistant</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-coffee-950 tracking-tight leading-[1.15]">
                  Know Your Food.{' '}
                  <span className="text-[#3B7A52] block mt-1">Know Your Health.</span>
                </h1>
                <p className="text-lg sm:text-xl font-serif italic text-coffee-700">
                  The central question: <strong className="text-coffee-950 font-bold not-italic">&ldquo;Can I Eat This?&rdquo;</strong>
                </p>
              </div>

              <p className="text-sm sm:text-base text-coffee-700 max-w-2xl leading-relaxed">
                Packaged food labels are filled with tiny print, deceptive serving sizes, hidden chemical synonyms, and confusing numbers. NutriAgent scans barcodes and labels to translate complex nutrition facts into a clear, personalized, explainable assessment tailored to your personal dietary goals and allergies.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  href="/scan"
                  className="btn-pencil-brown text-base py-3.5 px-7 font-bold group shadow-warm"
                >
                  <Barcode className="w-5 h-5 text-pencil-sage-300 group-hover:scale-110 transition-transform" />
                  <span>Scan Your Food</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-70 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="btn-pencil-peach text-base py-3.5 px-6 font-semibold"
                >
                  <span>Explore How It Works</span>
                </a>
              </div>

              {/* Research & Trust Badges */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-coffee-700 pt-3">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pencil-sage-600" />
                  <span>Conservative allergen safeguards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pencil-blue-600" />
                  <span>ICMR-NIN 2024 & FSSAI 2022 grounded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-coffee-500" />
                  <span>Private local-first data storage</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Demo Product Evaluator */}
            <div className="lg:col-span-5">
              <div className="card-warm bg-white border border-beige-300 shadow-float p-5 sm:p-6 space-y-4 relative">
                {/* Demo Card Header */}
                <div className="flex items-center justify-between border-b border-beige-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pencil-sage-500 animate-pulse" />
                    <span className="text-xs font-serif font-bold uppercase tracking-wider text-coffee-800">
                      Interactive Product Scanner Preview
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#275A3A] bg-[#E4F1E9] px-2 py-0.5 rounded border border-[#A7D1B7]">
                    Live Demo
                  </span>
                </div>

                {/* Sample Selector Pills */}
                <div>
                  <label className="text-xs font-semibold text-coffee-600 block mb-1.5">
                    Select a real packaged product to test:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {SAMPLE_PRODUCTS.slice(0, 6).map((prod, idx) => (
                      <button
                        key={prod.id}
                        onClick={() => setSelectedSampleIndex(idx)}
                        className={`px-2 py-2 rounded-xl text-xs font-semibold text-left truncate transition-all border ${
                          selectedSampleIndex === idx
                            ? 'bg-coffee-800 text-[#FAF7F2] border-coffee-900 shadow-subtle'
                            : 'bg-beige-50 hover:bg-beige-100 text-coffee-800 border-beige-300'
                        }`}
                        title={prod.name}
                      >
                        {prod.name.split(' ')[0]} {prod.name.split(' ')[1] || ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Preview Info */}
                <div className="bg-beige-50 rounded-2xl p-3.5 border border-beige-200 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-serif font-bold text-coffee-950 line-clamp-1">
                        {sampleProd.name}
                      </h4>
                      <p className="text-xs text-coffee-600">
                        {sampleProd.brand || 'Packaged Grocery'} • {sampleProd.nutrition.servingSize} •{' '}
                        {sampleProd.nutrition.calories} kcal
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-beige-200 flex items-center justify-between">
                    <span className="text-xs text-coffee-700 font-medium">Verdict for Guest Profile:</span>
                    <StatusBadge status={sampleAssessment.status} size="sm" />
                  </div>
                </div>

                {/* Primary Reasons Snippet */}
                <div className="space-y-2">
                  <p className="text-xs font-serif font-bold text-coffee-700 uppercase tracking-wider">
                    Key Explanatory Reasons:
                  </p>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {sampleAssessment.personalizedReasons.slice(0, 2).map((r) => (
                      <div
                        key={r.id}
                        className={`text-xs p-2.5 rounded-xl border flex items-start gap-2 ${
                          r.severity === 'alert'
                            ? 'bg-[#FFF6F2] border-[#FCD0C0] text-coffee-950'
                            : r.severity === 'caution'
                            ? 'bg-[#FEFDF0] border-[#FAF0AE] text-coffee-950'
                            : 'bg-[#F3F8F5] border-[#C9E3D3] text-coffee-950'
                        }`}
                      >
                        {r.severity === 'alert' ? (
                          <AlertTriangle className="w-4 h-4 text-pencil-peach-700 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-pencil-sage-700 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="font-semibold block">{r.title}</strong>
                          <span className="text-[11px] leading-snug block opacity-90">{r.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test in Full Mode CTA */}
                <button
                  onClick={() => handleTestSampleClick(sampleProd)}
                  className="w-full btn-pencil-brown py-2.5 text-xs font-bold"
                >
                  <span>Inspect Full Label & Calculations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW NUTRIAGENT WORKS (4 STEPS) */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="badge-pencil-sage">Workflow Methodology</div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-coffee-950 tracking-tight">
              From Food Package to Explainable Verdict
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600 leading-relaxed">
              Unlike generic AI chatbots that hallucinate nutrition facts, NutriAgent combines verified public databases (Open Food Facts), transparent OCR review, and documented public health standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* Step 1 */}
            <div className="card-warm bg-beige-50 border border-beige-200 p-6 space-y-4 hover:border-coffee-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] flex items-center justify-center font-serif font-bold text-base shadow-subtle">
                1
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">Scan or Upload Label</h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Scan barcode via camera, search Open Food Facts by product name, or photograph the Nutrition Facts and ingredients table.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-warm bg-beige-50 border border-beige-200 p-6 space-y-4 hover:border-coffee-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FDE8E0] text-[#8D3418] border border-[#F7B29B] flex items-center justify-center font-serif font-bold text-base shadow-subtle">
                2
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">Extract & Validate</h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Extract available fields (calories, sodium, sugars, protein, fat, additives). Distinguish per-100g values from per-serving values.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-warm bg-beige-50 border border-beige-200 p-6 space-y-4 hover:border-coffee-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0AE] text-[#715707] border border-[#F5E47E] flex items-center justify-center font-serif font-bold text-base shadow-subtle">
                3
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">Review & Correct</h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Users can inspect raw OCR text and correct any uncertain numbers before analysis. Missing values are never falsely assumed as zero.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-warm bg-beige-50 border border-beige-200 p-6 space-y-4 hover:border-coffee-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] flex items-center justify-center font-serif font-bold text-base shadow-subtle">
                4
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">Explainable Verdict</h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Receive an explainable answer with exact citations from ICMR-NIN 2024, FSSAI 2022, and WHO guidelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SHOWCASE */}
      <section className="py-16 sm:py-24 bg-beige-50 border-b border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="badge-pencil-peach">Feature Highlights</div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-coffee-950 tracking-tight">
              Designed for Authentic Food Literacy
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              Built as a comprehensive design-thinking college project combining barcode intelligence, OCR review, meal planning, and explainable AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#275A3A]" />
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">
                Conservative Allergen Safeguards
              </h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Direct keyword matching and chemical synonyms (e.g. casein/whey for milk, albumin for egg, arachis for peanuts) with false-positive guards (cocoa butter is dairy-free; buckwheat is gluten-free).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#254F75]" />
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">
                ICMR-NIN & FSSAI Grounding
              </h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Applies transparent public health thresholds: added sugar capped at &lt;25g/day, sodium limited to &lt;2,000mg/day (5g salt), and mandatory FSSAI saturated/trans fat disclosure for total fats &gt;0.5%.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF0AE] text-[#715707] border border-[#F5E47E] flex items-center justify-center">
                <Scale className="w-5 h-5 text-[#715707]" />
              </div>
              {/* <h3 className="text-base font-serif font-bold text-coffee-950">
                Apples-to-Apples Comparison
              </h3> */}
              <p className="text-xs text-coffee-600 leading-relaxed">
                Compare competing snacks and cereals by normalizing nutrition data to a standard 100g baseline, preventing deceptive serving size tricks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDE8E0] text-[#8D3418] border border-[#F7B29B] flex items-center justify-center">
                <Utensils className="w-5 h-5 text-[#8D3418]" />
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">
                Connected Food Diary & Planner
              </h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Log breakfast, lunch, dinner, and snacks directly from scanned products. Track your actual daily calories, protein, carbs, and sodium against targets.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#254F75]" />
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">
                NutriAgent Nutrition Assistant
              </h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Ask conversational questions about chemical additives (INS 621 MSG, INS 322 lecithin), sugar conversion, and active product suitability with authoritative citations.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#275A3A]" />
              </div>
              <h3 className="text-base font-serif font-bold text-coffee-950">
                Longitudinal Health Trends
              </h3>
              <p className="text-xs text-coffee-600 leading-relaxed">
                Inspect 7-day intake charts, frequent ingredient patterns, and non-medical dietary suggestions without fabricated or artificial statistics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT FOR COMPLETE LABEL CLARITY */}
      <section className="py-16 sm:py-24 bg-white border-b border-beige-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="badge-pencil-sage">Evidence-Based Intelligence</div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-coffee-950 tracking-tight">
              Built for Everyday Label Clarity
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              NutriAgent cuts through deceptive front-of-pack slogans and dense back-of-pack chemical fine print to deliver direct, personalized answers you can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-xs text-coffee-800 leading-relaxed">
              <p>
                Packaged food labels are filled with complex chemical synonyms, microscopic serving sizes, and hidden sugars. Whether you are managing hypertension, diabetes, celiac disease, or following a vegetarian or Jain diet, standing in a supermarket aisle shouldn&apos;t feel overwhelming.
              </p>
              <div className="bg-beige-50 p-4 rounded-2xl border border-beige-200 space-y-2">
                <strong className="text-coffee-950 font-serif block text-sm">
                  Our Mission:
                </strong>
                <p className="italic text-coffee-700">
                  &ldquo;To provide a transparent, personalized, and clinically grounded assistant that answers &lsquo;Can I Eat This?&rsquo; with plain-language explanations, exact nutrient thresholds, and zero guesswork.&rdquo;
                </p>
              </div>
              <p>
                Every recommendation links directly to official standards from the <strong>ICMR–National Institute of Nutrition (2024)</strong>, <strong>FSSAI 2022 Labelling Regulations</strong>, and the <strong>American Heart Association</strong>.
              </p>
            </div>

            <div className="card-warm bg-beige-50 border border-beige-300 p-6 space-y-4">
              <h3 className="text-sm font-serif font-bold text-coffee-950">
                Core Safety &amp; Dietary Guarantees:
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                <div className="p-2.5 bg-white rounded-xl border border-beige-200">
                  <strong className="block text-coffee-900 font-semibold">1. Allergen Shield</strong>
                  <span className="text-coffee-600">Cross-contact &amp; synonym detection</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-beige-200">
                  <strong className="block text-coffee-900 font-semibold">2. Sugar &amp; Salt Budgets</strong>
                  <span className="text-coffee-600">Exact % of daily limits shown</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-beige-200">
                  <strong className="block text-coffee-900 font-semibold">3. Diet Classification</strong>
                  <span className="text-coffee-600">FSSAI Green/Brown dot, Jain rules</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-beige-200">
                  <strong className="block text-coffee-900 font-semibold">4. 100% Private</strong>
                  <span className="text-coffee-600">Local-first data minimization</span>
                </div>
              </div>
              <div className="pt-2 text-center">
                <Link href="/about" className="text-xs text-pencil-sage-700 font-bold hover:underline">
                  Learn more about our standards and methodology →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE FAQ SECTION */}
      <section className="py-16 sm:py-24 bg-beige-50 border-b border-beige-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <div className="badge-pencil-blue">Got Questions?</div>
            <h2 className="text-3xl font-serif font-bold text-coffee-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              Everything you need to know about NutriAgent's data sources, safety boundaries, and assessment methodology.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="card-warm bg-white border border-beige-200 rounded-2xl overflow-hidden p-0"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-coffee-950 hover:bg-beige-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-coffee-600 shrink-0 transition-transform ${
                      openFaqIndex === idx ? 'rotate-180 text-coffee-950' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-coffee-700 leading-relaxed border-t border-beige-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-16 sm:py-20 bg-coffee-900 text-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#FAF7F2]">
            Ready to decode your groceries?
          </h2>
          <p className="text-xs sm:text-sm text-coffee-200 max-w-xl mx-auto leading-relaxed">
            Start scanning barcodes or set your customized dietary preferences today. Take control of what goes on your plate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/scan"
              className="btn-pencil-sage text-xs py-3 px-6 font-bold shadow-warm"
            >
              <Barcode className="w-4 h-4" />
              <span>Scan a Product Now</span>
            </Link>
            <Link
              href="/onboarding"
              className="btn-pencil-peach text-xs py-3 px-6 font-bold"
            >
              <span>Setup Nutrition Profile</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
