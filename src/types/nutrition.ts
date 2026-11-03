export type DietaryPreference =
  | 'vegan'
  | 'vegetarian'
  | 'eggetarian'
  | 'non_vegetarian'
  | 'jain'
  | 'pescatarian'
  | 'gluten_free'
  | 'dairy_free'
  | 'keto'
  | 'low_carb'
  | 'low_sodium'
  | 'halal'
  | 'kosher';

export type Allergen =
  | 'peanuts'
  | 'tree_nuts'
  | 'milk'
  | 'eggs'
  | 'fish'
  | 'shellfish'
  | 'wheat'
  | 'soy'
  | 'sesame'
  | 'sulfites'
  | 'mustard'
  | 'celery';

export type HealthConsideration =
  | 'diabetes_type1'
  | 'diabetes_type2'
  | 'prediabetes'
  | 'hypertension'
  | 'elevated_cholesterol'
  | 'kidney_disease'
  | 'gerd_acid_reflux'
  | 'celiac_disease'
  | 'heart_disease'
  | 'lactose_intolerance'
  | 'none_disclosed'
  | 'other';

export type NutritionGoal =
  | 'balanced_eating'
  | 'healthy_eating'
  | 'weight_gain'
  | 'weight_management'
  | 'weight_loss'
  | 'muscle_gain'
  | 'improved_protein'
  | 'reduced_sugar'
  | 'reduced_sodium'
  | 'improved_fibre'
  | 'sugar_conscious'
  | 'heart_health'
  | 'celiac_safe'
  | 'other';

export type MedicalDocumentType =
  | 'blood_test'
  | 'lipid_profile'
  | 'glucose_hba1c'
  | 'kidney_panel'
  | 'doctor_instructions'
  | 'other';

export interface UserDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  documentType: MedicalDocumentType;
  notes?: string;
  fileDataUrl?: string;
  storagePath?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  token?: string;
  rememberMe?: boolean;
  expiresAt?: string;
}

export interface TargetSourceInfo {
  source: 'user_entered' | 'general_guidance' | 'clinician_provided';
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  ageRange?: string; // e.g. "18-25", "26-40", "41-60", "60+"
  isGuest: boolean;
  
  // Section A - Basic Information
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'prefer_not_to_say' | 'female' | 'male' | 'non_binary' | 'other';
  heightCm?: number;
  weightKg?: number;
  preferredUnits?: 'metric' | 'imperial';
  countryOrRegion?: string;
  preferredLanguage?: string;

  // Section B - Dietary Goals
  dietaryGoals?: string[];
  additionalGoalsText?: string;
  primaryGoal?: NutritionGoal;

  // Section C - Dietary Preferences
  dietaryPreferences: DietaryPreference[];
  foodsPreferred?: string[];
  foodsAvoided?: string[];
  dietaryRestrictionsNotes?: string;
  religiousOrCulturalPreferences?: string;
  foodIntolerances?: string[];

  // Section D - Allergies & Intolerances
  allergies: Allergen[];
  customAllergens?: string[];
  customIngredientsToAvoid: string[];

  // Section E - Voluntary Health Considerations
  healthConsiderations: HealthConsideration[];
  medicalConditions?: string[];
  medicalNotes?: string;

  // Section F - Medical Documents
  documents?: UserDocument[];

  // Section G - Nutrition Targets & Preferences
  calorieTargetDaily?: number;
  proteinTargetG?: number;
  carbTargetG?: number;
  fatTargetG?: number;
  fiberTargetG?: number;
  maxSodiumPerServingMg?: number;
  sodiumTargetMg?: number;
  maxAddedSugarPerServingG?: number;
  sugarLimitG?: number;
  mealFrequency?: string;
  nutritionNotes?: string;
  targetSources?: Record<string, TargetSourceInfo>;

