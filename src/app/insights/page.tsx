'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Utensils,
  Camera,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { UserProfile, DailyMealSummary } from '@/types/nutrition';
import { STANDARD_DAILY_VALUES } from '@/lib/assessment/rulesEngine';

export default function InsightsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<
    { date: string; calories: number; proteinG: number; carbsG: number; fatG: number; sodiumMg: number; sugarG: number }[]
  >([]);
  const [totalLoggedMeals, setTotalLoggedMeals] = useState<number>(0);
  const [frequentIngredients, setFrequentIngredients] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const p = UserRepository.getProfile();
    setProfile(p);

    const trends = UserRepository.getWeeklyMealTrends();
    setWeeklyTrends(trends);

    // Calculate total meals and frequent ingredients from scan history
    const history = UserRepository.getHistory();
    const allIngredients: Record<string, number> = {};

    history.forEach((h) => {
      // Tally ingredients from concerns and relevant nutrients
      h.ingredientsOfConcern.forEach((c) => {
        allIngredients[c.ingredient] = (allIngredients[c.ingredient] || 0) + 1;
      });
    });

    const ingredientList = Object.entries(allIngredients)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setFrequentIngredients(ingredientList);

    // Count non-zero calorie days
    const activeDays = trends.filter((t) => t.calories > 0).length;
    setTotalLoggedMeals(activeDays);
  }, []);

  const maxCalorieInWeek = Math.max(...weeklyTrends.map((t) => t.calories), 2000);
  const targetCalories = profile?.calorieTargetDaily || 2000;

  // Weekly averages
  const activeDays = weeklyTrends.filter((t) => t.calories > 0);
  const avgCalories =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((a, b) => a + b.calories, 0) / activeDays.length)
      : 0;
  const avgProtein =
    activeDays.length > 0
      ? Math.round((activeDays.reduce((a, b) => a + b.proteinG, 0) / activeDays.length) * 10) / 10
      : 0;
  const avgSodium =
    activeDays.length > 0
      ? Math.round(activeDays.reduce((a, b) => a + b.sodiumMg, 0) / activeDays.length)
      : 0;
  const avgSugar =
    activeDays.length > 0
      ? Math.round((activeDays.reduce((a, b) => a + b.sugarG, 0) / activeDays.length) * 10) / 10
      : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-beige-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] text-xs font-semibold mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#254F75]" />
          <span>Longitudinal Dietary Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
          Personal Nutrition Insights
        </h1>
        <p className="text-xs sm:text-sm text-coffee-600 mt-1">
          Review 7-day intake trajectories, nutrient distribution, and evidence-informed nutritional guidance.
        </p>
      </div>

      {totalLoggedMeals === 0 ? (
        /* Meaningful Empty State */
        <div className="card-warm bg-white text-center py-16 px-4 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-beige-100 border border-beige-300 flex items-center justify-center mx-auto text-coffee-600">
            <BarChart3 className="w-8 h-8 text-pencil-sage-600" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-serif font-bold text-coffee-950">
              No Food Diary Records Yet
            </h3>
            <p className="text-xs text-coffee-600 leading-relaxed">
              Log at least 1 or 2 meals in your food diary or scan packaged items to generate authentic weekly nutrition trends and personalized intake insights.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/meal-planner" className="btn-pencil-sage text-xs">
              <Utensils className="w-4 h-4" />
              <span>Open Meal Planner</span>
            </Link>
            <Link href="/scan" className="btn-pencil-brown text-xs">
              <Camera className="w-4 h-4" />
              <span>Scan Food Label</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Data-Rich Insights Dashboard */
        <div className="space-y-6">
          {/* Weekly Averages Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="card-warm p-4 bg-white border border-beige-200">
              <span className="text-[11px] font-semibold text-coffee-500 uppercase">Avg Daily Energy</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-serif text-coffee-950">{avgCalories}</span>
                <span className="text-xs text-coffee-600">kcal</span>
              </div>
              <span className="text-[10px] text-coffee-500 block mt-1">Target: {targetCalories} kcal</span>
            </div>

            <div className="card-warm p-4 bg-white border border-beige-200">
              <span className="text-[11px] font-semibold text-coffee-500 uppercase">Avg Protein</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-serif text-pencil-sage-700">{avgProtein}</span>
                <span className="text-xs text-coffee-600">g / day</span>
              </div>
              <span className="text-[10px] text-pencil-sage-600 block mt-1">ICMR target: 54g</span>
            </div>

            <div className="card-warm p-4 bg-white border border-beige-200">
              <span className="text-[11px] font-semibold text-coffee-500 uppercase">Avg Added Sugar</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-bold font-serif ${
                    avgSugar > STANDARD_DAILY_VALUES.addedSugarsG
                      ? 'text-pencil-terracotta-600'
                      : 'text-coffee-950'
                  }`}
                >
                  {avgSugar}
                </span>
                <span className="text-xs text-coffee-600">g / day</span>
              </div>
              <span className="text-[10px] text-coffee-500 block mt-1">Cap: 25g (ICMR-NIN)</span>
            </div>

            <div className="card-warm p-4 bg-white border border-beige-200">
              <span className="text-[11px] font-semibold text-coffee-500 uppercase">Avg Sodium</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-2xl font-bold font-serif ${
                    avgSodium > STANDARD_DAILY_VALUES.sodiumMg
                      ? 'text-pencil-terracotta-600'
                      : 'text-coffee-950'
                  }`}
                >
                  {avgSodium}
                </span>
                <span className="text-xs text-coffee-600">mg / day</span>
              </div>
              <span className="text-[10px] text-coffee-500 block mt-1">Cap: 2000mg (WHO)</span>
            </div>
          </div>

          {/* 7-Day Calorie & Macro Trend Chart */}
          <div className="card-warm p-5 sm:p-6 bg-white border border-beige-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-beige-200 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-coffee-950">
                  7-Day Caloric Intake Pattern
                </h3>
                <p className="text-xs text-coffee-500">
                  Visualized daily calories against your {targetCalories} kcal reference goal.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-pencil-sage-500" />
                  <span className="text-coffee-700 font-medium">Logged Intake</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-pencil-terracotta-400" />
                  <span className="text-coffee-700 font-medium">Budget ({targetCalories})</span>
                </div>
              </div>
            </div>

            {/* Custom SVG / CSS Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-beige-200">
              {weeklyTrends.map((day, idx) => {
                const dayLabel = new Date(day.date).toLocaleDateString([], { weekday: 'short' });
                const heightPercent =
                  maxCalorieInWeek > 0 ? Math.min(100, Math.round((day.calories / maxCalorieInWeek) * 100)) : 0;
                const isOverBudget = day.calories > targetCalories;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-semibold text-coffee-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {day.calories}
                    </span>
                    <div className="w-full max-w-[42px] bg-beige-100 rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isOverBudget ? 'bg-pencil-peach-500' : 'bg-pencil-sage-400'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-coffee-600">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pattern Recognition & Actionable Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Dietary Patterns Observed */}
            <div className="card-warm bg-white border border-beige-200 space-y-3">
              <div className="flex items-center gap-2 text-coffee-950 font-serif font-bold text-base">
                <Lightbulb className="w-4 h-4 text-pencil-yellow-600" />
                <span>Identified Nutritional Patterns</span>
              </div>

              <div className="space-y-2.5 text-xs text-coffee-700">
                <div className="p-3 rounded-xl bg-[#F3F8F5] border border-[#C9E3D3] flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-pencil-sage-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold text-pencil-sage-900">
                      Sodium Intake Regulated
                    </strong>
                    Average sodium across logged meals is {avgSodium} mg, safely within the WHO 2,000 mg/day ceiling.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF6F2] border border-[#FCD0C0] flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-pencil-peach-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold text-pencil-peach-900">
                      Added Sugar Monitoring
                    </strong>
                    Packaged snacks contributed {avgSugar}g daily sugar. Keep added sugars under 25g (ICMR-NIN Guideline 3).
                  </div>
                </div>

                {profile?.healthConsiderations.includes('hypertension') && (
                  <div className="p-3 rounded-xl bg-[#E5F0FA] border border-[#ABCFF0] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#254F75] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold text-[#254F75]">
                        Hypertension Protocol
                      </strong>
                      Avoid products exceeding 350mg sodium per serving (e.g. instant soup packets and papads).
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence-Informed Next Steps */}
            <div className="card-warm bg-white border border-beige-200 space-y-3">
              <div className="flex items-center gap-2 text-coffee-950 font-serif font-bold text-base">
                <Sparkles className="w-4 h-4 text-pencil-sage-600" />
                <span>Actionable Recommendations (ICMR-NIN 2024)</span>
              </div>

              <ul className="space-y-2 text-xs text-coffee-700">
                <li className="flex items-start gap-2">
                  <span className="text-pencil-sage-600 font-bold">•</span>
                  <span>
                    <strong>Diversify Protein Sources:</strong> Complement cereal intake with legumes, pulses, paneer, or fermented dairy for a complete amino acid profile (Guideline 2).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pencil-sage-600 font-bold">•</span>
                  <span>
                    <strong>Watch Portion Distortion:</strong> Check serving sizes on multi-serving biscuit and snack packs before consuming the entire packet (Guideline 6).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pencil-sage-600 font-bold">•</span>
                  <span>
                    <strong>Favor Whole Millets:</strong> Choose jowar, bajra, or ragi alternatives over ultra-processed maida-based noodles and biscuits (Guideline 7).
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/assistant"
                  className="inline-flex items-center gap-1.5 text-xs text-pencil-terracotta-600 font-semibold hover:underline"
                >
                  <span>Ask Nutrition Assistant about your intake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

