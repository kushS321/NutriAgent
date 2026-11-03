# NutriAgent — System Architecture & Directory Map

This guide provides a clean overview of how the NutriAgent project is organized into **Frontend**, **Backend**, **Database**, **Tests**, and **Documentation** layers so you can locate and fix any issue quickly.

---

## 📂 High-Level Directory Overview

```
nutri-agent/
├── docs/                     # 📚 Documentation & Technical Specifications
│   ├── PROJECT_STRUCTURE.md  # (This file) Architecture & Directory Map
│   ├── API_REFERENCE.md      # Backend REST API endpoint documentation
│   └── NUTRITION_RULES.md    # ICMR-NIN 2024 & FSSAI 2022 calculation rules
│
├── src/
│   ├── app/                  # 🖥️ FRONTEND Pages & ⚙️ BACKEND API Routes (Next.js 14)
│   │   ├── (Frontend Pages)  # UI routes: /, /dashboard, /scan, /results, /profile...
│   │   └── api/              # ⚙️ BACKEND Server-Side Endpoints (/api/products, /api/assessment...)
│   │
│   ├── components/           # 🎨 FRONTEND Reusable UI Components
│   │   ├── auth/             # Login, Signup & 3D Animation components
│   │   ├── common/           # Banners, PWA installer
│   │   ├── layout/           # Navbar, Footer, Mobile BottomNav
│   │   └── nutrition/        # NutritionFactsTable, StatusBadge
│   │
│   ├── lib/                  # 🧠 BACKEND Services, Engines & Business Logic
│   │   ├── api/              # Open Food Facts API client
│   │   ├── assessment/       # Deterministic RulesEngine, AllergenDict, ComparisonEngine
│   │   ├── ocr/              # Camera OCR adapter & regex label parser
│   │   ├── storage/          # LocalStorage UserRepository & Supabase client
│   │   └── sampleProducts.ts # Verified packaged foods database (Indian & Global)
│   │
│   ├── tests/                # 🧪 AUTOMATED TESTS (Vitest)
│   │   ├── authAndProfile.test.ts
│   │   ├── rulesEngine.test.ts
│   │   ├── userRepository.test.ts
│   │   ├── ocrParsing.test.ts
│   │   └── comparisonEngine.test.ts
│   │
│   └── types/                # 🏷️ TypeScript Type Definitions (Data Models)
│       └── nutrition.ts
│
├── public/                   # 🌐 Static Assets & Public Downloads
│   ├── downloads/            # Exportable ZIP and CSV project packages
│   └── icon.svg              # App Logo & PWA Icons
│
├── supabase/                 # 🗄️ DATABASE
│   └── schema.sql            # PostgreSQL RLS tables: profiles, assessments, meals, docs
│
├── README.md                 # 📖 Main Project Readme & Quickstart
├── tailwind.config.ts        # 🎨 Theme configuration (warm beige, coffee, pencil colors)
├── package.json              # 📦 Dependencies & npm scripts
└── tsconfig.json             # ⚙️ TypeScript configuration
```

---

## 🖥️ 1. Frontend Layer (`src/app/` & `src/components/`)

All user interfaces are built with React Server & Client Components and styled with Tailwind CSS:

