'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Columns,
  Share2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  Info,
  Utensils,
  Bot,
  Bookmark,
  BookmarkCheck,
  Flame,
  User,
  Heart,
  Activity,
  Apple,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { FoodAssessment, ExtractedProduct } from '@/types/nutrition';
import StatusBadge from '@/components/nutrition/StatusBadge';
import NutritionFactsTable from '@/components/nutrition/NutritionFactsTable';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<FoodAssessment | null>(null);
  const [activeProduct, setActiveProduct] = useState<ExtractedProduct | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mealLoggedNotice, setMealLoggedNotice] = useState(false);

  useEffect(() => {
    // 1. Try to load from active assessment in storage
    const activeAssess = UserRepository.getActiveAssessment();
    const activeProd = UserRepository.getActiveProduct();

    if (activeAssess && (activeAssess.id === params?.id || !params?.id || params?.id === 'active')) {
      setAssessment(activeAssess);
      setActiveProduct(activeProd);
      if (activeProd) {
        setIsSaved(UserRepository.isProductSaved(activeProd.id));
      }
      return;
    }

    // 2. Otherwise search in saved history
    const history = UserRepository.getHistory();
    const found = history.find((h) => h.id === params?.id || h.productId === params?.id);
    if (found) {
      setAssessment(found);
      setActiveProduct(activeProd);
      if (activeProd) {
        setIsSaved(UserRepository.isProductSaved(activeProd.id));
      }
    }
  }, [params?.id]);

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-sm text-coffee-500">Loading food assessment results...</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-pencil-sage-700 underline font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleShareOrCopy = () => {
    const text = `NutriAgent Analysis for ${assessment.productName}:\nVerdict: ${assessment.headline}\n${assessment.summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleToggleSave = () => {
    if (!activeProduct) return;
    const nowSaved = UserRepository.toggleSavedProduct(activeProduct);
    setIsSaved(nowSaved);
  };

  const handleQuickLogMeal = () => {
    if (!activeProduct) return;
    const n = activeProduct.nutrition;
    UserRepository.addMealEntry({
      mealType: 'snack',
      productId: activeProduct.id,
      name: activeProduct.name,
      brand: activeProduct.brand,
      servingsCount: 1,
      servingDescription: n.servingSize || '1 serving',
      calories: n.calories || 0,
      proteinG: n.proteinG || 0,
      carbsG: n.totalCarbohydratesG || 0,
      fatG: n.totalFatG || 0,
      sugarG: (n.addedSugarsG ?? n.totalSugarsG) || 0,
      sodiumMg: n.sodiumMg || 0,
      fiberG: n.dietaryFiberG || 0,
    });
    setMealLoggedNotice(true);
    setTimeout(() => setMealLoggedNotice(false), 3000);
  };

  const handleCompareClick = () => {
    router.push(`/compare?primary=${assessment.productId}`);
  };

  const isFits = assessment.status === 'fits_preferences';
  const isCaution = assessment.status === 'review_carefully';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige-200 pb-4">
        <div className="flex items-center gap-2 text-xs text-coffee-500">
          <Link href="/dashboard" className="hover:text-coffee-950 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/scan" className="hover:text-coffee-950 transition-colors">
            Scan
          </Link>
          <span>/</span>
          <span className="text-coffee-900 font-semibold truncate max-w-[220px]">
            {assessment.productName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Save to Favorites Button */}
          <button
            onClick={handleToggleSave}
            className={`btn-pencil-yellow text-xs py-1.5 px-3 ${
              isSaved ? 'bg-[#F5E47E] text-[#715707]' : ''
            }`}
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved to Profile' : 'Save Product'}</span>
          </button>

          {/* Share Button */}
          <button onClick={handleShareOrCopy} className="btn-pencil-blue text-xs py-1.5 px-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Summary!' : 'Share Verdict'}</span>
          </button>
        </div>
      </div>

      {mealLoggedNotice && (
        <div className="p-3 bg-[#E4F1E9] border border-[#A7D1B7] rounded-xl text-xs text-[#275A3A] flex items-center justify-between">
          <span>Logged 1 serving of this product into your daily Food Diary!</span>
          <Link href="/meal-planner" className="underline font-bold">
            View Diary
          </Link>
        </div>
      )}

      {/* Main Status Verdict Hero Card */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 space-y-4 shadow-card ${
          isFits
            ? 'bg-gradient-to-br from-[#F3F8F5] via-white to-[#E4F1E9]/60 border-[#A7D1B7]'
            : isCaution
            ? 'bg-gradient-to-br from-[#FEFDF0] via-white to-[#FDF9D7]/80 border-[#F5E47E]'
            : 'bg-gradient-to-br from-[#FFF6F2] via-white to-[#FDE8E0]/70 border-[#F7B29B]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif font-bold uppercase tracking-wider text-coffee-600">
              Personalized Nutrition Assessment
            </span>
            {activeProduct?.vegStatus === 'veg' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4F1E9] text-[#275A3A] border border-[#A7D1B7]">
                <span className="w-2 h-2 rounded-full bg-[#275A3A]" />
                <span>Vegetarian (FSSAI)</span>
              </span>
            )}
            {activeProduct?.vegStatus === 'non_veg' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE6DF] text-[#A8442A] border border-[#F1A593]">
                <span className="w-2 h-2 rounded-full bg-[#A8442A]" />
                <span>Non-Vegetarian</span>
              </span>
            )}
          </div>
          <StatusBadge status={assessment.status} size="lg" />
        </div>

        <div className="space-y-2">
          {/* NEW: product name + photo */}
          <div className="flex items-center gap-3">
            {activeProduct?.imageUri && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={activeProduct.imageUri}
                alt={assessment.productName}
                className="w-14 h-14 rounded-xl object-cover border border-beige-300 bg-white"
              />
            )}
            <p className="text-lg sm:text-xl font-semibold text-coffee-900 leading-snug">
              {assessment.productName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950 tracking-tight">
              {assessment.headline}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-coffee-800 leading-relaxed max-w-3xl">
            {assessment.summary}
          </p>
        </div>

        {/* Provenance & Confidence Status Row */}
        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-coffee-600 border-t border-coffee-200/50">
          <span className="flex items-center gap-1 font-medium">
            <Shield className="w-3.5 h-3.5 text-pencil-sage-600" />
            <span>
              Source:{' '}
              {activeProduct?.provenance === 'open_food_facts'
                ? 'Open Food Facts Database'
                : activeProduct?.provenance === 'user_manual'
                ? 'User Verified / Physical Label'
                : 'Sample Nutrition Database'}
            </span>
          </span>
          <span>•</span>
          <span>Assessed: {new Date(assessment.assessedAt).toLocaleDateString()}</span>
          <span>•</span>
          <span>Deterministic Rules Engine (ICMR-NIN 2024 & FSSAI 2022)</span>
        </div>
      </div>

      {/* Quick Action Pills: Log to Meal Planner & Ask Assistant */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleQuickLogMeal}
          className="btn-pencil-sage text-xs py-3 px-4 font-semibold shadow-subtle justify-start"
        >
          <Utensils className="w-4 h-4 text-pencil-sage-700" />
          <span>Log 1 Serving to Meal Diary</span>
        </button>

        <Link
          href="/assistant"
          className="btn-pencil-blue text-xs py-3 px-4 font-semibold shadow-subtle justify-start"
        >
          <Bot className="w-4 h-4 text-[#254F75]" />
          <span>Ask Assistant about this Food</span>
        </Link>

        <button
          onClick={handleCompareClick}
          className="btn-pencil-yellow text-xs py-3 px-4 font-semibold shadow-subtle justify-start"
        >
          <Columns className="w-4 h-4 text-[#715707]" />
          <span>Compare with Another Food</span>
        </button>
      </div>

      {/* Personalized Health & Nutrient Match Card (Direct Answer to "Can I Eat This?") */}
      {assessment.healthEvaluation && (
        <div className="card-warm bg-white border border-beige-300 p-6 sm:p-8 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pencil-sage-100 text-pencil-sage-800 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-serif font-bold text-coffee-950 flex items-center gap-2">
                  <span>Personalized Health Match: {assessment.healthEvaluation.profileName}</span>
                  {assessment.healthEvaluation.isGuest && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-beige-100 text-coffee-600 border border-beige-300">
                      Guest Profile
                    </span>
                  )}
                </h2>
                <p className="text-xs text-coffee-600">
                  {assessment.healthEvaluation.overallHealthSummary}
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-1 text-xs text-pencil-sage-700 hover:text-pencil-sage-900 font-bold self-start sm:self-auto"
            >
              <span>Edit Your Health Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Allergen & Dietary Status Banner */}
          <div className="p-3.5 rounded-2xl bg-beige-50 border border-beige-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Shield
                className={`w-4 h-4 shrink-0 ${
                  assessment.healthEvaluation.allergenClearance === 'conflict'
                    ? 'text-red-600'
                    : assessment.healthEvaluation.allergenClearance === 'caution'
                    ? 'text-amber-600'
                    : 'text-pencil-sage-600'
                }`}
              />
              <span className="font-semibold text-coffee-900">Allergen &amp; Safety Status:</span>
              <span className="text-coffee-700">{assessment.healthEvaluation.allergenSummary}</span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border self-start sm:self-auto ${
                assessment.healthEvaluation.allergenClearance === 'conflict'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : assessment.healthEvaluation.allergenClearance === 'caution'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-pencil-sage-50 text-pencil-sage-700 border-pencil-sage-200'
              }`}
            >
              {assessment.healthEvaluation.allergenClearance === 'conflict'
                ? 'Conflict'
                : assessment.healthEvaluation.allergenClearance === 'caution'
                ? 'Review Precaution'
                : 'Cleared'}
            </span>
          </div>

          {/* 3 Nutrient Impact Cards (Sugar, Sodium, Saturated Fat) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sugar Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                assessment.healthEvaluation.sugarEvaluation.verdict === 'excessive'
                  ? 'bg-[#FFF6F2] border-[#FCD0C0]'
                  : assessment.healthEvaluation.sugarEvaluation.verdict === 'moderate'
                  ? 'bg-[#FEFDF0] border-[#FAF0AE]'
                  : 'bg-[#F3F8F5] border-[#C9E3D3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5 text-pencil-peach-700" />
                  Sugar &amp; Added Sugars
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    assessment.healthEvaluation.sugarEvaluation.verdict === 'excessive'
                      ? 'bg-red-100 text-red-800'
                      : assessment.healthEvaluation.sugarEvaluation.verdict === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-pencil-sage-100 text-pencil-sage-800'
                  }`}
                >
                  {assessment.healthEvaluation.sugarEvaluation.verdict}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-serif font-bold text-coffee-950">
                    {assessment.healthEvaluation.sugarEvaluation.productValue}g
                  </span>
                  <span className="text-xs text-coffee-600">
                    / {assessment.healthEvaluation.sugarEvaluation.recommendedDailyBudget}g daily
                    budget ({assessment.healthEvaluation.sugarEvaluation.percentageOfBudget}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      assessment.healthEvaluation.sugarEvaluation.verdict === 'excessive'
                        ? 'bg-red-500'
                        : assessment.healthEvaluation.sugarEvaluation.verdict === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-pencil-sage-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        assessment.healthEvaluation.sugarEvaluation.percentageOfBudget
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-coffee-800">
                {assessment.healthEvaluation.sugarEvaluation.userRecommendation}
              </p>
            </div>

            {/* Sodium Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                assessment.healthEvaluation.sodiumEvaluation.verdict === 'excessive'
                  ? 'bg-[#FFF6F2] border-[#FCD0C0]'
                  : assessment.healthEvaluation.sodiumEvaluation.verdict === 'moderate'
                  ? 'bg-[#FEFDF0] border-[#FAF0AE]'
                  : 'bg-[#F3F8F5] border-[#C9E3D3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pencil-sage-700" />
                  Sodium (Salt)
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    assessment.healthEvaluation.sodiumEvaluation.verdict === 'excessive'
                      ? 'bg-red-100 text-red-800'
                      : assessment.healthEvaluation.sodiumEvaluation.verdict === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-pencil-sage-100 text-pencil-sage-800'
                  }`}
                >
                  {assessment.healthEvaluation.sodiumEvaluation.verdict}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-serif font-bold text-coffee-950">
                    {assessment.healthEvaluation.sodiumEvaluation.productValue}mg
                  </span>
                  <span className="text-xs text-coffee-600">
                    / {assessment.healthEvaluation.sodiumEvaluation.recommendedDailyBudget}mg ceiling
                    ({assessment.healthEvaluation.sodiumEvaluation.percentageOfBudget}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      assessment.healthEvaluation.sodiumEvaluation.verdict === 'excessive'
                        ? 'bg-red-500'
                        : assessment.healthEvaluation.sodiumEvaluation.verdict === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-pencil-sage-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        assessment.healthEvaluation.sodiumEvaluation.percentageOfBudget
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-coffee-800">
                {assessment.healthEvaluation.sodiumEvaluation.userRecommendation}
              </p>
            </div>

            {/* Saturated Fat Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                assessment.healthEvaluation.fatEvaluation.verdict === 'excessive'
                  ? 'bg-[#FFF6F2] border-[#FCD0C0]'
                  : assessment.healthEvaluation.fatEvaluation.verdict === 'moderate'
                  ? 'bg-[#FEFDF0] border-[#FAF0AE]'
                  : 'bg-[#F3F8F5] border-[#C9E3D3]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-pencil-blue-700" />
                  Saturated Fat
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    assessment.healthEvaluation.fatEvaluation.verdict === 'excessive'
                      ? 'bg-red-100 text-red-800'
                      : assessment.healthEvaluation.fatEvaluation.verdict === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-pencil-sage-100 text-pencil-sage-800'
                  }`}
                >
                  {assessment.healthEvaluation.fatEvaluation.verdict}
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-serif font-bold text-coffee-950">
                    {assessment.healthEvaluation.fatEvaluation.productValue}g
                  </span>
                  <span className="text-xs text-coffee-600">
                    / {assessment.healthEvaluation.fatEvaluation.recommendedDailyBudget}g limit (
                    {assessment.healthEvaluation.fatEvaluation.percentageOfBudget}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      assessment.healthEvaluation.fatEvaluation.verdict === 'excessive'
                        ? 'bg-red-500'
                        : assessment.healthEvaluation.fatEvaluation.verdict === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-pencil-sage-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        assessment.healthEvaluation.fatEvaluation.percentageOfBudget
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-coffee-800">
                {assessment.healthEvaluation.fatEvaluation.userRecommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid: Explanations, Ingredients of Concern, and Nutrition Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personalized Reasons & Concerns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personalized Reasons */}
          <div className="card-warm bg-white border border-beige-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-beige-200 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-coffee-800" />
                <h2 className="text-base font-serif font-bold text-coffee-950">
                  Detailed Rule Evaluations ({assessment.personalizedReasons.length})
                </h2>
              </div>
            </div>

            {assessment.personalizedReasons.length === 0 ? (
              <div className="p-4 bg-[#E4F1E9] rounded-2xl border border-[#A7D1B7] text-[#275A3A] text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-pencil-sage-700 shrink-0" />
                <span>
                  No ingredient conflicts, unreadable warnings, or excessive nutrient thresholds were flagged against your active profile.
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {assessment.personalizedReasons.map((reason) => (
                  <div
                    key={reason.id}
                    className={`p-4 rounded-2xl border space-y-2 ${
                      reason.severity === 'alert'
                        ? 'bg-[#FFF6F2] border-[#FCD0C0] text-coffee-950'
                        : reason.severity === 'caution'
                        ? 'bg-[#FEFDF0] border-[#FAF0AE] text-coffee-950'
                        : 'bg-[#F3F8F5] border-[#C9E3D3] text-coffee-950'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {reason.severity === 'alert' ? (
                        <AlertTriangle className="w-4 h-4 text-pencil-peach-700 shrink-0 mt-0.5" />
                      ) : reason.severity === 'caution' ? (
                        <AlertTriangle className="w-4 h-4 text-[#87700E] shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-pencil-sage-700 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <strong className="text-xs sm:text-sm font-bold block text-coffee-950">
                          {reason.title}
                        </strong>
                        <p className="text-xs leading-relaxed text-coffee-800">{reason.explanation}</p>
                        <p className="text-[11px] font-mono text-coffee-600 bg-white/80 p-1.5 rounded-lg inline-block border border-beige-300">
                          Evidence: {reason.evidence}
                        </p>
                        {reason.referenceTitle && (
                          <div className="pt-1">
                            <span className="text-[11px] font-semibold text-pencil-sage-700 inline-flex items-center gap-1">
                              <span>Standard: {reason.referenceTitle}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients of Concern */}
          {assessment.ingredientsOfConcern && assessment.ingredientsOfConcern.length > 0 && (
            <div className="card-warm bg-white border border-beige-200 p-6 space-y-3">
              <h3 className="text-sm font-serif font-bold text-coffee-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-pencil-peach-600" />
                <span>Flagged Ingredients & Additives</span>
              </h3>
              <div className="space-y-2">
                {assessment.ingredientsOfConcern.map((concern, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FFF6F2] rounded-xl border border-[#FCD0C0] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#8D3418] block capitalize">
                        {concern.ingredient}
                      </span>
                      <p className="text-coffee-700 text-[11px] mt-0.5">{concern.context}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D3418] bg-[#FDE8E0] px-2 py-0.5 rounded border border-[#F7B29B]">
                      {concern.matchedReason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Ingredients Statement */}
          <div className="card-warm bg-white border border-beige-200 p-6 space-y-2">
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-coffee-900">
              Complete Ingredients Declaration
            </h3>
            <p className="text-xs text-coffee-700 leading-relaxed font-mono bg-beige-50 p-3 rounded-xl border border-beige-200 whitespace-pre-wrap">
              {activeProduct?.ingredientsText || 'No ingredients statement recorded on label.'}
            </p>
            {activeProduct?.allergenWarningText && (
              <p className="text-xs text-[#8D3418] font-semibold pt-1">
                Allergen Statement: {activeProduct.allergenWarningText}
              </p>
            )}
          </div>

          {/* Practical Next Steps */}
          <div className="bg-[#E4F1E9]/60 rounded-2xl border border-[#A7D1B7] p-6 space-y-3">
            <h3 className="text-sm font-serif font-bold text-[#275A3A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-pencil-sage-700" />
              <span>Recommended Next Steps</span>
            </h3>
            <ul className="space-y-2 text-xs text-coffee-800">
              {assessment.practicalNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-pencil-sage-700">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Nutrition Facts Table & Reference Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          {activeProduct?.nutrition && (
            <div className="flex justify-center">
              <NutritionFactsTable
                nutrition={activeProduct.nutrition}
                nutritionPer100g={activeProduct.nutritionPer100g}
                productName={assessment.productName}
              />
            </div>
          )}

          {/* Reference Citations */}
          <div className="card-warm bg-white border border-beige-200 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pencil-sage-600" />
              <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-coffee-900">
                Authoritative Reference Guidelines
              </h3>
            </div>
            <div className="space-y-2.5">
              {assessment.sources.map((src, i) => (
                <div key={i} className="text-xs p-3 bg-beige-50 rounded-xl border border-beige-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-coffee-950">{src.name}</strong>
                    <span className="text-[10px] text-coffee-500">{src.year}</span>
                  </div>
                  <p className="text-[11px] text-coffee-600 leading-tight">{src.note}</p>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-pencil-sage-700 underline flex items-center gap-1 font-semibold mt-1"
                    >
                      <span>{src.publisher}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
