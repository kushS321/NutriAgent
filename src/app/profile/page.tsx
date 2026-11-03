'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Sparkles,
  Save,
  Bookmark,
  LogOut,
  ArrowRight,
  Target,
  FileText,
  UploadCloud,
  FileCheck,
  Plus,
  X,
  ChevronRight,
  Heart,
  Activity,
  Info,
  Calendar,
  Layers,
  FileUp,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import {
  UserProfile,
  DietaryPreference,
  Allergen,
  HealthConsideration,
  NutritionGoal,
  UserDocument,
  MedicalDocumentType,
  TargetSourceInfo,
} from '@/types/nutrition';
import { SupabaseClient } from '@/lib/storage/supabaseClient';

type ProfileTab =
  | 'overview'
  | 'basic'
  | 'goals'
  | 'preferences'
  | 'allergies'
  | 'medical'
  | 'documents'
  | 'targets';

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Master Profile State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Section A: Basic Info
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [preferredUnits, setPreferredUnits] = useState<'metric' | 'imperial'>('metric');
  const [countryOrRegion, setCountryOrRegion] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // Section B: Dietary Goals
  const [dietaryGoals, setDietaryGoals] = useState<string[]>([]);
  const [additionalGoalsText, setAdditionalGoalsText] = useState('');

  // Section C: Dietary Preferences
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [foodsPreferred, setFoodsPreferred] = useState('');
  const [foodsAvoided, setFoodsAvoided] = useState('');
  const [dietaryRestrictionsNotes, setDietaryRestrictionsNotes] = useState('');
  const [religiousOrCulturalPreferences, setReligiousOrCulturalPreferences] = useState('');
  const [foodIntolerances, setFoodIntolerances] = useState('');

  // Section D: Allergies
  const [allergies, setAllergies] = useState<Allergen[]>([]);
  const [customAllergens, setCustomAllergens] = useState<string[]>([]);
  const [newCustomAllergenInput, setNewCustomAllergenInput] = useState('');
  const [customAvoid, setCustomAvoid] = useState('');

  // Section E: Medical Conditions (Voluntary)
  const [healthConsiderations, setHealthConsiderations] = useState<HealthConsideration[]>([]);
  const [medicalNotes, setMedicalNotes] = useState('');

  // Section F: Medical Documents
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [documentTypeToUpload, setDocumentTypeToUpload] =
    useState<MedicalDocumentType>('blood_test');
  const [documentNotes, setDocumentNotes] = useState('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<UserDocument | null>(null);

  // Section G: Nutrition Targets
  const [calorieTargetDaily, setCalorieTargetDaily] = useState<string>('2000');
  const [proteinTargetG, setProteinTargetG] = useState<string>('55');
  const [carbTargetG, setCarbTargetG] = useState<string>('250');
  const [fatTargetG, setFatTargetG] = useState<string>('65');
  const [fiberTargetG, setFiberTargetG] = useState<string>('30');
  const [sodiumTargetMg, setSodiumTargetMg] = useState<string>('2000');
  const [sugarLimitG, setSugarLimitG] = useState<string>('25');
  const [mealFrequency, setMealFrequency] = useState('3_meals_1_snack');
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [targetSource, setTargetSource] = useState<
    'user_entered' | 'general_guidance' | 'clinician_provided'
  >('general_guidance');

  // Modals
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);
  const [clearMedicalModalOpen, setClearMedicalModalOpen] = useState(false);

  // Load Initial Profile
  useEffect(() => {
    const prof = UserRepository.getProfile();
    setProfile(prof);

    // Section A
    setName(prof.name || 'Student Explorer');
    setAvatarUrl(prof.avatarUrl);
    setDateOfBirth(prof.dateOfBirth || '');
    setGender(prof.gender || 'prefer_not_to_say');
    setHeightCm(prof.heightCm ? String(prof.heightCm) : '');
    setWeightKg(prof.weightKg ? String(prof.weightKg) : '');
    setPreferredUnits(prof.preferredUnits || 'metric');
    setCountryOrRegion(prof.countryOrRegion || 'India');
    setPreferredLanguage(prof.preferredLanguage || 'English');

    // Section B
    setDietaryGoals(prof.dietaryGoals || (prof.primaryGoal ? [prof.primaryGoal] : ['healthy_eating']));
    setAdditionalGoalsText(prof.additionalGoalsText || '');

    // Section C
    setDietaryPreferences(prof.dietaryPreferences || ['vegetarian']);
    setFoodsPreferred((prof.foodsPreferred || []).join(', '));
    setFoodsAvoided((prof.foodsAvoided || []).join(', '));
    setDietaryRestrictionsNotes(prof.dietaryRestrictionsNotes || '');
    setReligiousOrCulturalPreferences(prof.religiousOrCulturalPreferences || '');
    setFoodIntolerances((prof.foodIntolerances || []).join(', '));

    // Section D
    setAllergies(prof.allergies || []);
    setCustomAllergens(prof.customAllergens || []);
    setCustomAvoid((prof.customIngredientsToAvoid || []).join(', '));

    // Section E
    setHealthConsiderations(prof.healthConsiderations || []);
    setMedicalNotes(prof.medicalNotes || '');

    // Section F
    const docs = UserRepository.getDocuments(prof.id);
    setDocuments(docs);

    // Section G
    setCalorieTargetDaily(prof.calorieTargetDaily ? String(prof.calorieTargetDaily) : '2000');
    setProteinTargetG(prof.proteinTargetG ? String(prof.proteinTargetG) : '55');
    setCarbTargetG(prof.carbTargetG ? String(prof.carbTargetG) : '250');
    setFatTargetG(prof.fatTargetG ? String(prof.fatTargetG) : '65');
    setFiberTargetG(prof.fiberTargetG ? String(prof.fiberTargetG) : '30');
    setSodiumTargetMg(
      prof.sodiumTargetMg
        ? String(prof.sodiumTargetMg)
        : prof.maxSodiumPerServingMg
        ? String(prof.maxSodiumPerServingMg * 4)
        : '2000'
    );
    setSugarLimitG(
      prof.sugarLimitG
        ? String(prof.sugarLimitG)
        : prof.maxAddedSugarPerServingG
        ? String(prof.maxAddedSugarPerServingG * 4)
        : '25'
    );
    setMealFrequency(prof.mealFrequency || '3_meals_1_snack');
    setNutritionNotes(prof.nutritionNotes || '');

    // Check if target source info is stored
    if (prof.targetSources && prof.targetSources.daily_targets) {
      setTargetSource(prof.targetSources.daily_targets.source);
    }
  }, []);

  if (!profile) return null;

  // Completion percentage
  const completion = UserRepository.calculateProfileCompletion(profile);

  // Toggle helpers
  const toggleGoal = (goal: string) => {
    setDietaryGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleDiet = (pref: DietaryPreference) => {
    setDietaryPreferences((prev) =>
      prev.includes(pref) ? prev.filter((d) => d !== pref) : [...prev, pref]
    );
  };

  const toggleAllergy = (allergy: Allergen) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const addCustomAllergen = () => {
    const clean = newCustomAllergenInput.trim().toLowerCase();
    if (!clean || customAllergens.includes(clean)) return;
    setCustomAllergens((prev) => [...prev, clean]);
    setNewCustomAllergenInput('');
  };

  const removeCustomAllergen = (item: string) => {
    setCustomAllergens((prev) => prev.filter((a) => a !== item));
  };

  const toggleHealth = (condition: HealthConsideration) => {
    if (condition === 'none_disclosed') {
      setHealthConsiderations(['none_disclosed']);
      return;
    }
    setHealthConsiderations((prev) => {
      const filtered = prev.filter((h) => h !== 'none_disclosed');
      return filtered.includes(condition)
        ? filtered.filter((h) => h !== condition)
        : [...filtered, condition];
    });
  };

  // Avatar Upload Handler
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Avatar image must be smaller than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Document Upload Handler (Section F)
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploadError(null);

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setDocUploadError('File exceeds 10MB limit. Please upload a smaller PDF or image.');
      return;
    }

    // Validate format
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setDocUploadError('Unsupported file type. Please upload a PDF, PNG, JPG, or WEBP document.');
      return;
    }

    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newDoc = UserRepository.addDocument({
        userId: profile.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentType: documentTypeToUpload,
        notes: documentNotes.trim() || undefined,
        fileDataUrl: dataUrl,
      });

      setDocuments((prev) => [newDoc, ...prev]);
      setIsUploadingDoc(false);
      setDocumentNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSaveSuccessMessage('Medical document safely uploaded to private storage.');
      setTimeout(() => setSaveSuccessMessage(null), 3500);
    };
    reader.onerror = () => {
      setDocUploadError('Failed to read file from disk.');
      setIsUploadingDoc(false);
    };
    reader.readAsDataURL(file);
  };

  // Document Deletion Handler
  const confirmDeleteDocument = () => {
    if (!docToDelete) return;
    UserRepository.deleteDocument(docToDelete.id, profile.id);
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
    setDocToDelete(null);
    setSaveSuccessMessage('Document permanently deleted from storage.');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Master Save Handler
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    const updatedProfile: UserProfile = {
      ...profile,
      name: name.trim() || 'Student Explorer',
      avatarUrl,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender as any,
      heightCm: heightCm ? parseFloat(heightCm) : undefined,
      weightKg: weightKg ? parseFloat(weightKg) : undefined,
      preferredUnits,
      countryOrRegion: countryOrRegion || undefined,
      preferredLanguage: preferredLanguage || 'English',

      // Goals
      dietaryGoals,
      additionalGoalsText: additionalGoalsText.trim() || undefined,
      primaryGoal: (dietaryGoals[0] as NutritionGoal) || 'healthy_eating',

      // Preferences
      dietaryPreferences,
      foodsPreferred: foodsPreferred
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean),
      foodsAvoided: foodsAvoided
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean),
      dietaryRestrictionsNotes: dietaryRestrictionsNotes.trim() || undefined,
      religiousOrCulturalPreferences: religiousOrCulturalPreferences.trim() || undefined,
      foodIntolerances: foodIntolerances
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean),

      // Allergies
      allergies,
      customAllergens,
      customIngredientsToAvoid: customAvoid
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean),

      // Medical
      healthConsiderations,
      medicalNotes: medicalNotes.trim() || undefined,

      // Targets
      calorieTargetDaily: calorieTargetDaily ? parseInt(calorieTargetDaily) : 2000,
      proteinTargetG: proteinTargetG ? parseFloat(proteinTargetG) : undefined,
      carbTargetG: carbTargetG ? parseFloat(carbTargetG) : undefined,
      fatTargetG: fatTargetG ? parseFloat(fatTargetG) : undefined,
      fiberTargetG: fiberTargetG ? parseFloat(fiberTargetG) : undefined,
      sodiumTargetMg: sodiumTargetMg ? parseInt(sodiumTargetMg) : 2000,
      maxSodiumPerServingMg: sodiumTargetMg ? Math.round(parseInt(sodiumTargetMg) / 4) : 500,
      sugarLimitG: sugarLimitG ? parseFloat(sugarLimitG) : 25,
      maxAddedSugarPerServingG: sugarLimitG ? Math.round(parseFloat(sugarLimitG) / 4) : 6,
      mealFrequency,
      nutritionNotes: nutritionNotes.trim() || undefined,
      targetSources: {
        daily_targets: {
          source: targetSource,
          notes: targetSource === 'clinician_provided' ? 'Prescribed by healthcare professional' : undefined,
        },
      },

      updatedAt: new Date().toISOString(),
    };

    UserRepository.saveProfile(updatedProfile);
    UserRepository.saveUserProfileById(profile.id, updatedProfile);
    setProfile(updatedProfile);
    setIsSaving(false);
    setSaveSuccessMessage('Your profile changes have been saved successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Sign out
  const handleSignOut = () => {
    UserRepository.logoutUser();
    router.push('/auth/signin');
  };

  // Clear Medical Data
  const handleClearMedical = () => {
    UserRepository.clearMedicalData();
    setHealthConsiderations([]);
    setMedicalNotes('');
    setDocuments([]);
    setClearMedicalModalOpen(false);
    setSaveSuccessMessage('All voluntary medical records and documents have been erased.');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  // Delete Account
  const handleDeleteAccount = () => {
    UserRepository.deleteAccount(profile.id);
    setDeleteAccountModalOpen(false);
    router.push('/');
  };

  // Export Data JSON
  const handleExportData = () => {
    const jsonStr = UserRepository.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriagent-personal-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Navigation tabs config
  const tabs: { id: ProfileTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'basic', label: 'Basic Info', icon: Layers },
    { id: 'goals', label: 'Dietary Goals', icon: Target },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'allergies', label: 'Allergies & Safety', icon: Shield },
    { id: 'medical', label: 'Health Conditions', icon: Activity },
    { id: 'documents', label: `Documents (${documents.length})`, icon: FileText },
    { id: 'targets', label: 'Nutrition Targets', icon: Sparkles },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-beige-300 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar / Photo with upload trigger */}
          <div className="relative group shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-beige-200 border-2 border-beige-300 overflow-hidden flex items-center justify-center text-coffee-800 shadow-subtle">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-coffee-600" />
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-coffee-900 text-white shadow-md hover:bg-coffee-800 transition-colors"
              title="Change avatar"
            >
              <FileUp className="w-3.5 h-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>

          {/* User Identifiers */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-coffee-950">
                {profile.isGuest ? 'Guest Explorer' : name}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  profile.isGuest
                    ? 'bg-beige-100 text-coffee-700 border-beige-300'
                    : 'bg-pencil-sage-50 text-pencil-sage-700 border-pencil-sage-200'
                }`}
              >
                {profile.isGuest ? 'Guest Mode' : 'Verified Member'}
              </span>
            </div>
            <p className="text-xs text-coffee-600">
              {profile.email || 'Local device storage — no cloud accounts linked'}
            </p>
            <p className="text-[11px] text-coffee-400">
              Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Profile Completion Meter & Save Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Completion Progress Gauge */}
          <div className="bg-beige-50/80 rounded-2xl border border-beige-200 p-3 flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-beige-200"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-pencil-sage-600 transition-all duration-700"
                  fill="transparent"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * completion.percentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-coffee-950">
                {completion.percentage}%
              </span>
            </div>
            <div className="text-left pr-2">
              <p className="text-xs font-bold text-coffee-900">Profile Complete</p>
              <p className="text-[10px] text-coffee-600">
                {completion.completedCount} of {completion.totalCount} core dietary sections
              </p>
            </div>
          </div>

          {/* Master Save Button */}
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="btn-pencil-brown text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-pencil-sage-300" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccessMessage && (
        <div className="p-3.5 bg-pencil-sage-50 border border-pencil-sage-200 text-pencil-sage-800 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-pencil-sage-600" />
          <span className="font-semibold">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Main Layout: Tab Navigation & Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation Tabs (Sidebar on desktop, horizontal scroll on mobile) */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-beige-300 p-2.5 shadow-card space-y-1 overflow-x-auto lg:overflow-visible flex lg:flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 lg:w-full text-left ${
                  isActive
                    ? 'bg-coffee-900 text-white shadow-sm'
                    : 'text-coffee-800 hover:bg-beige-100 hover:text-coffee-950'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-pencil-sage-300' : 'text-coffee-500'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}

          <div className="hidden lg:block pt-3 border-t border-beige-200 my-2 space-y-1">
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-coffee-700 hover:bg-beige-100"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All Data (JSON)</span>
            </button>
            <button
              onClick={() => setClearMedicalModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-pencil-peach-700 hover:bg-pencil-peach-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Medical Records</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-pencil-terracotta-700 hover:bg-pencil-terracotta-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="lg:col-span-9 bg-white rounded-3xl border border-beige-300 p-6 sm:p-8 shadow-card">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Profile Summary &amp; Dietary Snapshot
                </h2>
                <p className="text-xs text-coffee-600">
                  Review how your saved dietary boundaries power your food scans and meal suggestions.
                </p>
              </div>

              {/* Grid of Profile Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Goals */}
                <div className="p-4 rounded-2xl bg-beige-50/70 border border-beige-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-pencil-sage-600" />
                      Dietary Goals
                    </span>
                    <button
                      onClick={() => setActiveTab('goals')}
                      className="text-[11px] font-bold text-pencil-peach-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dietaryGoals.length > 0 ? (
                      dietaryGoals.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 rounded-lg bg-pencil-sage-100/70 text-pencil-sage-800 text-[11px] font-semibold"
                        >
                          {g.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-coffee-400 italic">No goals selected</span>
                    )}
                  </div>
                </div>

                {/* Card 2: Diet Preferences */}
                <div className="p-4 rounded-2xl bg-beige-50/70 border border-beige-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-pencil-peach-600" />
                      Dietary Lifestyle
                    </span>
                    <button
                      onClick={() => setActiveTab('preferences')}
                      className="text-[11px] font-bold text-pencil-peach-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dietaryPreferences.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-lg bg-pencil-peach-100/70 text-pencil-peach-800 text-[11px] font-semibold"
                      >
                        {d.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card 3: Allergies (Safety Critical) */}
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      Saved Allergens ({allergies.length + customAllergens.length})
                    </span>
                    <button
                      onClick={() => setActiveTab('allergies')}
                      className="text-[11px] font-bold text-red-700 hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[...allergies, ...customAllergens].length > 0 ? (
                      [...allergies, ...customAllergens].map((a) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 rounded-lg bg-red-100 text-red-800 text-[11px] font-bold border border-red-200"
                        >
                          {a.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-red-700 italic">No allergens declared</span>
                    )}
                  </div>
                </div>

                {/* Card 4: Daily Targets */}
                <div className="p-4 rounded-2xl bg-beige-50/70 border border-beige-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pencil-blue-600" />
                      Daily Targets
                    </span>
                    <button
                      onClick={() => setActiveTab('targets')}
                      className="text-[11px] font-bold text-pencil-peach-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 bg-white rounded-lg border border-beige-200">
                      <p className="text-[10px] text-coffee-500">Calories</p>
                      <p className="font-bold text-coffee-950">{calorieTargetDaily} kcal</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-beige-200">
                      <p className="text-[10px] text-coffee-500">Protein</p>
                      <p className="font-bold text-coffee-950">{proteinTargetG}g</p>
                    </div>
                    <div className="p-1.5 bg-white rounded-lg border border-beige-200">
                      <p className="text-[10px] text-coffee-500">Sodium</p>
                      <p className="font-bold text-coffee-950">&lt;{sodiumTargetMg}mg</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Quick View */}
              <div className="p-4 rounded-2xl bg-beige-50/60 border border-beige-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pencil-sage-100 text-pencil-sage-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-coffee-950">
                      Medical Documents ({documents.length})
                    </h4>
                    <p className="text-[11px] text-coffee-600">
                      {documents.length > 0
                        ? `${documents.length} private report${documents.length > 1 ? 's' : ''} stored locally`
                        : 'Upload lipid, glucose, or lab reports to keep on hand'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="px-3 py-1.5 rounded-xl border border-beige-300 text-xs font-semibold text-coffee-800 hover:bg-beige-100"
                >
                  View Files
                </button>
              </div>
            </div>
          )}

          {/* TAB A: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section A: Basic Information
                </h2>
                <p className="text-xs text-coffee-600">
                  Personalize your profile display. All fields except your name are voluntary.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-coffee-900">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Date of Birth (Optional)</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  >
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Height ({preferredUnits === 'metric' ? 'cm' : 'inches'})
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder={preferredUnits === 'metric' ? '170' : '67'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Current Weight ({preferredUnits === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder={preferredUnits === 'metric' ? '65' : '143'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Measurement Units</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreferredUnits('metric')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        preferredUnits === 'metric'
                          ? 'bg-coffee-900 text-white border-coffee-900'
                          : 'bg-beige-50 text-coffee-700 border-beige-300 hover:bg-beige-100'
                      }`}
                    >
                      Metric (kg, cm, g)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreferredUnits('imperial')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                        preferredUnits === 'imperial'
                          ? 'bg-coffee-900 text-white border-coffee-900'
                          : 'bg-beige-50 text-coffee-700 border-beige-300 hover:bg-beige-100'
                      }`}
                    >
                      Imperial (lbs, in, oz)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Country or Region</label>
                  <input
                    type="text"
                    value={countryOrRegion}
                    onChange={(e) => setCountryOrRegion(e.target.value)}
                    placeholder="e.g. India, United States"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Basic Info</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB B: DIETARY GOALS */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section B: Dietary &amp; Nutrition Goals
                </h2>
                <p className="text-xs text-coffee-600">
                  Select one or more goals to calibrate how NutriAgent evaluates macros and ingredients.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'healthy_eating', label: 'Healthy Eating' },
                  { id: 'weight_gain', label: 'Weight Gain' },
                  { id: 'weight_management', label: 'Weight Management' },
                  { id: 'weight_loss', label: 'Weight Loss' },
                  { id: 'muscle_gain', label: 'Muscle Gain' },
                  { id: 'improved_protein', label: 'Improved Protein Intake' },
                  { id: 'reduced_sugar', label: 'Reduced Sugar Intake' },
                  { id: 'reduced_sodium', label: 'Reduced Sodium Intake' },
                  { id: 'improved_fibre', label: 'Improved Fibre Intake' },
                  { id: 'balanced_nutrition', label: 'Balanced Nutrition' },
                  { id: 'other', label: 'Other Dietary Goals' },
                ].map((item) => {
                  const isSelected = dietaryGoals.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleGoal(item.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-pencil-sage-50 border-pencil-sage-300 text-pencil-sage-900 shadow-sm'
                          : 'bg-beige-50/60 border-beige-200 text-coffee-800 hover:bg-beige-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pencil-sage-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-coffee-900">
                  Additional Goal Notes or Specific Guidance
                </label>
                <textarea
                  rows={3}
                  value={additionalGoalsText}
                  onChange={(e) => setAdditionalGoalsText(e.target.value)}
                  placeholder="e.g. Aiming for 25g fibre daily, increasing whole grains and lentils"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Dietary Goals</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB C: DIETARY PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section C: Dietary Lifestyle Preferences
                </h2>
                <p className="text-xs text-coffee-600">
                  Configure dietary rules (e.g. Vegetarian, Jain, Halal) to detect non-conforming ingredients automatically.
                </p>
              </div>

              {/* Main Lifestyle Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'vegetarian' as DietaryPreference, label: 'Vegetarian' },
                  { id: 'vegan' as DietaryPreference, label: 'Vegan' },
                  { id: 'eggetarian' as DietaryPreference, label: 'Eggetarian' },
                  { id: 'non_vegetarian' as DietaryPreference, label: 'Non-Vegetarian' },
                  { id: 'pescatarian' as DietaryPreference, label: 'Pescatarian' },
                  { id: 'jain' as DietaryPreference, label: 'Jain' },
                  { id: 'gluten_free' as DietaryPreference, label: 'Gluten-Free' },
                  { id: 'dairy_free' as DietaryPreference, label: 'Dairy-Free' },
                  { id: 'low_sodium' as DietaryPreference, label: 'Low Sodium' },
                  { id: 'halal' as DietaryPreference, label: 'Halal' },
                  { id: 'kosher' as DietaryPreference, label: 'Kosher' },
                ].map((item) => {
                  const isSelected = dietaryPreferences.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDiet(item.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        isSelected
                          ? 'bg-pencil-peach-100 border-pencil-peach-300 text-pencil-peach-900 shadow-sm'
                          : 'bg-beige-50/60 border-beige-200 text-coffee-800 hover:bg-beige-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Specific Food Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Foods You Prefer (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={foodsPreferred}
                    onChange={(e) => setFoodsPreferred(e.target.value)}
                    placeholder="e.g. Oats, almonds, lentils, chia seeds"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Foods You Avoid (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={foodsAvoided}
                    onChange={(e) => setFoodsAvoided(e.target.value)}
                    placeholder="e.g. Palm oil, MSG, high-fructose corn syrup"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Religious or Cultural Dietary Customs (Voluntary)
                  </label>
                  <input
                    type="text"
                    value={religiousOrCulturalPreferences}
                    onChange={(e) => setReligiousOrCulturalPreferences(e.target.value)}
                    placeholder="e.g. Fasting foods (vrat), strictly kosher"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Known Intolerances (e.g. Lactose, Histamine)
                  </label>
                  <input
                    type="text"
                    value={foodIntolerances}
                    onChange={(e) => setFoodIntolerances(e.target.value)}
                    placeholder="e.g. Lactose intolerance, caffeine sensitivity"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Dietary Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB D: ALLERGIES & FOOD INTOLERANCES */}
          {activeTab === 'allergies' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                  <Shield className="w-3 h-3 text-red-600" />
                  <span>Safety-Critical Priority</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section D: Allergies &amp; Food Intolerances
                </h2>
                <p className="text-xs text-coffee-600">
                  Select your confirmed allergens. Whenever you scan a product, NutriAgent will cross-check ingredients, synonyms, and precautionary notices.
                </p>
              </div>

              {/* Safety Alert Callout */}
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  NutriAgent treats allergen flags with conservative safety logic. If a product label is incomplete, blurred, or missing an ingredient list, the app will <strong>never</strong> mark it allergen-free.
                </p>
              </div>

              {/* Standard Major Allergens */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-coffee-900">Major Food Allergens</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'peanuts' as Allergen, label: 'Peanuts' },
                    { id: 'tree_nuts' as Allergen, label: 'Tree Nuts' },
                    { id: 'milk' as Allergen, label: 'Milk / Dairy' },
                    { id: 'eggs' as Allergen, label: 'Eggs' },
                    { id: 'wheat' as Allergen, label: 'Wheat / Gluten' },
                    { id: 'soy' as Allergen, label: 'Soy' },
                    { id: 'sesame' as Allergen, label: 'Sesame' },
                    { id: 'fish' as Allergen, label: 'Fish' },
                    { id: 'shellfish' as Allergen, label: 'Shellfish' },
                    { id: 'mustard' as Allergen, label: 'Mustard' },
                    { id: 'sulfites' as Allergen, label: 'Sulfites' },
                    { id: 'celery' as Allergen, label: 'Celery' },
                  ].map((item) => {
                    const isSelected = allergies.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAllergy(item.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                          isSelected
                            ? 'bg-red-100 border-red-300 text-red-900 shadow-sm'
                            : 'bg-beige-50/60 border-beige-200 text-coffee-800 hover:bg-beige-100'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Allergens Section */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-coffee-900">Custom Allergens &amp; Triggers</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomAllergenInput}
                    onChange={(e) => setNewCustomAllergenInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomAllergen())}
                    placeholder="e.g. Strawberries, Kiwi, Tartrazine (Yellow 5)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                  <button
                    type="button"
                    onClick={addCustomAllergen}
                    className="px-4 py-2.5 rounded-xl bg-coffee-900 text-white text-xs font-bold hover:bg-coffee-800 transition-colors shrink-0"
                  >
                    Add Trigger
                  </button>
                </div>

                {customAllergens.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customAllergens.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 text-xs font-bold"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomAllergen(item)}
                          className="hover:text-red-950"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Allergies</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB E: MEDICAL CONDITIONS & HEALTH CONSIDERATIONS */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pencil-blue-100 text-pencil-blue-800 text-[10px] font-bold">
                  <Stethoscope className="w-3 h-3 text-pencil-blue-600" />
                  <span>Voluntary Disclosure</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section E: Health Considerations
                </h2>
                <p className="text-xs text-coffee-600">
                  Optionally indicate health considerations so NutriAgent can apply established public guidelines (like AHA sodium limits or ICMR-NIN sugar limits).
                </p>
              </div>

              {/* Clinical Scope Notice */}
              <div className="p-3.5 bg-beige-50 rounded-2xl border border-beige-300 text-xs text-coffee-800 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-pencil-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Important Notice:</strong> NutriAgent is an educational decision-support tool. It does <strong>not</strong> provide medical diagnoses, treatment plans, or clinician prescriptions. Only provide information you are comfortable saving on your device.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'hypertension' as HealthConsideration, label: 'High Blood Pressure / Hypertension' },
                  { id: 'diabetes_type2' as HealthConsideration, label: 'Type 2 Diabetes / Prediabetes' },
                  { id: 'elevated_cholesterol' as HealthConsideration, label: 'High Cholesterol / Lipid Management' },
                  { id: 'heart_disease' as HealthConsideration, label: 'Heart-related Considerations' },
                  { id: 'kidney_disease' as HealthConsideration, label: 'Kidney-related Dietary Restrictions' },
                  { id: 'celiac_disease' as HealthConsideration, label: 'Celiac Disease (Strict Gluten Free)' },
                  { id: 'lactose_intolerance' as HealthConsideration, label: 'Lactose Intolerance' },
                  { id: 'none_disclosed' as HealthConsideration, label: 'No Conditions Disclosed' },
                ].map((item) => {
                  const isSelected = healthConsiderations.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleHealth(item.id)}
                      className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-pencil-blue-50 border-pencil-blue-300 text-pencil-blue-900 shadow-sm'
                          : 'bg-beige-50/60 border-beige-200 text-coffee-800 hover:bg-beige-100'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pencil-blue-700 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-coffee-900">
                  Doctor or Clinician Notes (Voluntary)
                </label>
                <textarea
                  rows={3}
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="e.g. My physician advised keeping single-serving sodium under 400mg and avoiding artificial sweeteners."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Health Considerations</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB F: MEDICAL DOCUMENTS UPLOAD */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pencil-sage-100 text-pencil-sage-800 text-[10px] font-bold">
                  <Lock className="w-3 h-3 text-pencil-sage-600" />
                  <span>End-to-End Private Document Vault</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section F: Medical Documents &amp; Lab Reports
                </h2>
                <p className="text-xs text-coffee-600">
                  Securely store blood test results, lipid profiles, or doctor dietary instructions.
                </p>
              </div>

              {/* Privacy Notice on Medical Reports */}
              <div className="p-3.5 bg-beige-50 rounded-2xl border border-beige-200 text-xs text-coffee-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-coffee-950">
                  <Shield className="w-3.5 h-3.5 text-pencil-sage-700" />
                  Strict Privacy Standard
                </p>
                <p className="text-[11px] leading-relaxed text-coffee-700">
                  Your medical documents are stored privately in your authenticated account repository.
                  They are <strong>never</strong> transmitted to third-party advertisers or external analytics platforms.
                </p>
              </div>

              {/* Upload Interface */}
              <div className="border-2 border-dashed border-beige-300 rounded-3xl p-6 sm:p-8 text-center bg-beige-50/40 hover:bg-beige-50 transition-colors space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-coffee-800 text-white flex items-center justify-center mx-auto shadow-md">
                  <UploadCloud className="w-6 h-6 text-pencil-sage-300" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-coffee-950">Upload Medical Document</h4>
                  <p className="text-xs text-coffee-600">
                    PDF, PNG, JPG, or WEBP up to 10MB
                  </p>
                </div>

                {/* Document Type Selector & Notes */}
                <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-coffee-800">Document Type</label>
                    <select
                      value={documentTypeToUpload}
                      onChange={(e) => setDocumentTypeToUpload(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-beige-300 bg-white text-xs text-coffee-950"
                    >
                      <option value="blood_test">Blood Test Report</option>
                      <option value="lipid_profile">Lipid Profile / Cholesterol</option>
                      <option value="glucose_hba1c">Glucose / HbA1c Report</option>
                      <option value="kidney_panel">Kidney Function Test</option>
                      <option value="doctor_instructions">Doctor Dietary Instructions</option>
                      <option value="other">Other Health Record</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-coffee-800">Optional Label / Note</label>
                    <input
                      type="text"
                      value={documentNotes}
                      onChange={(e) => setDocumentNotes(e.target.value)}
                      placeholder="e.g. Oct 2026 Checkup"
                      className="w-full px-3 py-2 rounded-xl border border-beige-300 bg-white text-xs text-coffee-950"
                    />
                  </div>
                </div>

                {docUploadError && (
                  <p className="text-xs text-red-600 font-semibold">{docUploadError}</p>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isUploadingDoc}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-coffee-900 text-white font-bold text-xs hover:bg-coffee-800 shadow-sm disabled:opacity-50"
                  >
                    <FileUp className="w-4 h-4 text-pencil-sage-300" />
                    <span>{isUploadingDoc ? 'Storing Document...' : 'Browse & Upload Document'}</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                </div>
              </div>

              {/* Uploaded Documents List */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-coffee-900 flex items-center justify-between">
                  <span>Your Stored Documents ({documents.length})</span>
                </h3>

                {documents.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-beige-50/60 border border-beige-200 text-coffee-500 text-xs">
                    No documents uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-beige-50/70 border border-beige-200 flex items-center justify-between gap-3 hover:bg-beige-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-pencil-sage-100 text-pencil-sage-800 flex items-center justify-center shrink-0">
                            <FileCheck className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-coffee-950 truncate">
                              {doc.fileName}
                            </p>
                            <p className="text-[10px] text-coffee-600 flex items-center gap-2">
                              <span className="capitalize">{doc.documentType.replace(/_/g, ' ')}</span>
                              <span>•</span>
                              <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                              <span>•</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </p>
                            {doc.notes && (
                              <p className="text-[10px] text-coffee-500 italic mt-0.5">
                                &quot;{doc.notes}&quot;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {doc.fileDataUrl && (
                            <a
                              href={doc.fileDataUrl}
                              download={doc.fileName}
                              className="p-2 rounded-xl text-coffee-700 hover:text-coffee-950 hover:bg-beige-200 transition-colors"
                              title="Download document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            className="p-2 rounded-xl text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB G: NUTRITION TARGETS */}
          {activeTab === 'targets' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pencil-yellow-100 text-pencil-yellow-800 text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-pencil-yellow-600" />
                  <span>Customizable Daily Thresholds</span>
                </div>
                <h2 className="text-lg font-serif font-bold text-coffee-950">
                  Section G: Nutrition Targets &amp; Ceilings
                </h2>
                <p className="text-xs text-coffee-600">
                  Set daily calorie and macro limits based on your personal regimen or doctor advice.
                </p>
              </div>

              {/* Source Indicator */}
              <div className="p-3.5 bg-beige-50 rounded-2xl border border-beige-200 space-y-2">
                <label className="text-xs font-bold text-coffee-900 block">
                  Target Origin / Authority Reference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetSource('general_guidance')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetSource === 'general_guidance'
                        ? 'bg-coffee-900 text-white border-coffee-900'
                        : 'bg-white text-coffee-700 border-beige-300 hover:bg-beige-100'
                    }`}
                  >
                    ICMR-NIN 2024 Reference
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSource('user_entered')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetSource === 'user_entered'
                        ? 'bg-coffee-900 text-white border-coffee-900'
                        : 'bg-white text-coffee-700 border-beige-300 hover:bg-beige-100'
                    }`}
                  >
                    User Self-Defined
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetSource('clinician_provided')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      targetSource === 'clinician_provided'
                        ? 'bg-pencil-blue-700 text-white border-pencil-blue-700'
                        : 'bg-white text-coffee-700 border-beige-300 hover:bg-beige-100'
                    }`}
                  >
                    Clinician Prescribed
                  </button>
                </div>
              </div>

              {/* Target Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Daily Calories (kcal)</label>
                  <input
                    type="number"
                    value={calorieTargetDaily}
                    onChange={(e) => setCalorieTargetDaily(e.target.value)}
                    placeholder="2000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Protein Target (g)</label>
                  <input
                    type="number"
                    value={proteinTargetG}
                    onChange={(e) => setProteinTargetG(e.target.value)}
                    placeholder="55"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Carbohydrates Target (g)</label>
                  <input
                    type="number"
                    value={carbTargetG}
                    onChange={(e) => setCarbTargetG(e.target.value)}
                    placeholder="250"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Total Fat Target (g)</label>
                  <input
                    type="number"
                    value={fatTargetG}
                    onChange={(e) => setFatTargetG(e.target.value)}
                    placeholder="65"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">Dietary Fibre Target (g)</label>
                  <input
                    type="number"
                    value={fiberTargetG}
                    onChange={(e) => setFiberTargetG(e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Max Sodium Limit (mg)
                  </label>
                  <input
                    type="number"
                    value={sodiumTargetMg}
                    onChange={(e) => setSodiumTargetMg(e.target.value)}
                    placeholder="2000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-coffee-900">
                    Added Sugar Ceiling (g)
                  </label>
                  <input
                    type="number"
                    value={sugarLimitG}
                    onChange={(e) => setSugarLimitG(e.target.value)}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950 focus:outline-none focus:ring-2 focus:ring-coffee-700"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-coffee-900">Meal Frequency</label>
                  <select
                    value={mealFrequency}
                    onChange={(e) => setMealFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-beige-300 bg-beige-50/50 text-xs sm:text-sm text-coffee-950"
                  >
                    <option value="3_meals_1_snack">3 Meals + 1 Snack (Recommended)</option>
                    <option value="3_meals_2_snacks">3 Meals + 2 Snacks</option>
                    <option value="2_meals_intermittent">2 Meals (Intermittent Fasting)</option>
                    <option value="5_small_meals">5 Small Meals (High Frequency)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="btn-pencil-brown text-xs py-2 px-4 font-bold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Nutrition Targets</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Document Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-beige-300 p-6 max-w-sm w-full shadow-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-coffee-950">Delete Medical Document?</h3>
              <p className="text-xs text-coffee-600">
                Are you sure you want to permanently delete <strong>{docToDelete.fileName}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-coffee-700 hover:bg-beige-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDocument}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Medical Records Modal */}
      {clearMedicalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-beige-300 p-6 max-w-sm w-full shadow-card space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-coffee-950">Erase All Medical Records?</h3>
              <p className="text-xs text-coffee-600">
                This will clear all voluntary health conditions, doctor notes, and uploaded lab
                documents from your local profile. Your dietary preferences and allergies will remain
                intact.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setClearMedicalModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-coffee-700 hover:bg-beige-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearMedical}
                className="flex-1 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
              >
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