| Route / File | Category | Responsibility |
| :--- | :--- | :--- |
| `src/app/page.tsx` | Landing Page | Homepage, interactive sample scanner, feature overview |
| `src/app/dashboard/page.tsx` | User Dashboard | Daily calorie progress, macro meters, recent scans, today's meals |
| `src/app/scan/page.tsx` | Food Scanner | Camera barcode detector, manual barcode entry, product search, OCR upload |
| `src/app/review/page.tsx` | Human-in-the-Loop Review | Inspects extracted OCR numbers, confidence score, and allows editing |
| `src/app/results/[id]/page.tsx` | Verdict Page | "Can I Eat This?" output, personalized sugar & sodium budgets, FSSAI status |
| `src/app/meal-planner/page.tsx` | Daily Food Diary | Track Breakfast, Lunch, Dinner, Snacks against macro goals |
| `src/app/insights/page.tsx` | Health Trends | 7-day intake charts, ICMR-NIN guideline progress bars |
| `src/app/assistant/page.tsx` | Nutrition Assistant | Conversational AI chat with active food context and INS additives guide |
| `src/app/knowledge/page.tsx` | Food Glossary | Searchable macronutrients, micronutrients, and decoded INS additives |
| `src/app/compare/page.tsx` | Food Comparison | Side-by-side 100g normalized nutrient comparison |
| `src/app/auth/signin/page.tsx` | Authentication | Sign in form, 3D animation, remember me, forgot password modal |
| `src/app/auth/signup/page.tsx` | Authentication | Registration, password strength meter, terms consent |
| `src/app/profile/page.tsx` | User Profile | Tabbed sections A-G, completion meter, private medical document vault |
| `src/components/layout/` | Navigation Shell | Sticky Navbar with user status pill, Footer, and mobile BottomNav |
| `src/components/nutrition/` | Nutrition UI | NutritionFactsTable (per-serving & 100g toggle), StatusBadge |

---

## ⚙️ 2. Backend Layer (`src/app/api/` & `src/lib/`)

The backend consists of server-side API endpoints and business logic engines:

### API Endpoints (`src/app/api/`)
- `GET /api/products/[barcode]`: Proxy and cache Open Food Facts barcode lookup with server-side User-Agent.
- `GET /api/products/search?q={query}`: Multi-product text search from Open Food Facts API.
- `POST /api/assessment`: Evaluates product nutrition and ingredients against user profile.
- `POST /api/ocr/analyze`: Extracts nutrition facts and ingredients from uploaded food label images.
- `POST /api/compare`: Computes per-serving deltas and normalized 100g differences between 2 products.
- `POST /api/assistant`: Conversational assistant with active product context and rule-based fallback.

### Business Logic Engines (`src/lib/`)
- `src/lib/assessment/rulesEngine.ts`: **Core Algorithm** evaluating:
  - Allergen direct matches & cross-contact statements (`allergenDict.ts`)
  - ICMR-NIN 2024 Guideline 3 Added Sugars (<25g/day; <15g for diabetes)
  - Guideline 5 Sodium limit (<2,000mg/day; <1,500mg for hypertension)
  - FSSAI 2022 Saturated & Trans Fat declarations
  - Jain root vegetable and animal-derived exclusions
- `src/lib/storage/userRepository.ts`: Local-first persistence layer managing sessions, profiles, scan history, meal logs, and medical documents.
- `src/lib/storage/supabaseClient.ts`: REST client connecting to Supabase Auth & PostgREST.

---

## 🗄️ 3. Database Layer (`supabase/schema.sql`)

PostgreSQL schema configured with Row Level Security (RLS) guaranteeing user data isolation:
- `profiles`: User demographic, dietary preferences, allergens, and daily nutrition targets.
- `scanned_assessments`: Scanned food assessment history and personalized verdicts.
- `meal_logs`: Food diary entries across breakfast, lunch, dinner, and snacks.
- `product_comparisons`: Side-by-side product comparisons.
- `user_medical_documents`: Private medical document metadata and storage paths.

---

## 🧪 4. Testing Layer (`src/tests/`)

Automated tests running on Vitest:
- `npm test`: Runs all 27 unit tests across 5 test suites:
  1. `rulesEngine.test.ts`: Allergen detection, Jain rules, sugar & sodium thresholds.
  2. `authAndProfile.test.ts`: Registration, login, password strength, profile completion, document vault.
  3. `userRepository.test.ts`: Meal logging, aggregation, bookmark toggles, data export.
  4. `ocrParsing.test.ts`: Heuristic regex parser of nutrition facts labels.
  5. `comparisonEngine.test.ts`: 100g normalized comparison math.
