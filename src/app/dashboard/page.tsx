'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Barcode,
  Upload,
  Columns,
  History as HistoryIcon,
  User,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  PlusCircle,
  BookOpen,
  Utensils,
  Bot,
  Flame,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { UserProfile, FoodAssessment, DailyMealSummary } from '@/types/nutrition';
import StatusBadge from '@/components/nutrition/StatusBadge';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';
import { STANDARD_DAILY_VALUES } from '@/lib/assessment/rulesEngine';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<FoodAssessment[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailyMealSummary | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);

  useEffect(() => {
    const prof = UserRepository.getProfile();
    setProfile(prof);

    const hist = UserRepository.getHistory();
    setHistory(hist);

    const todayStr = new Date().toISOString().split('T')[0];
    const summary = UserRepository.getMealsByDate(todayStr);
    setTodaySummary(summary);

    const trends = UserRepository.getWeeklyMealTrends();
    setWeeklyTrends(trends);
  }, []);

  const handleTestSample = (sampleProd: typeof SAMPLE_PRODUCTS[0]) => {
    UserRepository.setActiveProduct(sampleProd);
    router.push('/review');
  };

  const totals = todaySummary?.totals || {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    sugarG: 0,
    sodiumMg: 0,
    fiberG: 0,
  };

  const calorieTarget = profile?.calorieTargetDaily || 2000;
  const caloriePercent = Math.min(100, Math.round((totals.calories / calorieTarget) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Bar */}
      <div className="card-warm bg-white border border-beige-200/90 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950 tracking-tight">
              Welcome back, {profile?.name || 'Explorer'}
            </h1>
            {profile?.isGuest && (
              <span className="text-[11px] font-semibold text-[#275A3A] bg-[#E4F1E9] px-2.5 py-0.5 rounded-full border border-[#A7D1B7]">
                Local Profile
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-coffee-600">
            NutriAgent evaluates packaged grocery items against your customized dietary preferences and health goals.
          </p>
        </div>

        {/* Profile Safeguards Pill */}
        <div className="bg-beige-50 rounded-2xl p-4 border border-beige-200 flex flex-col gap-2 min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-semibold text-coffee-800">
            <span>Active Safeguards:</span>
            <Link
              href="/profile"
              className="text-pencil-terracotta-600 hover:underline flex items-center gap-0.5 text-[11px] font-bold"
            >
              <span>Edit</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile?.allergies && profile.allergies.length > 0 ? (
              profile.allergies.map((a) => (
                <span
                  key={a}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#FFF6F2] text-[#8D3418] border border-[#FCD0C0] capitalize"
                >
                  Allergy: {a.replace('_', ' ')}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-coffee-500 italic">No allergies specified</span>
            )}

            {profile?.dietaryPreferences &&
              profile.dietaryPreferences.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] capitalize"
                >
                  {d.replace('_', ' ')}
                </span>
              ))}

            {profile?.healthConsiderations &&
              profile.healthConsiderations.map((h) => (
                <span
                  key={h}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#FAF0AE] text-[#715707] border border-[#F5E47E] capitalize"
                >
                  {h.replace('_', ' ')}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Action Pencil-Color Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/scan"
          className="btn-pencil-blue p-4 rounded-2xl text-left flex flex-col justify-between gap-3 h-28 hover:shadow-card transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#254F75] shadow-subtle">
            <Barcode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#254F75] block leading-tight">
              Scan Barcode
            </span>
            <span className="text-[10px] text-coffee-600 block mt-0.5">Camera & EAN lookup</span>
          </div>
        </Link>

        <Link
          href="/scan?mode=upload"
          className="btn-pencil-peach p-4 rounded-2xl text-left flex flex-col justify-between gap-3 h-28 hover:shadow-card transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#8D3418] shadow-subtle">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#8D3418] block leading-tight">
              Upload Label (OCR)
            </span>
            <span className="text-[10px] text-coffee-600 block mt-0.5">Photo text extraction</span>
          </div>
        </Link>

        <Link
          href="/meal-planner"
          className="btn-pencil-sage p-4 rounded-2xl text-left flex flex-col justify-between gap-3 h-28 hover:shadow-card transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#275A3A] shadow-subtle">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#275A3A] block leading-tight">
              Log Meal / Diary
            </span>
            <span className="text-[10px] text-coffee-600 block mt-0.5">Track daily intake</span>
          </div>
        </Link>

        <Link
          href="/compare"
          className="btn-pencil-yellow p-4 rounded-2xl text-left flex flex-col justify-between gap-3 h-28 hover:shadow-card transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#715707] shadow-subtle">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-[#715707] block leading-tight">
              Compare Foods
            </span>
            <span className="text-[10px] text-coffee-600 block mt-0.5">Side-by-side metric</span>
          </div>
        </Link>

        <Link
          href="/assistant"
          className="btn-pencil-terracotta p-4 rounded-2xl text-left flex flex-col justify-between gap-3 h-28 hover:shadow-card transition-all group col-span-2 sm:col-span-1"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-subtle">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs sm:text-sm text-white block leading-tight">
              Nutrition Assistant
            </span>
            <span className="text-[10px] text-white/90 block mt-0.5">Ask questions & rules</span>
          </div>
        </Link>
      </div>

      {/* Daily Food Diary Summary */}
      <div className="card-warm bg-white border border-beige-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-beige-200 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-pencil-yellow-600" />
            <div>
              <h2 className="text-base font-serif font-bold text-coffee-950">
                Today's Nutrition Summary & Progress
              </h2>
              <p className="text-xs text-coffee-500">
                Calculated from genuine logged meals against ICMR-NIN 2024 guidance.
              </p>
            </div>
          </div>
          <Link
            href="/meal-planner"
            className="text-pencil-sage-700 text-xs font-bold hover:underline flex items-center gap-1"
          >
            <span>Open Full Food Diary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Calories
            </span>
            <div className="text-lg font-bold text-coffee-950 mt-0.5">{totals.calories}</div>
            <div className="w-full bg-beige-200 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-pencil-sage-500 h-1.5 rounded-full"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-coffee-500 mt-1 block">/ {calorieTarget} kcal</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Protein
            </span>
            <div className="text-lg font-bold text-pencil-sage-700 mt-0.5">{totals.proteinG}g</div>
            <span className="text-[10px] text-coffee-500 block mt-1">Goal: 54g/day</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Carbohydrates
            </span>
            <div className="text-lg font-bold text-coffee-900 mt-0.5">{totals.carbsG}g</div>
            <span className="text-[10px] text-coffee-500 block mt-1">Fiber: {totals.fiberG}g</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Total Fat
            </span>
            <div className="text-lg font-bold text-coffee-900 mt-0.5">{totals.fatG}g</div>
            <span className="text-[10px] text-coffee-500 block mt-1">Cap: 67g/day</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Added Sugar
            </span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                totals.sugarG > STANDARD_DAILY_VALUES.addedSugarsG
                  ? 'text-pencil-terracotta-600'
                  : 'text-coffee-900'
              }`}
            >
              {totals.sugarG}g
            </div>
            <span className="text-[10px] text-coffee-500 block mt-1">Cap: 25g (ICMR)</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200">
            <span className="text-[11px] font-semibold text-coffee-500 block uppercase">
              Sodium
            </span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                totals.sodiumMg > STANDARD_DAILY_VALUES.sodiumMg
                  ? 'text-pencil-terracotta-600'
                  : 'text-coffee-900'
              }`}
            >
              {totals.sodiumMg} mg
            </div>
            <span className="text-[10px] text-coffee-500 block mt-1">Cap: 2000mg (WHO)</span>
          </div>
        </div>

        {/* Recently Logged Meals List */}
        {todaySummary?.items && todaySummary.items.length > 0 ? (
          <div className="pt-2">
            <span className="text-xs font-semibold text-coffee-700 block mb-2">
              Today's Logged Items ({todaySummary.items.length}):
            </span>
            <div className="divide-y divide-beige-100 border border-beige-200 rounded-xl overflow-hidden bg-white">
              {todaySummary.items.map((item) => (
                <div key={item.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-coffee-900">{item.name}</span>
                    <span className="text-[10px] text-coffee-500 ml-2 capitalize">
                      ({item.mealType} • {item.servingsCount} portion)
                    </span>
                  </div>
                  <span className="font-bold text-coffee-800">{item.calories} kcal</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-xs text-coffee-500">
            No meals logged yet today.{' '}
            <Link href="/meal-planner" className="text-pencil-sage-700 font-semibold underline">
              Add your breakfast, lunch, or snack.
            </Link>
          </div>
        )}
      </div>

      {/* Grid: Recently Scanned Products & Sample Test Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recently Scanned Products */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-coffee-800" />
              <h2 className="text-base font-serif font-bold text-coffee-950">
                Recently Scanned Products
              </h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-bold text-pencil-sage-700 hover:underline flex items-center gap-1"
            >
              <span>View All History</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="card-warm bg-white border border-beige-200 p-8 text-center space-y-3">
              <Camera className="w-8 h-8 text-coffee-400 mx-auto" />
              <p className="text-xs text-coffee-600">
                No products evaluated yet. Scan your first barcode or test one of the samples below.
              </p>
              <Link href="/scan" className="btn-pencil-brown text-xs py-2 px-4 inline-flex">
                Open Scanner
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/results/${item.id}`)}
                  className="card-warm bg-white border border-beige-200 p-4 hover:border-coffee-400 cursor-pointer transition-all shadow-subtle group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-coffee-950 group-hover:text-coffee-800">
                          {item.productName}
                        </span>
                        {item.brand && (
                          <span className="text-[10px] text-coffee-600 px-2 py-0.5 rounded-full bg-beige-100 border border-beige-200">
                            {item.brand}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-coffee-600 line-clamp-1">{item.summary}</p>
                    </div>
                    <StatusBadge status={item.status} size="sm" />
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-beige-100 flex items-center justify-between text-[11px] text-coffee-500">
                    <span>Assessed {new Date(item.assessedAt).toLocaleDateString()}</span>
                    <span className="text-pencil-terracotta-600 font-semibold group-hover:underline flex items-center gap-0.5">
                      <span>View analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: One-Click Test Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pencil-sage-600" />
              <h2 className="text-base font-serif font-bold text-coffee-950">
                Sample Food Products
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-coffee-500 bg-beige-100 px-2 py-0.5 rounded">
              Verified Data
            </span>
          </div>

          <div className="space-y-2.5">
            {SAMPLE_PRODUCTS.slice(0, 5).map((sample) => (
              <div
                key={sample.id}
                onClick={() => handleTestSample(sample)}
                className="p-3.5 bg-white rounded-2xl border border-beige-200 hover:border-coffee-400 cursor-pointer transition-all shadow-subtle group flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-coffee-950 group-hover:text-coffee-800">
                    {sample.name}
                  </div>
                  <div className="text-[11px] text-coffee-500 flex items-center gap-2 mt-0.5">
                    <span>{sample.brand || 'Packaged Product'}</span>
                    <span>•</span>
                    <span>{sample.nutrition.calories || 0} kcal</span>
                    <span>•</span>
                    <span>{sample.nutrition.servingSize}</span>
                  </div>
                </div>
                <button className="btn-pencil-sage text-[11px] py-1 px-2.5 shrink-0">
                  <span>Test</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
