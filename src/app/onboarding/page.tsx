'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  Heart,
  AlertTriangle,
  Lock,
  Utensils,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import {
  DietaryPreference,
  Allergen,
  HealthConsideration,
  NutritionGoal,
  UserProfile,
} from '@/types/nutrition';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Profile Form State
  const [name, setName] = useState('Student Explorer');
  const [ageRange, setAgeRange] = useState('18-25');
  const [primaryGoal, setPrimaryGoal] = useState<NutritionGoal>('balanced_eating');
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>(['vegetarian']);
  const [allergies, setAllergies] = useState<Allergen[]>(['peanuts']);
  const [healthConsiderations, setHealthConsiderations] = useState<HealthConsideration[]>(['hypertension']);
  const [customAvoid, setCustomAvoid] = useState('palm oil, high fructose corn syrup');
  const [storeImagesConsent, setStoreImagesConsent] = useState(false);

  useEffect(() => {
    const existing = UserRepository.getProfile();
    setName(existing.name || 'Student Explorer');
    setAgeRange(existing.ageRange || '18-25');
    setPrimaryGoal(existing.primaryGoal || 'balanced_eating');
    setDietaryPreferences(existing.dietaryPreferences || ['vegetarian']);
    setAllergies(existing.allergies || []);
    setHealthConsiderations(existing.healthConsiderations || []);
    setCustomAvoid((existing.customIngredientsToAvoid || ['palm oil']).join(', '));
    setStoreImagesConsent(existing.privacySettings?.storeImagesConsent || false);
  }, []);

  const toggleDiet = (item: DietaryPreference) => {
    setDietaryPreferences((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const toggleAllergy = (item: Allergen) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const toggleHealth = (item: HealthConsideration) => {
    setHealthConsiderations((prev) =>
      prev.includes(item) ? prev.filter((h) => h !== item) : [...prev, item]
    );
  };

  const handleFinish = () => {
    const customList = customAvoid
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedProfile: UserProfile = {
      id: 'user-profile-saved',
      name: name.trim() || 'Student Explorer',
      ageRange,
      isGuest: true,
      primaryGoal,
      dietaryPreferences,
      allergies,
      healthConsiderations,
      customIngredientsToAvoid: customList,
      privacySettings: {
        storeImagesConsent,
        telemetryConsent: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    UserRepository.saveProfile(updatedProfile);
    router.push('/dashboard');
  };

  const dietOptions: { id: DietaryPreference; label: string; desc: string }[] = [
    { id: 'vegetarian', label: 'Vegetarian', desc: 'No meat, fish, or poultry. Allows dairy products.' },
    { id: 'vegan', label: '100% Vegan', desc: 'Strict plant-based. Avoids meat, dairy, eggs, honey, and gelatin.' },
    { id: 'eggetarian', label: 'Eggetarian', desc: 'Allows eggs and dairy; excludes meat, poultry, and fish.' },
    { id: 'jain', label: 'Jain Vegetarian', desc: 'Excludes meat, eggs, and underground roots (onion, garlic, potato).' },
    { id: 'gluten_free', label: 'Gluten-Free', desc: 'Avoids wheat, barley, rye, and malt.' },
    { id: 'dairy_free', label: 'Dairy-Free', desc: 'Avoids milk, cheese, butter, whey, and casein.' },
    { id: 'low_sodium', label: 'Low Sodium Conscious', desc: 'Prioritizes foods with <140mg sodium per serving.' },
    { id: 'halal', label: 'Halal Conscious', desc: 'Avoids pork, non-halal gelatin, and alcohol.' },
  ];

  const goalOptions: { id: NutritionGoal; label: string; desc: string }[] = [
    { id: 'balanced_eating', label: 'Balanced Daily Eating', desc: 'Follow ICMR-NIN guidelines for whole foods and healthy macros.' },
    { id: 'weight_management', label: 'Weight Management', desc: 'Monitor caloric density, saturated fats, and hidden added sugars.' },
    { id: 'muscle_gain', label: 'Muscle Building & Protein', desc: 'Target 0.8–1.2g protein per kg of body weight with whole pulses and dairy.' },
    { id: 'sugar_conscious', label: 'Sugar Conscious', desc: 'Strictly monitor added sugars (<25g/day limit under ICMR-NIN Guideline 3).' },
    { id: 'heart_health', label: 'Heart & Blood Pressure', desc: 'Limit sodium (<2,000mg/day) and restrict palm oil saturated fats.' },
    { id: 'celiac_safe', label: 'Strict Celiac Safety', desc: 'Strict avoidance of gluten grains and facility cross-contact warnings.' },
  ];

  const allergyOptions: { id: Allergen; label: string }[] = [
    { id: 'peanuts', label: 'Peanuts / Groundnuts' },
    { id: 'tree_nuts', label: 'Tree Nuts (Almonds, Cashews, Walnuts)' },
    { id: 'milk', label: 'Milk / Dairy (Whey, Casein, Lactose)' },
    { id: 'eggs', label: 'Eggs (Albumin, Lysozyme)' },
    { id: 'wheat', label: 'Wheat (Gluten, Atta, Maida)' },
    { id: 'soy', label: 'Soy / Soya (Soy Lecithin, TVP)' },
    { id: 'mustard', label: 'Mustard / Sarson' },
    { id: 'sesame', label: 'Sesame / Til' },
    { id: 'fish', label: 'Fish' },
    { id: 'shellfish', label: 'Crustaceans & Shellfish' },
    { id: 'sulfites', label: 'Sulfites (INS 220-224)' },
  ];

  const healthOptions: { id: HealthConsideration; label: string; note: string }[] = [
    {
      id: 'hypertension',
      label: 'Hypertension / Blood Pressure',
      note: 'Monitors sodium against ICMR-NIN & WHO ceiling (<2,000 mg/day; caution >350mg/serving).',
    },
    {
      id: 'diabetes_type2',
      label: 'Type 2 Diabetes / Prediabetes',
      note: 'Flags added sugars >10g/serving and warns on refined carbs with low fiber (<2g).',
    },
    {
      id: 'elevated_cholesterol',
      label: 'Elevated LDL Cholesterol',
      note: 'Evaluates saturated fat (>4g) and alerts on any industrial trans fat.',
    },
    {
      id: 'celiac_disease',
      label: 'Celiac Disease',
      note: 'Strict exclusion of gluten-containing grains (wheat, barley, rye) and equipment warnings.',
    },
    {
      id: 'gerd_acid_reflux',
      label: 'Acid Reflux / GERD',
      note: 'Flags concentrated citric acid, high sodium, and sharp spices.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Step Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-coffee-600">
          <span>Step {step} of 4</span>
          <button
            onClick={() => handleFinish()}
            className="text-pencil-terracotta-600 hover:underline font-bold"
          >
            Skip for Now →
          </button>
        </div>
        <div className="w-full bg-beige-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-coffee-800 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: Basic Info & Primary Goal */}
      {step === 1 && (
        <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="badge-pencil-sage">Profile Setup</div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Welcome to NutriAgent
            </h1>
            <p className="text-xs sm:text-sm text-coffee-600">
              Tell us a little about your nutritional goals so we can tailor the "Can I Eat This?" assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-coffee-800 block mb-1">
                Your Name or Preferred Nickname
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-coffee-800 block mb-1">
                Age Range (For Caloric & Nutrient Reference)
              </label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-beige-50 border border-beige-300 rounded-xl text-coffee-950"
              >
                <option value="18-25">18 – 25 years (College / Young Adult)</option>
                <option value="26-40">26 – 40 years</option>
                <option value="41-60">41 – 60 years</option>
                <option value="60+">60+ years</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-xs font-serif font-bold text-coffee-900 uppercase tracking-wider block">
              Primary Nutrition Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goalOptions.map((goal) => {
                const isSelected = primaryGoal === goal.id;
                return (
                  <div
                    key={goal.id}
                    onClick={() => setPrimaryGoal(goal.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#E4F1E9] border-[#A7D1B7] text-[#275A3A] shadow-subtle'
                        : 'bg-beige-50 border-beige-200 hover:border-coffee-400 text-coffee-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold">{goal.label}</strong>
                      {isSelected && <Check className="w-4 h-4 text-[#275A3A]" />}
                    </div>
                    <p className="text-[11px] text-coffee-600 mt-1">{goal.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-beige-200">
            <button
              onClick={() => setStep(2)}
              className="btn-pencil-brown text-xs py-2.5 px-6 font-bold"
            >
              <span>Next: Dietary Lifestyle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Dietary Lifestyle & Avoided Ingredients */}
      {step === 2 && (
        <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="badge-pencil-peach">Dietary Rules</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Dietary Preferences
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              Select any dietary lifestyle rules that apply. You can select multiple.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dietOptions.map((diet) => {
              const isSelected = dietaryPreferences.includes(diet.id);
              return (
                <div
                  key={diet.id}
                  onClick={() => toggleDiet(diet.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FDE8E0] border-[#F7B29B] text-[#8D3418] shadow-subtle'
                      : 'bg-beige-50 border-beige-200 hover:border-coffee-400 text-coffee-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold">{diet.label}</strong>
                    {isSelected && <Check className="w-4 h-4 text-[#8D3418]" />}
                  </div>
                  <p className="text-[11px] text-coffee-600 mt-1">{diet.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Custom Ingredients to Avoid */}
          <div className="space-y-2 pt-2 border-t border-beige-200">
            <label className="text-xs font-serif font-bold text-coffee-900 block">
              Specific Ingredients to Avoid (Optional)
            </label>
            <input
              type="text"
              value={customAvoid}
              onChange={(e) => setCustomAvoid(e.target.value)}
              placeholder="e.g. palm oil, high fructose corn syrup, msg, artificial sweeteners"
              className="w-full px-3.5 py-2.5 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
            />
            <span className="text-[11px] text-coffee-500 block">
              Comma-separated. NutriAgent flags these in any scanned ingredients list.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-beige-200">
            <button
              onClick={() => setStep(1)}
              className="btn-pencil-peach text-xs py-2.5 px-5 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-pencil-brown text-xs py-2.5 px-6 font-bold"
            >
              <span>Next: Food Allergies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Allergies */}
      {step === 3 && (
        <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="badge-pencil-peach">Safety First</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Food Allergies & Intolerances
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              NutriAgent uses conservative synonym matching to protect you from declared allergens.
            </p>
          </div>

          <div className="p-3 bg-[#FFF6F2] rounded-2xl border border-[#FCD0C0] text-xs text-[#8D3418] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-pencil-peach-600 shrink-0 mt-0.5" />
            <span>
              If you have severe anaphylactic allergies, always inspect physical packaging. Incomplete label records cannot guarantee zero cross-contamination.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {allergyOptions.map((allergy) => {
              const isSelected = allergies.includes(allergy.id);
              return (
                <div
                  key={allergy.id}
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`p-3 rounded-2xl border cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-[#FFF6F2] border-[#FCD0C0] text-[#8D3418] font-bold shadow-subtle'
                      : 'bg-beige-50 border-beige-200 hover:border-coffee-400 text-coffee-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{allergy.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#8D3418]" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-beige-200">
            <button
              onClick={() => setStep(2)}
              className="btn-pencil-peach text-xs py-2.5 px-5 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(4)}
              className="btn-pencil-brown text-xs py-2.5 px-6 font-bold"
            >
              <span>Next: Health Priorities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Health Considerations & Privacy */}
      {step === 4 && (
        <div className="card-warm bg-white border border-beige-200 p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <div className="badge-pencil-blue">Health Guidance</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950">
              Health-Related Dietary Priorities
            </h2>
            <p className="text-xs sm:text-sm text-coffee-600">
              Select any conditions you manage. This information is used strictly to tailor nutrient thresholds, never as a medical diagnosis.
            </p>
          </div>

          <div className="space-y-2.5">
            {healthOptions.map((health) => {
              const isSelected = healthConsiderations.includes(health.id);
              return (
                <div
                  key={health.id}
                  onClick={() => toggleHealth(health.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FAF0AE] border-[#F5E47E] text-[#715707] shadow-subtle'
                      : 'bg-beige-50 border-beige-200 hover:border-coffee-400 text-coffee-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold">{health.label}</strong>
                    {isSelected && <Check className="w-4 h-4 text-[#715707]" />}
                  </div>
                  <p className="text-[11px] text-coffee-600 mt-1">{health.note}</p>
                </div>
              );
            })}
          </div>

          {/* Privacy & Image Consent */}
          <div className="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-coffee-900">
              <Lock className="w-3.5 h-3.5 text-pencil-sage-600" />
              <span>Local Privacy Guarantee</span>
            </div>
            <p className="text-coffee-600 leading-relaxed">
              Your profile is stored locally on your device in your browser. We never share your personal health restrictions with third-party advertisers.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-beige-200">
            <button
              onClick={() => setStep(3)}
              className="btn-pencil-peach text-xs py-2.5 px-5 font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleFinish}
              className="btn-pencil-brown text-xs py-2.5 px-7 font-bold shadow-warm"
            >
              <span>Save Profile & Open Dashboard</span>
              <CheckCircle2 className="w-4 h-4 text-pencil-sage-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
