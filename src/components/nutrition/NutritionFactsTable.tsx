'use client';

import React, { useState } from 'react';
import { NutritionData } from '@/types/nutrition';
import { STANDARD_DAILY_VALUES } from '@/lib/assessment/rulesEngine';

interface NutritionFactsTableProps {
  nutrition: NutritionData;
  nutritionPer100g?: NutritionData;
  productName?: string;
}

export default function NutritionFactsTable({
  nutrition,
  nutritionPer100g,
  productName,
}: NutritionFactsTableProps) {
  const [activeBasis, setActiveBasis] = useState<'per_serving' | 'per_100g'>('per_serving');

  const current = activeBasis === 'per_100g' && nutritionPer100g ? nutritionPer100g : nutrition;

  const calcDV = (val: number | undefined, max: number): number | null => {
    if (val === undefined || val === null) return null;
    return Math.round((val / max) * 100);
  };

  const getDvColor = (
    percent: number | null,
    type: 'positive' | 'limit' = 'limit'
  ): { bg: string; text: string; label: string } => {
    if (percent === null) return { bg: 'bg-beige-100', text: 'text-coffee-400', label: '-' };
    if (type === 'limit') {
      if (percent >= 20) return { bg: 'bg-[#FCE6DF] border-[#F1A593]', text: 'text-[#A8442A]', label: 'High (≥20%)' };
      if (percent <= 5) return { bg: 'bg-[#E4F1E9] border-[#A7D1B7]', text: 'text-[#275A3A]', label: 'Low (≤5%)' };
      return { bg: 'bg-beige-100 border-beige-300', text: 'text-coffee-800', label: 'Moderate' };
    } else {
      if (percent >= 20) return { bg: 'bg-[#E4F1E9] border-[#A7D1B7]', text: 'text-[#275A3A]', label: 'High (Good)' };
      if (percent <= 5) return { bg: 'bg-beige-100 border-beige-200', text: 'text-coffee-500', label: 'Low' };
      return { bg: 'bg-[#E4F1E9]/60 border-[#A7D1B7]/60', text: 'text-[#275A3A]', label: 'Moderate' };
    }
  };

  const fatDv = calcDV(current.totalFatG, STANDARD_DAILY_VALUES.totalFatG);
  const satFatDv = calcDV(current.saturatedFatG, STANDARD_DAILY_VALUES.saturatedFatG);
  const sodiumDv = calcDV(current.sodiumMg, STANDARD_DAILY_VALUES.sodiumMg);
  const carbDv = calcDV(current.totalCarbohydratesG, STANDARD_DAILY_VALUES.totalCarbohydratesG);
  const fiberDv = calcDV(current.dietaryFiberG, STANDARD_DAILY_VALUES.dietaryFiberG);
  const addedSugarDv = calcDV(current.addedSugarsG, STANDARD_DAILY_VALUES.addedSugarsG);

  return (
    <div className="bg-white border-2 border-coffee-950 rounded-2xl p-5 font-sans max-w-md w-full shadow-card text-coffee-950 space-y-2">
      {/* Basis Switcher Toggle if both per-serving and per-100g are available */}
      {nutritionPer100g && (
        <div className="flex justify-center mb-3">
          <div className="bg-beige-100 p-1 rounded-xl inline-flex gap-1 border border-beige-300">
            <button
              type="button"
              onClick={() => setActiveBasis('per_serving')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeBasis === 'per_serving'
                  ? 'bg-coffee-950 text-white shadow-subtle'
                  : 'text-coffee-700 hover:text-coffee-950'
              }`}
            >
              Per Serving ({nutrition.servingSize || 'Standard'})
            </button>
            <button
              type="button"
              onClick={() => setActiveBasis('per_100g')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeBasis === 'per_100g'
                  ? 'bg-coffee-950 text-white shadow-subtle'
                  : 'text-coffee-700 hover:text-coffee-950'
              }`}
            >
              Per 100g / 100ml
            </button>
          </div>
        </div>
      )}

      <div className="border-b-8 border-coffee-950 pb-1 mb-2">
        <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Nutrition Facts</h3>
        {productName && <p className="text-xs text-coffee-600 mt-1 truncate">{productName}</p>}
      </div>

      <div className="flex justify-between items-baseline border-b border-coffee-950 pb-1 text-sm font-semibold">
        <span>Serving size</span>
        <span>{current.servingSize || '1 serving'}</span>
      </div>

      <div className="border-b-4 border-coffee-950 py-2 flex justify-between items-end">
        <div>
          <span className="text-xs font-bold block uppercase tracking-wider text-coffee-600">
            Amount {activeBasis === 'per_100g' ? 'per 100g' : 'per serving'}
          </span>
          <span className="text-3xl font-extrabold tracking-tight">Calories</span>
        </div>
        <span className="text-4xl font-black">{current.calories ?? '--'}</span>
      </div>

      <div className="text-right text-xs font-bold border-b border-coffee-950 py-1 text-coffee-700">
        % Daily Value* (ICMR-NIN & WHO)
      </div>

      {/* Total Fat */}
      <div className="border-b border-beige-200 py-1.5 flex justify-between text-sm">
        <span>
          <strong className="font-bold">Total Fat</strong>{' '}
          {current.totalFatG !== undefined ? `${current.totalFatG}g` : '--'}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-bold border ${getDvColor(fatDv, 'limit').bg} ${
            getDvColor(fatDv, 'limit').text
          }`}
        >
          {fatDv !== null ? `${fatDv}%` : '--'}
        </span>
      </div>

      {/* Saturated Fat */}
      <div className="border-b border-beige-200 py-1 pl-4 flex justify-between text-sm">
        <span>
          Saturated Fat {current.saturatedFatG !== undefined ? `${current.saturatedFatG}g` : '--'}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-bold border ${getDvColor(satFatDv, 'limit').bg} ${
            getDvColor(satFatDv, 'limit').text
          }`}
        >
          {satFatDv !== null ? `${satFatDv}%` : '--'}
        </span>
      </div>

      {/* Trans Fat */}
      <div className="border-b border-beige-200 py-1 pl-4 flex justify-between text-sm">
        <span>
          <em>Trans</em> Fat {current.transFatG !== undefined ? `${current.transFatG}g` : '0g'}
        </span>
        <span className="text-xs text-coffee-400">FSSAI &le; 2%</span>
      </div>

      {/* Cholesterol */}
      <div className="border-b border-beige-200 py-1.5 flex justify-between text-sm">
        <span>
          <strong className="font-bold">Cholesterol</strong>{' '}
          {current.cholesterolMg !== undefined ? `${current.cholesterolMg}mg` : '0mg'}
        </span>
        <span className="text-xs font-bold">
          {calcDV(current.cholesterolMg, STANDARD_DAILY_VALUES.cholesterolMg) !== null
            ? `${calcDV(current.cholesterolMg, STANDARD_DAILY_VALUES.cholesterolMg)}%`
            : '0%'}
        </span>
      </div>

      {/* Sodium */}
      <div className="border-b border-beige-200 py-1.5 flex justify-between text-sm">
        <span>
          <strong className="font-bold">Sodium</strong>{' '}
          {current.sodiumMg !== undefined ? `${current.sodiumMg}mg` : '--'}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-bold border ${getDvColor(sodiumDv, 'limit').bg} ${
            getDvColor(sodiumDv, 'limit').text
          }`}
        >
          {sodiumDv !== null ? `${sodiumDv}%` : '--'}
        </span>
      </div>

      {/* Total Carbohydrates */}
      <div className="border-b border-beige-200 py-1.5 flex justify-between text-sm">
        <span>
          <strong className="font-bold">Total Carbohydrate</strong>{' '}
          {current.totalCarbohydratesG !== undefined ? `${current.totalCarbohydratesG}g` : '--'}
        </span>
        <span className="text-xs font-bold text-coffee-700">
          {carbDv !== null ? `${carbDv}%` : '--'}
        </span>
      </div>

      {/* Dietary Fiber */}
      <div className="border-b border-beige-200 py-1 pl-4 flex justify-between text-sm">
        <span>
          Dietary Fiber {current.dietaryFiberG !== undefined ? `${current.dietaryFiberG}g` : '--'}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-bold border ${
            getDvColor(fiberDv, 'positive').bg
          } ${getDvColor(fiberDv, 'positive').text}`}
        >
          {fiberDv !== null ? `${fiberDv}%` : '--'}
        </span>
      </div>

      {/* Total Sugars */}
      <div className="border-b border-beige-200 py-1 pl-4 flex justify-between text-sm">
        <span>
          Total Sugars {current.totalSugarsG !== undefined ? `${current.totalSugarsG}g` : '--'}
        </span>
      </div>

      {/* Added Sugars */}
      <div className="border-b border-beige-200 py-1 pl-8 flex justify-between text-sm">
        <span>
          Includes {current.addedSugarsG !== undefined ? `${current.addedSugarsG}g` : '--'} Added
          Sugars
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-bold border ${
            getDvColor(addedSugarDv, 'limit').bg
          } ${getDvColor(addedSugarDv, 'limit').text}`}
        >
          {addedSugarDv !== null ? `${addedSugarDv}%` : '--'}
        </span>
      </div>

      {/* Protein */}
      <div className="border-b-4 border-coffee-950 py-1.5 flex justify-between text-sm">
        <span>
          <strong className="font-bold">Protein</strong>{' '}
          {current.proteinG !== undefined ? `${current.proteinG}g` : '--'}
        </span>
        <span className="text-xs font-bold text-pencil-sage-700">
          {calcDV(current.proteinG, STANDARD_DAILY_VALUES.proteinG) !== null
            ? `${calcDV(current.proteinG, STANDARD_DAILY_VALUES.proteinG)}%`
            : '--'}
        </span>
      </div>

      {/* Micronutrients */}
      <div className="text-[11px] text-coffee-600 pt-1 space-y-0.5">
        <p>* The % Daily Value (DV) tells you how much a nutrient in a serving contributes to a daily diet of 2,000 calories, referencing ICMR-NIN 2024 and WHO benchmarks.</p>
      </div>
    </div>
  );
}
