# NutriAgent — Know Your Food. Know Your Health.

> **AI-Powered Packaged Food Label Scanner & Personal Nutrition Assistant**  
> *Answers the essential consumer question:* **“Can I Eat This?”** *with personalized health budgets, allergen clearance, and evidence-backed nutritional ratings.*

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-2D1E18?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-C85C40?logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-1.6-4D8F65?logo=vitest)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-D4B926?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 🥗 Core Capabilities

1. **"Can I Eat This?" Personalized Verdicts:**
   - Evaluates packaged food against your specific **Allergies**, **Chronic Conditions** (Hypertension, Diabetes, Cholesterol), and **Dietary Lifestyle** (Vegetarian, Vegan, Jain, Eggetarian, Halal).
   - Generates an explicit **Personalized Health & Sugar Match** showing exact serving nutrient amounts vs. your recommended daily budget (e.g. `<25g` added sugar/day; `<15g` for diabetes).
2. **Multi-Mode Scanner:**
   - Real-time camera barcode detector, manual barcode lookup via Open Food Facts API, text search by product name, and food label OCR photo upload.
3. **Daily Food Diary & Meal Tracker:**
   - Log foods across Breakfast, Lunch, Dinner, and Snacks with running calorie and macro bars.
4. **Nutritional Standards:**
   - Grounded in **ICMR–NIN 2024 Dietary Guidelines for Indians** and **FSSAI 2022 Labelling & Display Regulations**.
5. **Privacy First:**
   - Runs locally in Demo / Guest mode or connects to Supabase PostgreSQL with Row Level Security. Zero ad tracking.

---

## 📁 Clean Project Architecture

The codebase is organized into clear functional layers:

```
nutri-agent/
├── 📚 docs/                   # Documentation, API specifications, and calculation rules
│   ├── PROJECT_STRUCTURE.md   # Complete directory and module breakdown
│   ├── API_REFERENCE.md       # Backend REST API endpoint documentation
│   └── NUTRITION_RULES.md     # ICMR-NIN 2024 & FSSAI 2022 calculation benchmarks
│
├── 🖥️ src/app/                # Frontend Pages & Backend API Routes (Next.js 14)
│   ├── (Pages)                # /, /dashboard, /scan, /review, /results, /meal-planner...
│   ├── auth/                  # /auth/signin, /auth/signup
│   └── api/                   # Backend API: /api/products, /api/assessment, /api/ocr...
│
├── 🎨 src/components/         # Reusable UI Components
│   ├── auth/                  # Nutrition 3D visual component
│   ├── layout/                # Navbar, Footer, Mobile BottomNav
│   └── nutrition/             # NutritionFactsTable, StatusBadge
│
├── 🧠 src/lib/                # Backend Business Logic & Services
│   ├── assessment/            # Deterministic RulesEngine & Allergen dictionaries
│   ├── api/                   # Open Food Facts API integration
│   ├── storage/               # LocalStorage repository & Supabase REST client
│   └── sampleProducts.ts      # Indian & International packaged food database
│
├── 🧪 src/tests/              # Automated Vitest test suite (27 unit tests)
├── 🗄️ supabase/               # PostgreSQL schema & Row Level Security policies
└── 🌐 public/                 # Static assets and downloadable packages
```

---

## 🚀 Getting Started on Localhost

### Prerequisites
- Node.js v18.18+ or v20+ (Node v26.9 installed)
- npm v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Run Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Automated Testing

Run the full Vitest suite (27 passing tests across 5 test files):
```bash
npm test
```

Tested modules:
- `rulesEngine.test.ts`: Allergen matching, Jain restrictions, sugar & sodium ceilings.
- `authAndProfile.test.ts`: User registration, password validation, profile completion, document vault.
- `userRepository.test.ts`: Meal logging, daily aggregation, data exports.
- `ocrParsing.test.ts`: Label heuristic regex extraction.
- `comparisonEngine.test.ts`: 100g normalization math.

---

## 🏷️ Test Barcodes for Live Demo

Paste any of these real barcodes in the scanner (`/scan`):
- `8901058852461` — Maggi 2-Minute Masala Noodles (Wheat/Maida, High Sodium)
- `8901262010053` — Amul Pasteurized Butter (Dairy/Milk allergen, Saturated Fat)
- `8901063012621` — Britannia Good Day Cashew Cookies (Nuts allergen, Sugar)
- `8906070430018` — Epigamia Greek Yogurt (High Protein, Calcium)
- `016000275270` — Nature Valley Oats 'n Honey Granola Bar
- `856527003013` — Chobani Zero Sugar Yogurt

---

## 📄 License & Disclaimer
NutriAgent is an informational decision-support tool. It does not provide medical diagnoses or clinician prescriptions. Always consult a licensed healthcare professional for clinical medical nutrition therapy.
