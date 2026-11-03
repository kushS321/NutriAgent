'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Edit3,
  HelpCircle,
  ShieldCheck,
  Scale,
  FileText,
  Eye,
  Info,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { AssessmentEngine } from '@/lib/assessment/rulesEngine';
import { ExtractedProduct, ServingBasis } from '@/types/nutrition';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';

export default function ProductReviewPage() {
  const router = useRouter();
  const [product, setProduct] = useState<ExtractedProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);

  // Editable local state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingBasis, setServingBasis] = useState<ServingBasis>('per_serving');
  const [calories, setCalories] = useState<string>('');
  const [sodiumMg, setSodiumMg] = useState<string>('');
  const [totalCarbsG, setTotalCarbsG] = useState<string>('');
  const [dietaryFiberG, setDietaryFiberG] = useState<string>('');
  const [totalSugarsG, setTotalSugarsG] = useState<string>('');
  const [addedSugarsG, setAddedSugarsG] = useState<string>('');
  const [totalFatG, setTotalFatG] = useState<string>('');
  const [saturatedFatG, setSaturatedFatG] = useState<string>('');
  const [transFatG, setTransFatG] = useState<string>('');
  const [proteinG, setProteinG] = useState<string>('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [allergenWarningText, setAllergenWarningText] = useState('');

  useEffect(() => {
    let active = UserRepository.getActiveProduct();
    if (!active) {
      active = SAMPLE_PRODUCTS[0];
      UserRepository.setActiveProduct(active);
    }
    setProduct(active);
    setName(active.name || '');
    setBrand(active.brand || '');
    setServingSize(active.nutrition.servingSize || '1 serving (40g)');
    setServingBasis(active.nutrition.servingBasis || 'per_serving');
    setCalories(active.nutrition.calories !== undefined ? String(active.nutrition.calories) : '');
    setSodiumMg(active.nutrition.sodiumMg !== undefined ? String(active.nutrition.sodiumMg) : '');
    setTotalCarbsG(
      active.nutrition.totalCarbohydratesG !== undefined
        ? String(active.nutrition.totalCarbohydratesG)
        : ''
    );
    setDietaryFiberG(
      active.nutrition.dietaryFiberG !== undefined ? String(active.nutrition.dietaryFiberG) : ''
    );
    setTotalSugarsG(
      active.nutrition.totalSugarsG !== undefined ? String(active.nutrition.totalSugarsG) : ''
    );
    setAddedSugarsG(
      active.nutrition.addedSugarsG !== undefined ? String(active.nutrition.addedSugarsG) : ''
    );
    setTotalFatG(active.nutrition.totalFatG !== undefined ? String(active.nutrition.totalFatG) : '');
    setSaturatedFatG(
      active.nutrition.saturatedFatG !== undefined ? String(active.nutrition.saturatedFatG) : ''
    );
    setTransFatG(
      active.nutrition.transFatG !== undefined ? String(active.nutrition.transFatG) : ''
    );
    setProteinG(active.nutrition.proteinG !== undefined ? String(active.nutrition.proteinG) : '');
    setIngredientsText(active.ingredientsText || '');
    setAllergenWarningText(active.allergenWarningText || '');
  }, []);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-coffee-500">Loading extracted label information...</p>
      </div>
    );
  }

  const handleConfirmAndAssess = async () => {
    setIsSubmitting(true);
    const profile = UserRepository.getProfile();

    const verifiedProduct: ExtractedProduct = {
      ...product,
      name: name.trim() || 'Food Product',
      brand: brand.trim() || undefined,
      ingredientsText: ingredientsText.trim(),
      parsedIngredients: ingredientsText
        .split(/[,;]/)
        .map((i) => i.trim())
        .filter(Boolean),
      allergenWarningText: allergenWarningText.trim() || undefined,
      nutrition: {
        ...product.nutrition,
        servingSize: servingSize.trim() || '1 serving',
        servingBasis,
        calories: calories !== '' ? parseFloat(calories) : undefined,
        sodiumMg: sodiumMg !== '' ? parseFloat(sodiumMg) : undefined,
        totalCarbohydratesG: totalCarbsG !== '' ? parseFloat(totalCarbsG) : undefined,
        dietaryFiberG: dietaryFiberG !== '' ? parseFloat(dietaryFiberG) : undefined,
        totalSugarsG: totalSugarsG !== '' ? parseFloat(totalSugarsG) : undefined,
        addedSugarsG: addedSugarsG !== '' ? parseFloat(addedSugarsG) : undefined,
        totalFatG: totalFatG !== '' ? parseFloat(totalFatG) : undefined,
        saturatedFatG: saturatedFatG !== '' ? parseFloat(saturatedFatG) : undefined,
        transFatG: transFatG !== '' ? parseFloat(transFatG) : undefined,
        proteinG: proteinG !== '' ? parseFloat(proteinG) : undefined,
      },
      ocrConfidence: 100, // User verified
      uncertainFields: [],
      provenance: 'user_manual',
    };

    const assessment = AssessmentEngine.assess(verifiedProduct, profile);

    UserRepository.setActiveProduct(verifiedProduct);
    UserRepository.setActiveAssessment(assessment);
    UserRepository.saveAssessment(assessment);

    router.push(`/results/${verifiedProduct.id}`);
  };

  const hasMissingIngredients = !ingredientsText.trim();
  const hasUncertainties = product.uncertainFields && product.uncertainFields.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="border-b border-beige-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] text-xs font-semibold mb-2">
          <Edit3 className="w-3.5 h-3.5 text-[#254F75]" />
          <span>OCR Verification & Review Step</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
          Review & Confirm Extracted Food Data
        </h1>
        <p className="text-xs sm:text-sm text-coffee-600 mt-1">
          OCR text is an automated extraction, not a verified fact. Please inspect numbers and ingredients below before generating your personalized assessment.
        </p>
      </div>

      {/* Uncertainty Notice */}
      {hasUncertainties && (
        <div className="bg-[#FFF6F2] border border-[#FCD0C0] rounded-2xl p-4 flex items-start gap-3 text-xs text-coffee-900 shadow-subtle">
          <AlertTriangle className="w-5 h-5 text-pencil-peach-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-semibold block text-pencil-peach-900">
              Low Confidence Fields Detected
            </strong>
            <p>
              The OCR scanner flagged uncertainties in:{' '}
              <span className="font-semibold text-coffee-950">
                {product.uncertainFields.join(', ')}
              </span>
              . Please review the highlighted values below.
            </p>
          </div>
        </div>
      )}

      {hasMissingIngredients && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-900 shadow-subtle">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block">Missing Ingredients List</strong>
            <p>
              Without an ingredient statement, NutriAgent cannot verify allergens or dietary restrictions and will mark the product as "Insufficient Information". Please paste or type the ingredients below.
            </p>
          </div>
        </div>
      )}

      {/* Main Review Form */}
      <div className="card-warm bg-white border border-beige-200 p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-coffee-800 block mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 font-medium text-coffee-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-800 block mb-1">Brand Name</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nestlé, Amul, Britannia"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
            />
          </div>
        </div>

        {/* Serving Size & Basis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-beige-100">
          <div>
            <label className="text-xs font-semibold text-coffee-800 block mb-1">
              Declared Serving Size
            </label>
            <input
              type="text"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              placeholder="e.g. 2 bars (42g) or 1 pack (70g)"
              className="w-full px-3.5 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl text-coffee-950"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-coffee-800 block mb-1">
              Nutrition Value Basis
            </label>
            <select
              value={servingBasis}
              onChange={(e) => setServingBasis(e.target.value as ServingBasis)}
              className="w-full px-3.5 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl text-coffee-950"
            >
              <option value="per_serving">Per Serving (as stated on package)</option>
              <option value="per_100g">Per 100g (Standard Metric)</option>
              <option value="per_100ml">Per 100ml (Liquid/Beverage)</option>
            </select>
          </div>
        </div>

        {/* Nutrition Values Matrix */}
        <div className="pt-2 border-t border-beige-100 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold text-coffee-900 uppercase tracking-wider">
              Nutrition Facts Table ({servingBasis.replace('_', ' ')})
            </h3>
            <span className="text-[11px] text-coffee-500">Do not guess missing values</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g. 190"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Sodium (mg)
              </label>
              <input
                type="number"
                value={sodiumMg}
                onChange={(e) => setSodiumMg(e.target.value)}
                placeholder="e.g. 140"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Total Carbs (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalCarbsG}
                onChange={(e) => setTotalCarbsG(e.target.value)}
                placeholder="e.g. 29"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Dietary Fiber (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={dietaryFiberG}
                onChange={(e) => setDietaryFiberG(e.target.value)}
                placeholder="e.g. 2"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Total Sugars (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalSugarsG}
                onChange={(e) => setTotalSugarsG(e.target.value)}
                placeholder="e.g. 12"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Added Sugars (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={addedSugarsG}
                onChange={(e) => setAddedSugarsG(e.target.value)}
                placeholder="e.g. 11"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Total Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={totalFatG}
                onChange={(e) => setTotalFatG(e.target.value)}
                placeholder="e.g. 7"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Saturated Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={saturatedFatG}
                onChange={(e) => setSaturatedFatG(e.target.value)}
                placeholder="e.g. 1"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Trans Fat (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={transFatG}
                onChange={(e) => setTransFatG(e.target.value)}
                placeholder="e.g. 0"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-coffee-700 block mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                step="0.1"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                placeholder="e.g. 3"
                className="w-full px-3 py-1.5 text-xs bg-beige-50 border border-beige-300 rounded-xl font-mono text-coffee-950"
              />
            </div>
          </div>
        </div>

        {/* Ingredients Textarea */}
        <div className="pt-2 border-t border-beige-100 space-y-2">
          <label className="text-xs font-semibold text-coffee-800 block">
            Extracted Ingredient List *
          </label>
          <textarea
            rows={4}
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="Whole Grain Oats, Sugar, Canola Oil, Rice Flour, Honey, Salt, Soy Lecithin..."
            className="w-full p-3 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 font-mono text-coffee-950 leading-relaxed"
          />
        </div>

        {/* Allergen Warning Text */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-coffee-800 block">
            Allergen & Cross-Contact Advisory
          </label>
          <input
            type="text"
            value={allergenWarningText}
            onChange={(e) => setAllergenWarningText(e.target.value)}
            placeholder="e.g. Contains Soy. May contain peanut, almond and pecan ingredients."
            className="w-full px-3.5 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl text-coffee-950"
          />
        </div>

        {/* Original Raw OCR Drawer Toggle */}
        <div className="pt-2 border-t border-beige-100">
          <button
            type="button"
            onClick={() => setShowRawOcr(!showRawOcr)}
            className="text-xs text-pencil-blue-700 hover:underline flex items-center gap-1.5 font-medium"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showRawOcr ? 'Hide Raw OCR Text' : 'View Original Extracted Raw OCR Text'}</span>
          </button>

          {showRawOcr && (
            <div className="mt-2 p-3 bg-beige-100 rounded-xl border border-beige-200 text-[11px] font-mono text-coffee-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {product.ingredientsText || 'No raw OCR text available.'}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-beige-200">
          <Link href="/scan" className="btn-pencil-peach text-xs py-2.5 px-5 w-full sm:w-auto">
            Discard & Rescan
          </Link>

          <button
            onClick={handleConfirmAndAssess}
            disabled={isSubmitting}
            className="btn-pencil-brown text-xs py-2.5 px-6 font-bold w-full sm:w-auto shadow-warm disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Evaluating Guidelines...' : 'Confirm Values & Run "Can I Eat This?"'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