  privacySettings: {
    storeImagesConsent: boolean;
    telemetryConsent: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type ServingBasis = 'per_serving' | 'per_100g' | 'per_100ml';

export interface NutritionData {
  servingSize: string; // e.g. "2 bars (42g)" or "100g"
  servingSizeGrams?: number; // e.g. 42
  servingsPerContainer?: number; // e.g. 6
  servingBasis: ServingBasis;
  calories?: number;
  totalFatG?: number;
  saturatedFatG?: number;
  transFatG?: number;
  cholesterolMg?: number;
  sodiumMg?: number;
  totalCarbohydratesG?: number;
  dietaryFiberG?: number;
  totalSugarsG?: number;
  addedSugarsG?: number;
  proteinG?: number;
  vitaminDMcg?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
}

export type ProductProvenance =
  | 'open_food_facts'
  | 'ocr_extracted'
  | 'user_manual'
  | 'sample_catalog';

export interface ExtractedProduct {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category?: string;
  ingredientsText: string;
  parsedIngredients: string[];
  allergenWarningText?: string;
  nutrition: NutritionData;
  nutritionPer100g?: NutritionData;
  ocrConfidence: number; // 0-100
  imageUri?: string;
  uncertainFields: string[];
  scannedAt: string;
  isSampleData?: boolean;
  provenance?: ProductProvenance;
  fssaiNumber?: string;
  vegStatus?: 'veg' | 'non_veg' | 'egg' | 'unknown';
  novaGroup?: number; // 1-4 Ultra-processed indicator
  ecoScore?: string;
}

export type AssessmentStatus =
  | 'fits_preferences'
  | 'review_carefully'
  | 'potential_conflict'
  | 'not_enough_information';

export type ReasonSeverity = 'info' | 'caution' | 'alert';
export type ReasonCategory =
  | 'allergy'
  | 'dietary'
  | 'health'
  | 'serving'
  | 'ingredient'
  | 'uncertainty'
  | 'regulation';

export interface AssessmentReason {
  id: string;
  ruleId: string;
  category: ReasonCategory;
  severity: ReasonSeverity;
  title: string;
  explanation: string;
  evidence: string;
  referenceTitle?: string;
  referenceUrl?: string;
}

export interface IngredientConcern {
  ingredient: string;
  matchedReason: string;
  severity: 'high' | 'medium';
  context: string;
}

export interface RelevantNutrientInsight {
  name: string;
  value: number;
  unit: string;
  dailyValuePercentage?: number;
  rating: 'low' | 'moderate' | 'high';
  context: string;
}

export interface AssessmentSource {
  name: string;
  publisher: string;
  year: string;
  url?: string;
  note: string;
}

export interface HealthMetricEvaluation {
  metric: string;
  productValue: number;
  unit: string;
  recommendedDailyBudget: number;
  percentageOfBudget: number;
  verdict: 'optimal' | 'moderate' | 'excessive';
  userRecommendation: string;
}

export interface UserHealthEvaluation {
  profileName: string;
  isGuest: boolean;
  dietaryMatch: 'fits' | 'caution' | 'conflict';
  allergenClearance: 'cleared' | 'caution' | 'conflict' | 'unverified';
  allergenSummary: string;
  sugarEvaluation: HealthMetricEvaluation;
  sodiumEvaluation: HealthMetricEvaluation;
  fatEvaluation: HealthMetricEvaluation;
  calorieEvaluation?: HealthMetricEvaluation;
  proteinEvaluation?: HealthMetricEvaluation;
  overallHealthSummary: string;
}

export interface FoodAssessment {
  id: string;
  productId: string;
  productName: string;
  brand?: string;
  assessedAt: string;
  status: AssessmentStatus;
  headline: string;
  summary: string;
  personalizedReasons: AssessmentReason[];
  ingredientsOfConcern: IngredientConcern[];
  uncertainties: string[];
  relevantNutrients: RelevantNutrientInsight[];
  practicalNextSteps: string[];
  sources: AssessmentSource[];
  aiGeneratedInsight?: string;
  healthEvaluation?: UserHealthEvaluation;
  userProfileSnapshot: {
    dietaryPreferences: DietaryPreference[];
    allergies: Allergen[];
    healthConsiderations: HealthConsideration[];
  };
}

export interface ProductComparison {
  id: string;
  productA: ExtractedProduct;
  productB: ExtractedProduct;
  assessmentA: FoodAssessment;
  assessmentB: FoodAssessment;
  servingBasisComparison: 'per_serving' | 'per_100g';
  differences: {
    nutrient: string;
    valueA: number | undefined;
    valueB: number | undefined;
    unit: string;
    difference: number; // A - B
    higherIn: 'A' | 'B' | 'equal' | 'unknown';
    context: string;
  }[];
  tradeOffSummary: string;
  createdAt: string;
}

// Meal Planner & Food Diary Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LoggedMealItem {
  id: string;
  mealType: MealType;
  productId?: string;
  name: string;
  brand?: string;
  servingsCount: number; // e.g. 1.5 servings
  servingDescription: string; // e.g. "1 cup (150g)"
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  sodiumMg: number;
  fiberG: number;
  loggedAt: string; // ISO date-time
}

export interface DailyMealSummary {
  date: string; // YYYY-MM-DD
  items: LoggedMealItem[];
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    sugarG: number;
    sodiumMg: number;
    fiberG: number;
  };
}

// Nutrition Assistant Chat Message
export interface AssistantChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citations?: {
    source: string;
    guideline: string;
    url?: string;
  }[];
  suggestedFollowUps?: string[];
  productContext?: {
    name: string;
    status: AssessmentStatus;
  };
}
