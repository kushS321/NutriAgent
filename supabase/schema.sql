-- =========================================================================
-- NutriAgent Supabase Database Schema
-- Row Level Security (RLS) Enabled for all user tables
-- Aligned with FSSAI 2022 & ICMR-NIN 2024 Dietary Principles
-- =========================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  age_range TEXT,
  dietary_preferences TEXT[] DEFAULT '{}',
  primary_goal TEXT,
  allergies TEXT[] DEFAULT '{}',
  health_considerations TEXT[] DEFAULT '{}',
  custom_ingredients_to_avoid TEXT[] DEFAULT '{}',
  max_sodium_per_serving_mg INTEGER,
  max_added_sugar_per_serving_g INTEGER,
  calorie_target_daily INTEGER DEFAULT 2000,
  store_images_consent BOOLEAN DEFAULT FALSE,
  telemetry_consent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Scanned Assessments Table
CREATE TABLE IF NOT EXISTS public.scanned_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  status TEXT NOT NULL, -- 'fits_preferences', 'review_carefully', 'potential_conflict', 'not_enough_information'
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  personalized_reasons JSONB DEFAULT '[]'::jsonb,
  ingredients_of_concern JSONB DEFAULT '[]'::jsonb,
  uncertainties JSONB DEFAULT '[]'::jsonb,
  relevant_nutrients JSONB DEFAULT '[]'::jsonb,
  practical_next_steps TEXT[] DEFAULT '{}',
  sources JSONB DEFAULT '[]'::jsonb,
  provenance TEXT DEFAULT 'open_food_facts',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.scanned_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assessments"
  ON public.scanned_assessments FOR ALL
  USING (auth.uid() = user_id);

-- 3. Meal Logs (Food Diary) Table
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
  product_id TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  servings_count NUMERIC(4, 2) DEFAULT 1.0,
  serving_description TEXT,
  calories INTEGER DEFAULT 0,
  protein_g NUMERIC(5, 2) DEFAULT 0,
  carbs_g NUMERIC(5, 2) DEFAULT 0,
  fat_g NUMERIC(5, 2) DEFAULT 0,
  sugar_g NUMERIC(5, 2) DEFAULT 0,
  sodium_mg INTEGER DEFAULT 0,
  fiber_g NUMERIC(5, 2) DEFAULT 0,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and edit their own meal entries"
  ON public.meal_logs FOR ALL
  USING (auth.uid() = user_id);

-- 4. Product Comparison Table
CREATE TABLE IF NOT EXISTS public.product_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_a_name TEXT NOT NULL,
  product_b_name TEXT NOT NULL,
  comparison_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.product_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their product comparisons"
  ON public.product_comparisons FOR ALL
  USING (auth.uid() = user_id);

-- 5. Public Product Provenance & Cache Table (Read-only for public, writes by authenticated users)
CREATE TABLE IF NOT EXISTS public.cached_products (
  id TEXT PRIMARY KEY,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  ingredients_text TEXT,
  nutrition JSONB,
  veg_status TEXT,
  fssai_number TEXT,
  provenance TEXT DEFAULT 'open_food_facts',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cached_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached products"
  ON public.cached_products FOR SELECT
  TO PUBLIC USING (true);

-- 6. User Medical Documents Table (Private Storage Metadata with RLS)
CREATE TABLE IF NOT EXISTS public.user_medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL, -- 'blood_test', 'lipid_profile', 'glucose_hba1c', 'kidney_panel', 'doctor_instructions', 'other'
  notes TEXT,
  storage_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own medical documents"
  ON public.user_medical_documents FOR ALL
  USING (auth.uid() = user_id);

