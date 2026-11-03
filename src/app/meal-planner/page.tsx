'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Trash2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';
import {
  DailyMealSummary,
  LoggedMealItem,
  MealType,
  ExtractedProduct,
  UserProfile,
} from '@/types/nutrition';
import { STANDARD_DAILY_VALUES } from '@/lib/assessment/rulesEngine';

const MEAL_SECTIONS: { type: MealType; label: string; icon: string; description: string }[] = [
  { type: 'breakfast', label: 'Breakfast', icon: '🌅', description: 'Start your morning with complex carbs & protein' },
  { type: 'lunch', label: 'Lunch', icon: '☀️', description: 'Balanced meal with vegetables, whole grains & healthy fats' },
  { type: 'dinner', label: 'Dinner', icon: '🌙', description: 'Light, nutrient-dense meal easy on digestion' },
  { type: 'snack', label: 'Snacks & Beverages', icon: '🍎', description: 'Mid-meal fruits, nuts, or tea/coffee' },
];

export default function MealPlannerPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailySummary, setDailySummary] = useState<DailyMealSummary | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Add meal modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMealType, setTargetMealType] = useState<MealType>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableProducts, setAvailableProducts] = useState<ExtractedProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ExtractedProduct | null>(null);
  const [servingsCount, setServingsCount] = useState<number>(1);

  // Custom food manual state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customSugar, setCustomSugar] = useState('');
  const [customSodium, setCustomSodium] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = () => {
    const p = UserRepository.getProfile();
    setProfile(p);

    const summary = UserRepository.getMealsByDate(selectedDate);
    setDailySummary(summary);

    // Combine scan history and sample products for food picker
    const history = UserRepository.getHistory();
    const historyProducts: ExtractedProduct[] = history.map((h) => ({
      id: h.productId,
      name: h.productName,
      brand: h.brand,
      ingredientsText: '',
      parsedIngredients: [],
      nutrition: {
        servingSize: '1 serving',
        servingBasis: 'per_serving',
        calories: h.relevantNutrients.find((rn) => rn.name === 'Calories')?.value || 150,
        sodiumMg: h.relevantNutrients.find((rn) => rn.name === 'Sodium')?.value || 100,
      },
      ocrConfidence: 95,
      uncertainFields: [],
      scannedAt: h.assessedAt,
      provenance: 'open_food_facts',
    }));

    // Deduplicate
    const combined = [...SAMPLE_PRODUCTS];
    for (const hp of historyProducts) {
      if (!combined.some((c) => c.name === hp.name)) {
        combined.push(hp);
      }
    }
    setAvailableProducts(combined);
  };

  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleOpenAddModal = (mealType: MealType) => {
    setTargetMealType(mealType);
    setSelectedProduct(null);
    setSearchQuery('');
    setServingsCount(1);
    setIsCustomMode(false);
    setIsModalOpen(true);
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCustomMode) {
      if (!customName.trim()) return;
      UserRepository.addMealEntry(
        {
          mealType: targetMealType,
          name: customName.trim(),
          brand: customBrand.trim() || undefined,
          servingsCount: 1,
          servingDescription: '1 portion',
          calories: parseFloat(customCalories) || 0,
          proteinG: parseFloat(customProtein) || 0,
          carbsG: parseFloat(customCarbs) || 0,
          fatG: parseFloat(customFat) || 0,
          sugarG: parseFloat(customSugar) || 0,
          sodiumMg: parseFloat(customSodium) || 0,
          fiberG: 0,
        },
        selectedDate
      );
    } else if (selectedProduct) {
      const n = selectedProduct.nutrition;
      const count = servingsCount || 1;
      UserRepository.addMealEntry(
        {
          mealType: targetMealType,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand,
          servingsCount: count,
          servingDescription: n.servingSize || '1 serving',
          calories: Math.round((n.calories || 0) * count),
          proteinG: Math.round((n.proteinG || 0) * count * 10) / 10,
          carbsG: Math.round((n.totalCarbohydratesG || 0) * count * 10) / 10,
          fatG: Math.round((n.totalFatG || 0) * count * 10) / 10,
          sugarG: Math.round(((n.addedSugarsG ?? n.totalSugarsG) || 0) * count * 10) / 10,
          sodiumMg: Math.round((n.sodiumMg || 0) * count),
          fiberG: Math.round((n.dietaryFiberG || 0) * count * 10) / 10,
        },
        selectedDate
      );
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteMeal = (id: string) => {
    UserRepository.deleteMealEntry(id);
    loadData();
  };

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totals = dailySummary?.totals || {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar with Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7] text-xs font-semibold mb-2">
            <Utensils className="w-3.5 h-3.5 text-[#275A3A]" />
            <span>Daily Food Diary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
            Meal Planner & Nutrition Log
          </h1>
          <p className="text-xs sm:text-sm text-coffee-600 mt-1">
            Log your daily meals, track macronutrients, and monitor your intake against ICMR-NIN 2024 targets.
          </p>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-beige-300 shadow-subtle">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-1 rounded-lg text-coffee-700 hover:bg-beige-100"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-coffee-900 px-2">
            <Calendar className="w-4 h-4 text-pencil-sage-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-medium focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => changeDateBy(1)}
            className="p-1 rounded-lg text-coffee-700 hover:bg-beige-100"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Nutrition Summary Dashboard Card */}
      <div className="card-warm bg-white border border-beige-200/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FAF0AE] border border-[#F5E47E] flex items-center justify-center text-[#715707]">
              <Flame className="w-5 h-5 text-[#87700E]" />
            </div>
            <div>
              <span className="text-xs text-coffee-500 font-medium">Total Calories Consumed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-serif text-coffee-950">{totals.calories}</span>
                <span className="text-xs text-coffee-600">/ {calorieTarget} kcal target</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-coffee-600 sm:text-right">
            <span className="font-semibold text-pencil-sage-700">{caloriePercent}% of daily budget</span>
            <div className="w-full sm:w-48 bg-beige-200 rounded-full h-2 mt-1.5 overflow-hidden">
              <div
                className="bg-pencil-sage-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Macro & Micronutrient Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Protein</span>
            <div className="text-lg font-bold text-coffee-900 mt-0.5">{totals.proteinG}g</div>
            <span className="text-[10px] text-pencil-sage-700 font-medium">Goal: 54g</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Carbs</span>
            <div className="text-lg font-bold text-coffee-900 mt-0.5">{totals.carbsG}g</div>
            <span className="text-[10px] text-coffee-500">Fiber: {totals.fiberG}g</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Total Fat</span>
            <div className="text-lg font-bold text-coffee-900 mt-0.5">{totals.fatG}g</div>
            <span className="text-[10px] text-coffee-500">Cap: 67g</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Added Sugars</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                totals.sugarG > STANDARD_DAILY_VALUES.addedSugarsG
                  ? 'text-pencil-terracotta-600'
                  : 'text-coffee-900'
              }`}
            >
              {totals.sugarG}g
            </div>
            <span className="text-[10px] text-coffee-500">ICMR cap: 25g</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Sodium</span>
            <div
              className={`text-lg font-bold mt-0.5 ${
                totals.sodiumMg > STANDARD_DAILY_VALUES.sodiumMg
                  ? 'text-pencil-terracotta-600'
                  : 'text-coffee-900'
              }`}
            >
              {totals.sodiumMg} mg
            </div>
            <span className="text-[10px] text-coffee-500">WHO cap: 2000mg</span>
          </div>

          <div className="bg-beige-50 rounded-xl p-3 border border-beige-200 text-center">
            <span className="text-[11px] text-coffee-500 uppercase font-semibold">Dietary Fiber</span>
            <div className="text-lg font-bold text-pencil-sage-700 mt-0.5">{totals.fiberG}g</div>
            <span className="text-[10px] text-coffee-500">Target: 30g</span>
          </div>
        </div>
      </div>

      {/* 4 Meal Sections */}
      <div className="space-y-5">
        {MEAL_SECTIONS.map((section) => {
          const sectionItems =
            dailySummary?.items.filter((item) => item.mealType === section.type) || [];
          const sectionCalories = sectionItems.reduce((acc, c) => acc + (c.calories || 0), 0);

          return (
            <div key={section.type} className="card-warm p-5 bg-white border border-beige-200">
              <div className="flex items-center justify-between pb-3 border-b border-beige-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{section.icon}</span>
                  <div>
                    <h3 className="text-base font-serif font-bold text-coffee-950">
                      {section.label}
                    </h3>
                    <p className="text-xs text-coffee-500">{section.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-coffee-700">
                    {sectionCalories} kcal
                  </span>
                  <button
                    onClick={() => handleOpenAddModal(section.type)}
                    className="btn-pencil-sage text-xs py-1.5 px-3"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Food</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              {sectionItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-coffee-500">
                  No foods logged for {section.label.toLowerCase()} yet. Click "Add Food" or scan a food label.
                </div>
              ) : (
                <div className="divide-y divide-beige-100 mt-2">
                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-coffee-900">{item.name}</span>
                          {item.brand && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-beige-100 text-coffee-700 border border-beige-200">
                              {item.brand}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-coffee-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                          <span>{item.servingsCount} portion ({item.servingDescription})</span>
                          <span>•</span>
                          <span>Protein: {item.proteinG}g</span>
                          <span>•</span>
                          <span>Carbs: {item.carbsG}g</span>
                          <span>•</span>
                          <span>Fat: {item.fatG}g</span>
                          <span>•</span>
                          <span>Sugar: {item.sugarG}g</span>
                          <span>•</span>
                          <span>Sodium: {item.sodiumMg}mg</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span className="text-sm font-bold text-coffee-800">{item.calories} kcal</span>
                        <button
                          onClick={() => handleDeleteMeal(item.id)}
                          className="text-pencil-terracotta-600 hover:text-pencil-terracotta-700 p-1.5 rounded-lg hover:bg-beige-100"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD FOOD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-coffee-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-float border border-beige-300 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-coffee-950">
                  Log Food to {MEAL_SECTIONS.find((s) => s.type === targetMealType)?.label}
                </h3>
                <p className="text-xs text-coffee-500">
                  Select a previously scanned food or enter custom nutrition facts.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-coffee-500 hover:text-coffee-800 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Toggle: Catalog vs Custom */}
            <div className="flex justify-center">
              <div className="bg-beige-100 p-1 rounded-xl inline-flex gap-1 border border-beige-200">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !isCustomMode
                      ? 'bg-white text-coffee-900 shadow-subtle'
                      : 'text-coffee-600 hover:text-coffee-900'
                  }`}
                >
                  From Scans & Products
                </button>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(true)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isCustomMode
                      ? 'bg-white text-coffee-900 shadow-subtle'
                      : 'text-coffee-600 hover:text-coffee-900'
                  }`}
                >
                  Custom Meal Entry
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMeal} className="space-y-4">
              {!isCustomMode ? (
                <>
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-coffee-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search scanned foods (e.g. Maggi, Chobani, Oats)..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700"
                    />
                  </div>

                  {/* List of matched items */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-beige-100 border border-beige-200 rounded-xl p-1">
                    {filteredProducts.map((prod) => {
                      const isSelected = selectedProduct?.id === prod.id;
                      return (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#E4F1E9] text-[#275A3A] font-semibold border border-[#A7D1B7]'
                              : 'hover:bg-beige-50 text-coffee-800'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{prod.name}</div>
                            <div className="text-[11px] text-coffee-500">
                              {prod.brand || 'Packaged Product'} • {prod.nutrition.calories || 0} kcal/serving
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[#275A3A]" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Servings count */}
                  {selectedProduct && (
                    <div className="bg-beige-50 p-3 rounded-xl border border-beige-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-coffee-800">
                        <span className="font-semibold">Servings consumed:</span>
                        <div className="flex items-center gap-2">
                          {[0.5, 1, 1.5, 2].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              onClick={() => setServingsCount(cnt)}
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                servingsCount === cnt
                                  ? 'bg-coffee-800 text-white'
                                  : 'bg-white border border-beige-300 text-coffee-800'
                              }`}
                            >
                              {cnt}x
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-coffee-600">
                        1 serving = {selectedProduct.nutrition.servingSize}. Estimated intake:{' '}
                        <strong>
                          {Math.round((selectedProduct.nutrition.calories || 0) * servingsCount)} kcal
                        </strong>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                /* Custom Food Form */
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-coffee-800 block mb-1">
                      Food or Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Moong Dal Khichdi, Masala Dosa, Apple"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-coffee-800 block mb-1">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        value={customCalories}
                        onChange={(e) => setCustomCalories(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-coffee-800 block mb-1">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        placeholder="e.g. 8"
                        className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-coffee-800 block mb-1">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        placeholder="e.g. 35"
                        className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-coffee-800 block mb-1">
                        Sodium (mg)
                      </label>
                      <input
                        type="number"
                        value={customSodium}
                        onChange={(e) => setCustomSodium(e.target.value)}
                        placeholder="e.g. 320"
                        className="w-full px-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pencil-peach text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isCustomMode && !selectedProduct}
                  className="btn-pencil-brown text-xs py-2 px-5 disabled:opacity-40"
                >
                  Log to Diary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

