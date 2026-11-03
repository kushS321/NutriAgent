'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Scale,
  Apple,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { COMMON_FOOD_ADDITIVES } from '@/lib/assessment/allergenDict';

interface NutrientTopic {
  id: string;
  category: 'macronutrient' | 'micronutrient' | 'label_reading' | 'additives';
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  explanation: string;
  whyItMatters: string;
  guidelineReference: string;
  example: string;
}

const TOPICS: NutrientTopic[] = [
  {
    id: 'calories-energy',
    category: 'macronutrient',
    title: 'Calories & Energy (kcal)',
    subtitle: 'The fundamental fuel measurement for human metabolism',
    badge: 'Baseline Energy',
    color: 'border-pencil-yellow-300 bg-pencil-yellow-50',
    explanation:
      'A calorie (or kilocalorie, kcal) is a measure of energy released when your body digests food. 1g Carbohydrate = 4 kcal, 1g Protein = 4 kcal, and 1g Fat = 9 kcal.',
    whyItMatters:
      'Energy requirements vary by age, sex, and activity level. ICMR-NIN 2024 sets the reference daily intake for moderate-activity Indian adults at approximately 2,000–2,200 kcal.',
    guidelineReference: 'ICMR-NIN Dietary Guidelines for Indians (2024), Guideline 1',
    example:
      'A 100g serving of biscuits may pack 480 kcal (nearly 25% of an entire day’s caloric needs) in a single quick snack.',
  },
  {
    id: 'protein',
    category: 'macronutrient',
    title: 'Protein & Amino Acids',
    subtitle: 'Essential building blocks for muscle tissue, enzymes, and immunity',
    badge: 'Muscle & Repair',
    color: 'border-pencil-sage-300 bg-pencil-sage-50',
    explanation:
      'Proteins are chains of amino acids needed for cellular repair, antibody synthesis, and muscle maintenance. Complete proteins supply all 9 essential amino acids.',
    whyItMatters:
      'ICMR-NIN recommends 0.83 grams of protein per kilogram of body weight per day (approx. 54g for a 65kg adult). Combining cereals with pulses ensures complete protein in vegetarian diets.',
    guidelineReference: 'ICMR-NIN 2024, Guideline 2: Ensure Adequate Protein from Diverse Sources',
    example:
      'Greek yogurt supplies ~8g protein per 100g, while standard white bread provides only ~2g per slice.',
  },
  {
    id: 'total-vs-added-sugar',
    category: 'macronutrient',
    title: 'Total Sugars vs Added Sugars',
    subtitle: 'Distinguishing naturally occurring fruit/milk sugars from refined sweeteners',
    badge: 'Sugar Literacy',
    color: 'border-pencil-peach-300 bg-pencil-peach-50',
    explanation:
      'Total sugars include naturally present sugars (lactose in milk, fructose in fruit) plus added refined sugars (sucrose, corn syrup, invert syrup, maltodextrin). Added sugars offer empty calories with zero micronutrients.',
    whyItMatters:
      'ICMR-NIN 2024 Guideline 3 strictly caps added sugars to <25g/day (<5% of daily energy). Excessive added sugar is directly tied to fatty liver, insulin resistance, and visceral adiposity.',
    guidelineReference: 'ICMR-NIN 2024, Guideline 3: Restrict Added Sugars',
    example:
      'Plain milk contains ~4.5g natural lactose per 100ml. Chocolate milk can contain 12g sugar (7.5g added refined sugar per 100ml).',
  },
  {
    id: 'dietary-fiber',
    category: 'macronutrient',
    title: 'Dietary Fibre & Gut Health',
    subtitle: 'Indigestible carbohydrates that nourish gut microbiome and stabilize blood glucose',
    badge: 'Digestive Health',
    color: 'border-pencil-sage-300 bg-pencil-sage-50',
    explanation:
      'Dietary fiber comprises soluble fiber (which dissolves in water to form a gel, lowering cholesterol) and insoluble fiber (which adds bulk and aids intestinal transit).',
    whyItMatters:
      'ICMR-NIN recommends a minimum of 30g dietary fiber per day. High-fiber foods blunt post-meal blood glucose spikes and feed beneficial short-chain fatty acid-producing gut bacteria.',
    guidelineReference: 'ICMR-NIN 2024, Guideline 7: Favor Whole Grains and Millets',
    example:
      'Whole rolled oats provide 10g fiber per 100g; refined maida provides under 2.5g fiber per 100g.',
  },
  {
    id: 'saturated-and-trans-fat',
    category: 'macronutrient',
    title: 'Saturated Fat & Industrial Trans Fat',
    subtitle: 'Understanding lipid quality and cardiovascular risk markers',
    badge: 'Heart Health',
    color: 'border-pencil-terracotta-300 bg-pencil-terracotta-50',
    explanation:
      'Saturated fats (solid at room temperature; common in butter, ghee, and palm oil) should be kept under 10% of total energy. Trans fats (partially hydrogenated vegetable oils) are artificially altered fats that elevate LDL and decrease HDL.',
    whyItMatters:
      'FSSAI limits industrial trans fats to <=2% of total fat in all edible fats and oils. ICMR-NIN advises limiting visible fat to 20–30g daily and avoiding repeated reheating of cooking oils.',
    guidelineReference: 'FSSAI Labelling Regulations (2022) & ICMR-NIN 2024 Guideline 4',
    example:
      'Bakery shortening and commercial puff pastries frequently contain palm oil and hydrogenated fats rich in saturated fatty acids.',
  },
  {
    id: 'sodium-vs-salt',
    category: 'micronutrient',
    title: 'Sodium vs Common Salt',
    subtitle: 'The vital electrolyte conversion that protects blood pressure and kidney function',
    badge: 'Hypertension Defense',
    color: 'border-pencil-blue-300 bg-pencil-blue-50',
    explanation:
      'Salt is sodium chloride (NaCl), composed of roughly 40% sodium and 60% chloride. To convert sodium into salt: Salt (g) = Sodium (g) × 2.5.',
    whyItMatters:
      'WHO and ICMR-NIN recommend consuming less than 5g of salt per day (under 2,000 mg of sodium). One teaspoon of salt contains ~2,300 mg of sodium.',
    guidelineReference: 'WHO Sodium Guidelines (2023) & ICMR-NIN 2024 Guideline 5',
    example:
      'A single packet of instant noodles often contains 1,100 mg sodium—over 55% of your recommended salt budget for the entire day.',
  },
  {
    id: 'serving-vs-package',
    category: 'label_reading',
    title: 'Serving Size vs Package Size',
    subtitle: 'The primary cause of portion distortion in packaged snacks',
    badge: 'Label Reading',
    color: 'border-pencil-peach-300 bg-pencil-peach-50',
    explanation:
      'The "Nutrition Facts" column is almost always calculated per single serving, not for the entire package. A single 100g bag of chips might declare a serving size of 25g (meaning the entire bag contains 4 servings).',
    whyItMatters:
      'If you consume the whole bag, you must multiply all calories, sugar, fat, and sodium numbers by 4.',
    guidelineReference: 'FSSAI Schedule II & FDA 21 CFR § 101.9',
    example:
      'A soft drink bottle may list 45 kcal per 100ml. If the bottle is 500ml, drinking it gives you 225 kcal and over 50g of sugar.',
  },
  {
    id: 'per-100g-comparison',
    category: 'label_reading',
    title: 'Per 100g vs Per Serving: How to Compare Products',
    subtitle: 'The golden rule for fair side-by-side food comparison',
    badge: 'Smart Shopping',
    color: 'border-pencil-blue-300 bg-pencil-blue-50',
    explanation:
      'Because manufacturers choose arbitrary serving sizes, never compare two brands by their per-serving column. Always normalize to "Per 100g" or "Per 100ml" to see the true nutrient density.',
    whyItMatters:
      'A breakfast cereal brand claiming "Only 3g sugar per serving" might just be using a miniature 20g serving size, while a competitor with "6g sugar per serving" is declaring a realistic 40g serving.',
    guidelineReference: 'NutriAgent Comparative Methodology Standard',
    example:
      'Normalized to 100g, both cereals have 15g sugar/100g. Normalization eliminates misleading packaging claims.',
  },
];

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredTopics = TOPICS.filter((topic) => {
    const matchesCategory = activeCategory === 'all' || topic.category === activeCategory;
    const matchesSearch =
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-beige-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5 text-[#275A3A]" />
          <span>Food Literacy & Consumer Education</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
          Nutrition Knowledge & Ingredient Explainer
        </h1>
        <p className="text-xs sm:text-sm text-coffee-600 mt-1">
          Plain-language explanations of packaged-food ingredients, chemical additives, and regulatory guidelines from ICMR-NIN and FSSAI.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-coffee-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nutrients or additives (e.g. sugar, sodium, MSG, fiber)..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 shadow-subtle"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'macronutrient', label: 'Macros' },
            { id: 'micronutrient', label: 'Micronutrients' },
            { id: 'label_reading', label: 'Label Reading' },
            { id: 'additives', label: 'INS Additives' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-coffee-800 text-[#FAF7F2]'
                  : 'bg-white text-coffee-700 border border-beige-300 hover:bg-beige-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      {activeCategory !== 'additives' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`card-warm bg-white border ${topic.color.split(' ')[0]} p-5 space-y-3.5 shadow-warm hover:shadow-card transition-shadow`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-beige-100 text-coffee-700 border border-beige-200">
                    {topic.badge}
                  </span>
                  <h3 className="text-base font-serif font-bold text-coffee-950 mt-1.5">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-coffee-600 font-medium">{topic.subtitle}</p>
                </div>
              </div>

              <p className="text-xs text-coffee-800 leading-relaxed">{topic.explanation}</p>

              <div className="bg-beige-50 rounded-xl p-3 border border-beige-200/90 text-xs space-y-1.5">
                <div className="text-coffee-900 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-pencil-sage-600" />
                  <span>Why It Matters for Health:</span>
                </div>
                <p className="text-coffee-700 leading-relaxed">{topic.whyItMatters}</p>
              </div>

              <div className="text-xs text-coffee-700 bg-white rounded-xl p-3 border border-beige-200">
                <span className="font-semibold block text-coffee-900 mb-0.5">Practical Example:</span>
                <span className="text-coffee-600">{topic.example}</span>
              </div>

              <div className="pt-1 text-[11px] text-coffee-500 flex items-center justify-between border-t border-beige-100">
                <span>{topic.guidelineReference}</span>
                <Link
                  href="/assistant"
                  className="text-pencil-terracotta-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Ask Assistant</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dedicated INS Food Additives Decoder Section */}
      {(activeCategory === 'all' || activeCategory === 'additives') && (
        <div className="card-warm bg-white border border-beige-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-beige-200 pb-3">
            <Sparkles className="w-5 h-5 text-pencil-sage-600" />
            <div>
              <h2 className="text-lg font-serif font-bold text-coffee-950">
                Common Food Additives (INS Numbers Decoded)
              </h2>
              <p className="text-xs text-coffee-600">
                The International Numbering System (INS) is used by FSSAI and CODEX to declare approved food additives.
              </p>
            </div>
          </div>

          <div className="divide-y divide-beige-100">
            {Object.values(COMMON_FOOD_ADDITIVES).map((add) => (
              <div key={add.code} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF0AE] text-[#715707] font-bold text-xs border border-[#F5E47E]">
                      {add.code}
                    </span>
                    <span className="text-sm font-semibold text-coffee-900">{add.name}</span>
                    <span className="text-[10px] uppercase font-bold text-coffee-500 bg-beige-100 px-2 py-0.5 rounded-full">
                      {add.origin}
                    </span>
                  </div>
                  <div className="text-xs text-coffee-700">
                    <strong>Function:</strong> {add.purpose}
                  </div>
                  <p className="text-xs text-coffee-600 leading-relaxed">{add.note}</p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] text-pencil-sage-700 bg-[#E4F1E9] px-2.5 py-1 rounded-full font-medium border border-[#A7D1B7]">
                    FSSAI Regulated
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Label Reading Guide Card */}
      <div className="card-warm bg-[#FAF8F5] border border-beige-300 p-6 space-y-4">
        <h3 className="text-lg font-serif font-bold text-coffee-950">
          The 4-Step Rule for Reading Packaged Food Labels in India
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-beige-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-coffee-800 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <strong className="block text-coffee-900 pt-1">Check Green/Brown Dot</strong>
            <p className="text-coffee-600">
              Verify the mandatory FSSAI symbol on the front or back display panel.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-beige-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-coffee-800 text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <strong className="block text-coffee-900 pt-1">Scan First 3 Ingredients</strong>
            <p className="text-coffee-600">
              Ingredients are listed by descending weight. If sugar or palm oil is in top 3, it is heavily processed.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-beige-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-coffee-800 text-white flex items-center justify-center font-bold text-xs">
              3
            </span>
            <strong className="block text-coffee-900 pt-1">Look at Serving Size</strong>
            <p className="text-coffee-600">
              Check how many servings are in the box so you do not underestimate sodium or sugars.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-beige-200 space-y-1">
            <span className="w-6 h-6 rounded-full bg-coffee-800 text-white flex items-center justify-center font-bold text-xs">
              4
            </span>
            <strong className="block text-coffee-900 pt-1">Run "Can I Eat This?"</strong>
            <p className="text-coffee-600">
              Scan barcode or upload label to NutriAgent for personalized allergen and health cross-checks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

