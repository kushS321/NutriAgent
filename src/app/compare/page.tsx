'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Columns,
  Scale,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';
import { ComparisonEngine } from '@/lib/assessment/comparisonEngine';
import { ExtractedProduct, ProductComparison } from '@/types/nutrition';
import { UserRepository } from '@/lib/storage/userRepository';
import StatusBadge from '@/components/nutrition/StatusBadge';

function ProductCompareContent() {
  const searchParams = useSearchParams();
  const primaryId = searchParams?.get('primary');

  const [availableProducts, setAvailableProducts] = useState<ExtractedProduct[]>(SAMPLE_PRODUCTS);
  const [productAId, setProductAId] = useState<string>(primaryId || SAMPLE_PRODUCTS[0].id);
  const [productBId, setProductBId] = useState<string>(SAMPLE_PRODUCTS[1].id);
  const [servingBasis, setServingBasis] = useState<'per_serving' | 'per_100g'>('per_100g');
  const [comparison, setComparison] = useState<ProductComparison | null>(null);

  useEffect(() => {
    const history = UserRepository.getHistory();
    const active = UserRepository.getActiveProduct();

    const merged = [...SAMPLE_PRODUCTS];
    if (active && !merged.some((m) => m.id === active.id)) {
      merged.unshift(active);
    }
    setAvailableProducts(merged);

    if (primaryId && merged.some((p) => p.id === primaryId)) {
      setProductAId(primaryId);
      const other = merged.find((p) => p.id !== primaryId);
      if (other) setProductBId(other.id);
    }
  }, [primaryId]);

  useEffect(() => {
    const prodA = availableProducts.find((p) => p.id === productAId);
    const prodB = availableProducts.find((p) => p.id === productBId);

    if (prodA && prodB) {
      const result = ComparisonEngine.compare(prodA, prodB, servingBasis);
      setComparison(result);
      UserRepository.saveComparison(result);
    }
  }, [productAId, productBId, servingBasis, availableProducts]);

  const prodA = availableProducts.find((p) => p.id === productAId);
  const prodB = availableProducts.find((p) => p.id === productBId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0AE] text-[#715707] border border-[#F5E47E] text-xs font-semibold">
          <Columns className="w-3.5 h-3.5 text-[#715707]" />
          <span>Product Comparison Engine</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-coffee-950 tracking-tight">
          Compare Two Foods Side-by-Side
        </h1>
        <p className="text-xs sm:text-sm text-coffee-600">
          Understand nutritional trade-offs on an apples-to-apples basis. We explain key differences without declaring one food universally &ldquo;healthiest.&rdquo;
        </p>
      </div>

      {/* Selectors & Serving Basis Controls */}
      <div className="card-warm bg-white border border-beige-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product A Selector */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-bold text-coffee-800 uppercase tracking-wider block">
              Product A (Primary)
            </label>
            <select
              value={productAId}
              onChange={(e) => setProductAId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50 focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === productBId}>
                  {p.name} {p.brand ? `(${p.brand})` : ''}
                </option>
              ))}
            </select>
            {prodA && (
              <div className="text-xs text-coffee-600 flex items-center justify-between pt-1">
                <span>Declared Serving: {prodA.nutrition.servingSize}</span>
                <StatusBadge status={comparison?.assessmentA.status || 'review_carefully'} size="sm" />
              </div>
            )}
          </div>

          {/* Product B Selector */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-bold text-coffee-800 uppercase tracking-wider block">
              Product B (Comparison Target)
            </label>
            <select
              value={productBId}
              onChange={(e) => setProductBId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50 focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
            >
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id} disabled={p.id === productAId}>
                  {p.name} {p.brand ? `(${p.brand})` : ''}
                </option>
              ))}
            </select>
            {prodB && (
              <div className="text-xs text-coffee-600 flex items-center justify-between pt-1">
                <span>Declared Serving: {prodB.nutrition.servingSize}</span>
                <StatusBadge status={comparison?.assessmentB.status || 'review_carefully'} size="sm" />
              </div>
            )}
          </div>
        </div>

        {/* Serving Basis Mode Switcher */}
        <div className="pt-4 border-t border-beige-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-coffee-600">
            <span className="font-semibold text-coffee-900">Recommended:</span> Compare on a normalized{' '}
            <strong>Per 100g</strong> basis to avoid misleading serving size differences.
          </div>

          <div className="bg-beige-100 p-1 rounded-xl inline-flex gap-1 border border-beige-300">
            <button
              onClick={() => setServingBasis('per_100g')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                servingBasis === 'per_100g'
                  ? 'bg-coffee-800 text-[#FAF7F2] shadow-subtle'
                  : 'text-coffee-700 hover:text-coffee-950'
              }`}
            >
              Normalized Per 100g
            </button>
            <button
              onClick={() => setServingBasis('per_serving')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                servingBasis === 'per_serving'
                  ? 'bg-coffee-800 text-[#FAF7F2] shadow-subtle'
                  : 'text-coffee-700 hover:text-coffee-950'
              }`}
            >
              Per Declared Serving
            </button>
          </div>
        </div>
      </div>

      {/* Trade-Off Synthesis Banner */}
      {comparison && (
        <div className="card-warm bg-[#FEFDF0] border border-[#FAF0AE] p-6 space-y-3 shadow-warm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pencil-yellow-600" />
            <h3 className="text-base font-serif font-bold text-coffee-950">
              Nutritional Trade-Off Summary ({servingBasis === 'per_100g' ? 'Per 100g Basis' : 'Per Serving'})
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-coffee-800 leading-relaxed font-sans">
            {comparison.tradeOffSummary}
          </p>
        </div>
      )}

      {/* Side-by-Side Comparison Matrix */}
      {comparison && (
        <div className="card-warm bg-white border border-beige-200 overflow-hidden p-0 shadow-warm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-beige-100 text-coffee-950 border-b border-beige-200 font-serif">
                  <th className="p-4 font-bold">Nutrient ({servingBasis === 'per_100g' ? '100g' : 'Serving'})</th>
                  <th className="p-4 font-bold max-w-[200px] truncate">{prodA?.name}</th>
                  <th className="p-4 font-bold max-w-[200px] truncate">{prodB?.name}</th>
                  <th className="p-4 font-bold text-right">Meaningful Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100 text-coffee-800">
                {comparison.differences.map((diff, idx) => (
                  <tr key={idx} className="hover:bg-beige-50/60 transition-colors">
                    <td className="p-4 font-semibold text-coffee-950">{diff.nutrient}</td>
                    <td className="p-4">
                      {diff.valueA !== undefined ? `${diff.valueA} ${diff.unit}` : '--'}
                    </td>
                    <td className="p-4">
                      {diff.valueB !== undefined ? `${diff.valueB} ${diff.unit}` : '--'}
                    </td>
                    <td className="p-4 text-right">
                      {diff.higherIn === 'equal' ? (
                        <span className="text-coffee-500 font-medium inline-flex items-center gap-1">
                          <Minus className="w-3.5 h-3.5" /> Equal
                        </span>
                      ) : diff.higherIn === 'A' ? (
                        <span className="badge-pencil-peach font-bold">
                          A is +{Math.abs(diff.difference)} {diff.unit} higher
                        </span>
                      ) : diff.higherIn === 'B' ? (
                        <span className="badge-pencil-blue font-bold">
                          B is +{Math.abs(diff.difference)} {diff.unit} higher
                        </span>
                      ) : (
                        <span className="text-coffee-400">Data incomplete</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ingredients & Allergens Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-warm bg-white border border-beige-200 p-5 space-y-3">
          <h3 className="text-sm font-serif font-bold text-coffee-950">
            {prodA?.name} — Ingredients
          </h3>
          <p className="text-xs text-coffee-700 leading-relaxed font-mono bg-beige-50 p-3 rounded-xl border border-beige-200">
            {prodA?.ingredientsText || 'No ingredient statement available.'}
          </p>
          {prodA?.allergenWarningText && (
            <p className="text-xs text-[#8D3418] font-semibold">
              Allergens: {prodA.allergenWarningText}
            </p>
          )}
        </div>

        <div className="card-warm bg-white border border-beige-200 p-5 space-y-3">
          <h3 className="text-sm font-serif font-bold text-coffee-950">
            {prodB?.name} — Ingredients
          </h3>
          <p className="text-xs text-coffee-700 leading-relaxed font-mono bg-beige-50 p-3 rounded-xl border border-beige-200">
            {prodB?.ingredientsText || 'No ingredient statement available.'}
          </p>
          {prodB?.allergenWarningText && (
            <p className="text-xs text-[#8D3418] font-semibold">
              Allergens: {prodB.allergenWarningText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductComparePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-coffee-500">Loading comparison...</div>}>
      <ProductCompareContent />
    </Suspense>
  );
}
