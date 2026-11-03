# NutriAgent — Nutrition Rules & Regulatory Standards

NutriAgent's deterministic rules engine (`src/lib/assessment/rulesEngine.ts`) applies authoritative guidelines from the **Indian Council of Medical Research – National Institute of Nutrition (ICMR-NIN 2024)** and the **Food Safety and Standards Authority of India (FSSAI 2022)**.

---

## 🥗 1. ICMR-NIN 2024 Dietary Guidelines for Indians

### Guideline 3: Added Sugars & Simple Carbohydrates
- **Daily Budget Ceiling:** Added sugars must not exceed 5% of total daily energy intake—equating to **<25g/day** for a standard 2,000 kcal diet.
- **Diabetes & Prediabetes Consideration:** For individuals with diabetes, prediabetes, or sugar-conscious goals, NutriAgent lowers the daily added sugar ceiling to **≤15g/day** (and cautions against items containing >5g sugar per serving).
- **Single-Serving Warning Threshold:** Products with **>12.5g added sugar per serving** trigger a high-sugar advisory (representing >50% of the entire daily adult ceiling in a single snack).

### Guideline 5: Salt & Sodium Intake
- **Daily Salt Ceiling:** Sodium intake must remain under **<2,000mg/day** (equivalent to less than 5g of table salt per day).
- **Hypertension & Heart Health Consideration:** In accordance with the American Heart Association (AHA) and clinical cardiology benchmarks, individuals with elevated blood pressure have a stricter ceiling of **≤1,500mg/day**.
- **Per-Serving Thresholds:**
  - `≤ 140 mg`: Low sodium (FSSAI standard)
  - `> 350 mg`: Moderate sodium load (requires caution for hypertension)
  - `≥ 600 mg`: High sodium load (alerts consumer)

### Guideline 4: Saturated Fats & Industrial Trans Fats
- **Saturated Fat Ceiling:** Saturated fatty acids must be limited to **<10% of total daily energy** (<20g/day for a 2,000 kcal diet). For elevated cholesterol management, strict limits (<12g/day) apply.
- **Trans Fatty Acids:** Must be virtually zero. Any declared industrial trans fat triggers an alert.

---

## 🇮🇳 2. FSSAI Labelling and Display Regulations (2022 Gazette)

1. **Mandatory Fat Disclosures:**
   Whenever total fat exceeds **0.5%**, the label must explicitly declare saturated fatty acids and trans fatty acids. Missing declarations are flagged as label uncertainties.
2. **Industrial Trans Fat Cap:**
   Must not exceed **2% of total fats**.
3. **Vegetarian vs. Non-Vegetarian:**
   - **Green Dot in Square:** Vegetarian food containing plant and dairy ingredients.
   - **Brown Dot in Square:** Non-vegetarian food containing animal, meat, poultry, or fish tissues.

---

## 🌿 3. Indian Lifestyle & Religious Preferences

- **Jain Diet:** Strictly excludes underground root vegetables (potatoes, onions, garlic, radishes, carrots) and any animal derivatives.
- **Eggetarian Diet:** Allows eggs and egg albumin while strictly flagging meat, poultry, and seafood.
- **Pure Vegetarian Diet:** Allows dairy products (milk, ghee, butter, paneer) while excluding eggs and meat.
- **INS Additives Decoded:** Translates Indian INS codes (e.g. INS 621 MSG, INS 150d caramel color, INS 322 lecithin, INS 211 sodium benzoate) into their common names and allergen sources.
