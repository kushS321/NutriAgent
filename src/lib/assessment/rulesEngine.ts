import {
  UserProfile,
  ExtractedProduct,
  FoodAssessment,
  AssessmentStatus,
  AssessmentReason,
  IngredientConcern,
  RelevantNutrientInsight,
  AssessmentSource,
  Allergen,
  UserHealthEvaluation,
} from '@/types/nutrition';
import {
  ALLERGEN_DEFINITIONS,
  ANIMAL_DERIVED_INGREDIENTS,
  GLUTEN_CONTAINING_GRAINS,
  JAIN_RESTRICTED_INGREDIENTS,
} from './allergenDict';

// Reference Guidelines & Sources (ICMR-NIN, FSSAI, WHO, FDA, AHA, ADA)
export const REFERENCE_SOURCES: Record<string, AssessmentSource> = {
  icmrNin2024: {
    name: 'Dietary Guidelines for Indians (DGI 2024)',
    publisher: 'ICMR – National Institute of Nutrition (ICMR-NIN)',
    year: '2024',
    url: 'https://www.nin.res.in',
    note: 'Guideline 3 restricts added sugars to <5% energy (<25g/day); Guideline 5 limits salt to <5g/day (<2000mg sodium); Guideline 9 warns against ultra-processed HFSS foods.',
  },
  fssai2022: {
    name: 'FSSAI Food Safety and Standards (Labelling and Display) Regulations',
    publisher: 'Food Safety and Standards Authority of India (FSSAI)',
    year: '2022',
    url: 'https://www.fssai.gov.in',
    note: 'Mandates declaration of saturated & trans fats when total fat >0.5%; limits trans fat to <=2% of total fats; specifies allergen declarations and veg/non-veg symbols.',
  },
  whoSodium: {
    name: 'WHO Guideline: Sodium Intake for Adults and Children',
    publisher: 'World Health Organization (WHO)',
    year: '2023',
    url: 'https://www.who.int/publications/i/item/9789241504836',
    note: 'Recommends reduction in sodium intake to reduce blood pressure and risk of cardiovascular disease (under 2,000 mg/day).',
  },
  fdaNutrition: {
    name: 'FDA Food Labeling & Nutrition Guidelines',
    publisher: 'U.S. Food and Drug Administration (FDA)',
    year: '2024',
    url: 'https://www.fda.gov/food/food-labeling-nutrition',
    note: 'Daily Values (DV) are reference amounts of nutrients to consume or not to exceed each day.',
  },
  ahaSodium: {
    name: 'AHA Sodium Reduction Recommendations',
    publisher: 'American Heart Association (AHA)',
    year: '2024',
    url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium',
    note: 'Recommends no more than 2,300 mg/day, aiming for an ideal limit of 1,500 mg/day for most adults with hypertension.',
  },
  adaCarbs: {
    name: 'Standards of Care in Diabetes: Nutritional Aspects',
    publisher: 'American Diabetes Association (ADA)',
    year: '2024',
    url: 'https://diabetes.org/food-nutrition',
    note: 'Emphasis on minimizing added sugars, managing total carbohydrate distribution, and increasing dietary fiber.',
  },
  fareAllergy: {
    name: 'Food Allergy & Anaphylaxis Research Guidelines',
    publisher: 'FARE (Food Allergy Research & Education)',
    year: '2024',
    url: 'https://www.foodallergy.org',
    note: 'Advises that precautionary label statements ("may contain") must be treated with caution by individuals with severe allergies.',
  },
  dga2020: {
    name: 'Dietary Guidelines for Americans 2020-2025',
    publisher: 'USDA & HHS',
    year: '2020-2025',
    url: 'https://www.dietaryguidelines.gov',
    note: 'Recommends limiting added sugars to less than 10% of calories per day and saturated fat to less than 10%.',
  },
};

/**
 * Standard Daily Values based on 2,000 calorie reference diet (ICMR-NIN & FDA aligned)
 */
export const STANDARD_DAILY_VALUES = {
  totalFatG: 67, // ICMR-NIN ~20-30% energy (45-67g)
  saturatedFatG: 20, // <10% energy (~20g)
  cholesterolMg: 300,
  sodiumMg: 2000, // WHO & ICMR-NIN 2024 guideline (5g salt = 2000mg sodium)
  totalCarbohydratesG: 275,
  dietaryFiberG: 30, // ICMR-NIN recommended minimum
  addedSugarsG: 25, // ICMR-NIN 2024 strictly < 25g/day
  proteinG: 54, // ICMR-NIN reference adult (0.83g/kg)
  potassiumMg: 3500,
  calciumMg: 1000,
  ironMg: 19,
};

// Backwards-compatible alias for existing tests
export const FDA_DAILY_VALUES = STANDARD_DAILY_VALUES;

export class AssessmentEngine {
  public static assess(
    product: ExtractedProduct,
    profile: UserProfile
  ): FoodAssessment {
    const reasons: AssessmentReason[] = [];
    const ingredientConcerns: IngredientConcern[] = [];
    const uncertainties: string[] = [];
    const relevantNutrients: RelevantNutrientInsight[] = [];
    const nextSteps: Set<string> = new Set();
    const sourcesUsed: Map<string, AssessmentSource> = new Map();

    const rawIngredients = (product.ingredientsText || '').toLowerCase();
    const rawAllergenWarning = (product.allergenWarningText || '').toLowerCase();

    // Split text into pure ingredients vs precautionary cross-contact statements
    const crossContactRegex = /(may\s+contain|manufactured\s+in|produced\s+in|processed\s+in|made\s+on\s+shared|traces\s+of)[\s\S]*/i;
    let pureIngredientsText = rawIngredients;
    let crossContactText = rawAllergenWarning;

    const crossMatch = rawIngredients.match(crossContactRegex);
    if (crossMatch) {
      crossContactText += ' ' + crossMatch[0];
      pureIngredientsText = rawIngredients.replace(crossContactRegex, '').trim();
    }

    const n = product.nutrition;

    // 1. DATA COMPLETENESS & UNCERTAINTIES CHECK
    if (!product.ingredientsText || product.ingredientsText.trim().length === 0) {
      uncertainties.push('Ingredient list could not be identified or extracted from the label.');
    }
    if (product.ocrConfidence < 65) {
      uncertainties.push(`OCR text confidence is moderate-to-low (${product.ocrConfidence}%). Please verify label numbers manually.`);
    }
    if (n.servingSize === '' || !n.servingSize) {
      uncertainties.push('Serving size is not explicitly stated. Quantitative percentages may vary.');
    }
    if (n.addedSugarsG === undefined && (n.totalSugarsG ?? 0) > 0) {
      uncertainties.push('Added sugar breakdown is not explicitly printed; only total sugars are present.');
    }

    // 2. ALLERGY CHECKS (Conservative & Strict)
    for (const allergy of profile.allergies) {
      const def = ALLERGEN_DEFINITIONS[allergy];
      if (!def) continue;

      // Mask false positives in pureIngredientsText for this allergen
      let sanitizedIngredients = pureIngredientsText;
      if (def.falsePositives) {
        for (const fp of def.falsePositives) {
          sanitizedIngredients = sanitizedIngredients.replace(new RegExp(`\\b${fp}\\b`, 'gi'), '__FP__');
        }
      }

      let directMatchFound = false;
      let matchedKeyword = '';

      // Check derived ingredients first, then base keywords
      const allTokens = [...def.derivedIngredients, ...def.keywords];
      for (const kw of allTokens) {
        const regex = new RegExp(`\\b${kw}(?:s|es)?\\b`, 'i');
        if (regex.test(sanitizedIngredients)) {
          directMatchFound = true;
          matchedKeyword = kw;
          break;
        }
      }

      if (directMatchFound) {
        ingredientConcerns.push({
          ingredient: matchedKeyword,
          matchedReason: `Declared allergen conflict: ${def.name}`,
          severity: 'high',
          context: `Contains "${matchedKeyword}" which directly conflicts with your stated ${def.name} allergy.`,
        });

        reasons.push({
          id: `allergy-direct-${allergy}`,
          ruleId: 'RULE_ALLERGEN_DIRECT_MATCH',
          category: 'allergy',
          severity: 'alert',
          title: `Contains ${def.name}`,
          explanation: `Ingredient "${matchedKeyword}" was identified on the label. This directly conflicts with your stated ${def.name} allergy.`,
          evidence: `Found "${matchedKeyword}" in ingredient list.`,
          referenceTitle: REFERENCE_SOURCES.fareAllergy.name,
          referenceUrl: REFERENCE_SOURCES.fareAllergy.url,
        });

        sourcesUsed.set('fareAllergy', REFERENCE_SOURCES.fareAllergy);
        sourcesUsed.set('fssai2022', REFERENCE_SOURCES.fssai2022);
        nextSteps.add(`Do NOT consume this product if you have a medically confirmed allergy to ${def.name}.`);
      } else {
        // Check for precautionary cross-contact statements in crossContactText
        let crossContactFound = false;
        let statementSnippet = '';

        for (const kw of def.keywords) {
          if (new RegExp(`\\b${kw}\\b`, 'i').test(crossContactText)) {
            crossContactFound = true;
            matchedKeyword = kw;
            statementSnippet = crossContactText.trim();
            break;
          }
        }

        if (crossContactFound) {
          reasons.push({
            id: `allergy-cross-${allergy}`,
            ruleId: 'RULE_ALLERGEN_CROSS_CONTACT',
            category: 'allergy',
            severity: 'caution',
            title: `Precautionary Statement: ${def.name}`,
            explanation: `Label includes a precautionary cross-contact warning mentioning ${def.name}. While not an intentional ingredient, trace cross-contact is possible during manufacturing.`,
            evidence: statementSnippet ? `Label notice: "...${statementSnippet}..."` : `Advisory notice references ${def.name}.`,
            referenceTitle: REFERENCE_SOURCES.fareAllergy.name,
            referenceUrl: REFERENCE_SOURCES.fareAllergy.url,
          });
          sourcesUsed.set('fareAllergy', REFERENCE_SOURCES.fareAllergy);
          nextSteps.add(`Evaluate your personal tolerance threshold for cross-contact with your allergist.`);
        }
      }
    }

    // 2b. CUSTOM SAFETY ALLERGENS (e.g. strawberries, kiwi, tartrazine, specific food triggers)
    for (const customAllergen of profile.customAllergens || []) {
      const cleanCustom = customAllergen.trim().toLowerCase();
      if (!cleanCustom) continue;
      const regex = new RegExp(`\\b${cleanCustom}(?:s|es)?\\b`, 'i');
      if (regex.test(pureIngredientsText) || regex.test(rawIngredients)) {
        ingredientConcerns.push({
          ingredient: cleanCustom,
          matchedReason: `Declared Custom Allergen: ${cleanCustom}`,
          severity: 'high',
          context: `Contains "${cleanCustom}" which matches your custom allergy trigger list.`,
        });

        reasons.push({
          id: `allergy-custom-${cleanCustom}`,
          ruleId: 'RULE_CUSTOM_ALLERGEN_MATCH',
          category: 'allergy',
          severity: 'alert',
          title: `Contains Custom Allergen: ${cleanCustom}`,
          explanation: `Ingredient "${cleanCustom}" was identified on the label. This directly conflicts with your custom allergy trigger profile.`,
          evidence: `Found "${cleanCustom}" in ingredient list.`,
          referenceTitle: REFERENCE_SOURCES.fareAllergy.name,
          referenceUrl: REFERENCE_SOURCES.fareAllergy.url,
        });

        sourcesUsed.set('fareAllergy', REFERENCE_SOURCES.fareAllergy);
        nextSteps.add(`Do NOT consume this product if you have a medically confirmed allergy or intolerance to ${cleanCustom}.`);
      }
    }

    // 3. CUSTOM INGREDIENTS TO AVOID (e.g. Palm oil, MSG, Artificial sweeteners)
    for (const customIng of profile.customIngredientsToAvoid || []) {
      const cleanCustom = customIng.trim().toLowerCase();
      if (!cleanCustom) continue;
      if (rawIngredients.includes(cleanCustom)) {
        ingredientConcerns.push({
          ingredient: cleanCustom,
          matchedReason: 'Custom ingredient preference',
          severity: 'high',
          context: `You indicated you wish to avoid "${cleanCustom}", which appears on this label.`,
        });

        reasons.push({
          id: `custom-avoid-${cleanCustom}`,
          ruleId: 'RULE_CUSTOM_INGREDIENT_AVOID',
          category: 'ingredient',
          severity: 'caution',
          title: `Contains Avoided Ingredient: ${cleanCustom}`,
          explanation: `Your profile specifies avoiding "${cleanCustom}". It was detected in the ingredient statement.`,
          evidence: `Matched "${cleanCustom}" in label text.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
        });
        sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
      }
    }

    // 4. DIETARY LIFESTYLE PREFERENCES (Vegetarian, Vegan, Eggetarian, Jain, Halal)
    const prefs = profile.dietaryPreferences || [];

    // Jain Vegetarian
    if (prefs.includes('jain')) {
      const jainFound: string[] = [];
      for (const rootIng of JAIN_RESTRICTED_INGREDIENTS) {
        if (new RegExp(`\\b${rootIng}\\b`, 'i').test(pureIngredientsText)) {
          jainFound.push(rootIng);
        }
      }
      for (const animal of ANIMAL_DERIVED_INGREDIENTS) {
        if (new RegExp(`\\b${animal}\\b`, 'i').test(pureIngredientsText)) {
          jainFound.push(animal);
        }
      }
      if (jainFound.length > 0) {
        for (const item of jainFound) {
          ingredientConcerns.push({
            ingredient: item,
            matchedReason: 'Jain dietary restriction',
            severity: 'high',
            context: `"${item}" is restricted under Jain dietary practices.`,
          });
        }
        reasons.push({
          id: 'diet-jain-conflict',
          ruleId: 'RULE_JAIN_RESTRICTED_INGREDIENTS',
          category: 'dietary',
          severity: 'alert',
          title: 'Restricted Ingredients for Jain Diet',
          explanation: `Identified ingredients that conflict with Jain vegetarian dietary principles: ${jainFound.slice(0, 4).join(', ')}.`,
          evidence: `Detected: ${jainFound.join(', ')}`,
        });
      }
    }

    // Vegan / Vegetarian
    if (prefs.includes('vegan') || prefs.includes('vegetarian')) {
      const isVegan = prefs.includes('vegan');
      const nonVegFound: string[] = [];

      for (const animalIng of ANIMAL_DERIVED_INGREDIENTS) {
        const regex = new RegExp(`\\b${animalIng}\\b`, 'i');
        if (regex.test(pureIngredientsText)) {
          nonVegFound.push(animalIng);
        }
      }

      // If vegan, also check dairy and eggs
      if (isVegan) {
        let sanitizedDairy = pureIngredientsText;
        if (ALLERGEN_DEFINITIONS.milk.falsePositives) {
          for (const fp of ALLERGEN_DEFINITIONS.milk.falsePositives) {
            sanitizedDairy = sanitizedDairy.replace(new RegExp(`\\b${fp}\\b`, 'gi'), '__FP__');
          }
        }
        for (const kw of ALLERGEN_DEFINITIONS.milk.keywords) {
          if (new RegExp(`\\b${kw}\\b`, 'i').test(sanitizedDairy)) {
            nonVegFound.push(kw);
          }
        }
        for (const kw of ALLERGEN_DEFINITIONS.eggs.keywords) {
          if (new RegExp(`\\b${kw}\\b`, 'i').test(pureIngredientsText)) {
            nonVegFound.push(kw);
          }
        }
      }

      // Check product non-veg flag
      if (product.vegStatus === 'non_veg') {
        nonVegFound.push('FSSAI Brown Dot (Non-Vegetarian)');
      }

      const uniqueNonVeg = Array.from(new Set(nonVegFound));
      if (uniqueNonVeg.length > 0) {
        reasons.push({
          id: 'diet-animal-ingredients',
          ruleId: 'RULE_DIETARY_ANIMAL_ORIGIN',
          category: 'dietary',
          severity: 'alert',
          title: `Animal-Derived Ingredients Detected (${isVegan ? 'Vegan' : 'Vegetarian'})`,
          explanation: `Identified ingredients typically derived from animals: ${uniqueNonVeg.slice(0, 4).join(', ')}.`,
          evidence: `Found on label: ${uniqueNonVeg.join(', ')}`,
          referenceTitle: REFERENCE_SOURCES.fssai2022.name,
          referenceUrl: REFERENCE_SOURCES.fssai2022.url,
        });
        sourcesUsed.set('fssai2022', REFERENCE_SOURCES.fssai2022);
        nextSteps.add(`Check if an alternative certified vegetarian or plant-based option exists.`);
      }
    }

    // Eggetarian
    if (prefs.includes('eggetarian')) {
      const nonVegFound: string[] = [];
      const meatOnly = ANIMAL_DERIVED_INGREDIENTS.filter(i => !['egg', 'eggs', 'albumin', 'dairy', 'milk'].includes(i));
      for (const animal of meatOnly) {
        if (new RegExp(`\\b${animal}\\b`, 'i').test(pureIngredientsText)) {
          nonVegFound.push(animal);
        }
      }
      if (nonVegFound.length > 0) {
        reasons.push({
          id: 'diet-eggetarian-meat',
          ruleId: 'RULE_EGGETARIAN_MEAT_DETECTED',
          category: 'dietary',
          severity: 'alert',
          title: 'Meat/Animal Ingredient Detected (Eggetarian Diet)',
          explanation: `Detected animal-derived non-egg ingredients: ${nonVegFound.slice(0, 3).join(', ')}.`,
          evidence: `Found on label: ${nonVegFound.join(', ')}`,
        });
      }
    }

    // Gluten-Free Diet
    if (prefs.includes('gluten_free') && !profile.healthConsiderations.includes('celiac_disease')) {
      const glutenGrainsFound: string[] = [];
      for (const grain of GLUTEN_CONTAINING_GRAINS) {
        if (new RegExp(`\\b${grain}\\b`, 'i').test(pureIngredientsText)) {
          glutenGrainsFound.push(grain);
        }
      }
      if (glutenGrainsFound.length > 0) {
        reasons.push({
          id: 'diet-gluten-detected',
          ruleId: 'RULE_DIETARY_GLUTEN_PRESENT',
          category: 'dietary',
          severity: 'alert',
          title: 'Gluten-Containing Grain Identified',
          explanation: `Detected grains containing gluten: ${glutenGrainsFound.join(', ')}.`,
          evidence: `Matched: ${glutenGrainsFound.join(', ')}`,
          referenceTitle: REFERENCE_SOURCES.fssai2022.name,
        });
      }
    }

    // Keto / Low Carb
    if (prefs.includes('keto') || prefs.includes('low_carb')) {
      const totalCarbs = n.totalCarbohydratesG;
      const fiber = n.dietaryFiberG || 0;
      const netCarbs = totalCarbs !== undefined ? Math.max(0, totalCarbs - fiber) : undefined;

      if (netCarbs !== undefined && netCarbs > 12) {
        reasons.push({
          id: 'diet-keto-net-carbs',
          ruleId: 'RULE_KETO_NET_CARBS',
          category: 'dietary',
          severity: 'caution',
          title: `Net Carbs: ${netCarbs}g per serving`,
          explanation: `This product provides ${netCarbs}g net carbohydrates per serving (${totalCarbs}g carbs - ${fiber}g fiber), which may exceed standard keto single-item guidelines.`,
          evidence: `Total carbs: ${totalCarbs}g, Fiber: ${fiber}g.`,
        });
      }
    }

    // Low Sodium Preference
    if (prefs.includes('low_sodium')) {
      const sodium = n.sodiumMg;
      if (sodium !== undefined && sodium > 140) {
        reasons.push({
          id: 'diet-low-sodium',
          ruleId: 'RULE_LOW_SODIUM_EXCEEDED',
          category: 'dietary',
          severity: sodium > 400 ? 'alert' : 'caution',
          title: `Sodium: ${sodium} mg per serving`,
          explanation: `FSSAI and health guidelines define "low sodium" foods as <=140 mg per serving. This product contains ${sodium} mg.`,
          evidence: `${sodium} mg sodium stated per serving.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
          referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
        });
        sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
      }
    }

    // 5. HEALTH CONSIDERATIONS (ICMR-NIN 2024, AHA, ADA, FSSAI)
    // Celiac Disease
    if (profile.healthConsiderations.includes('celiac_disease')) {
      const glutenGrainsFound: string[] = [];
      for (const grain of GLUTEN_CONTAINING_GRAINS) {
        if (new RegExp(`\\b${grain}\\b`, 'i').test(pureIngredientsText)) {
          glutenGrainsFound.push(grain);
        }
      }
      if (glutenGrainsFound.length > 0) {
        reasons.push({
          id: 'health-celiac-gluten',
          ruleId: 'RULE_CELIAC_GLUTEN_PRESENT',
          category: 'health',
          severity: 'alert',
          title: 'Not Suitable for Celiac Disease',
          explanation: `Product lists gluten sources (${glutenGrainsFound.join(', ')}). Strict gluten avoidance (<20 mg/kg under FSSAI 2022) is medically required in celiac disease to prevent intestinal villous damage.`,
          evidence: `Grains identified: ${glutenGrainsFound.join(', ')}`,
          referenceTitle: REFERENCE_SOURCES.fssai2022.name,
        });
        sourcesUsed.set('fssai2022', REFERENCE_SOURCES.fssai2022);
        nextSteps.add('Look for an official certified Gluten-Free emblem (<20 ppm gluten under FSSAI).');
      } else {
        const fullAdvisory = `${rawIngredients} ${rawAllergenWarning}`;
        const wheatWarn = fullAdvisory.includes('wheat') || fullAdvisory.includes('gluten');
        if (wheatWarn && (fullAdvisory.includes('facility') || fullAdvisory.includes('equipment') || fullAdvisory.includes('may contain'))) {
          reasons.push({
            id: 'health-celiac-cross-contact',
            ruleId: 'RULE_CELIAC_CROSS_CONTACT',
            category: 'health',
            severity: 'caution',
            title: 'Potential Gluten Cross-Contact Risk',
            explanation: 'The label notes equipment or facility sharing with wheat or gluten. For individuals with biopsy-confirmed celiac disease, certified gluten-free manufacturing is advised.',
            evidence: 'Facility warning noted on label.',
          });
        }
      }
    }

    // Hypertension (Sodium Burden Check)
    if (profile.healthConsiderations.includes('hypertension')) {
      const sodium = n.sodiumMg;
      if (sodium !== undefined) {
        const dvPercent = Math.round((sodium / STANDARD_DAILY_VALUES.sodiumMg) * 100);
        let severity: 'info' | 'caution' | 'alert' = 'info';

        if (sodium >= 600 || dvPercent >= 26) {
          severity = 'alert';
        } else if (sodium >= 350 || dvPercent >= 15) {
          severity = 'caution';
        }

        if (severity !== 'info') {
          reasons.push({
            id: 'health-hypertension-sodium',
            ruleId: 'RULE_HYPERTENSION_SODIUM_BURDEN',
            category: 'health',
            severity,
            title: `High Sodium for Blood Pressure Management (${sodium} mg)`,
            explanation: `Contains ${sodium} mg sodium (${dvPercent}% of the daily 2,000 mg limit recommended by ICMR-NIN & WHO). The AHA recommends adults with elevated blood pressure limit total daily sodium to 1,500 mg. One serving supplies ${Math.round((sodium / 1500) * 100)}% of that stricter target.`,
            evidence: `Sodium: ${sodium} mg per serving.`,
            referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
            referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
          });
          sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
          sourcesUsed.set('ahaSodium', REFERENCE_SOURCES.ahaSodium);
          nextSteps.add('Balance this intake by selecting very low sodium foods (<100mg) for remaining meals today.');
        }

        relevantNutrients.push({
          name: 'Sodium',
          value: sodium,
          unit: 'mg',
          dailyValuePercentage: dvPercent,
          rating: sodium > 460 ? 'high' : sodium > 140 ? 'moderate' : 'low',
          context: 'Target <2,000 mg daily (ICMR-NIN 2024 & WHO); <1,500 mg for hypertension.',
        });
      }
    }

    // Diabetes / Prediabetes (Added Sugars & Refined Carbs)
    if (
      profile.healthConsiderations.includes('diabetes_type1') ||
      profile.healthConsiderations.includes('diabetes_type2') ||
      profile.healthConsiderations.includes('prediabetes')
    ) {
      const addedSugar = n.addedSugarsG;
      const totalCarbs = n.totalCarbohydratesG;
      const fiber = n.dietaryFiberG || 0;

      if (addedSugar !== undefined && addedSugar >= 10) {
        const sugarDvPercent = Math.round((addedSugar / STANDARD_DAILY_VALUES.addedSugarsG) * 100);
        reasons.push({
          id: 'health-diabetes-added-sugar',
          ruleId: 'RULE_DIABETES_ADDED_SUGAR',
          category: 'health',
          severity: addedSugar >= 15 ? 'alert' : 'caution',
          title: `Added Sugars: ${addedSugar}g (${sugarDvPercent}% of daily allowance)`,
          explanation: `ICMR-NIN 2024 Guideline 3 strictly advises restricting added sugars to <25g/day (<5% of daily energy). Consuming concentrated added sugars causes rapid blood glucose spikes.`,
          evidence: `Added sugar: ${addedSugar}g per serving.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
          referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
        });
        sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
        sourcesUsed.set('adaCarbs', REFERENCE_SOURCES.adaCarbs);
        nextSteps.add('If consumed, pair with protein, fiber, or healthy fats to blunt glycemic spike.');
      }

      if (totalCarbs !== undefined && fiber < 2 && totalCarbs > 30) {
        reasons.push({
          id: 'health-diabetes-low-fiber-ratio',
          ruleId: 'RULE_DIABETES_REFINED_CARBS',
          category: 'health',
          severity: 'caution',
          title: `High Carbohydrates with Low Fiber (${totalCarbs}g carbs / ${fiber}g fiber)`,
          explanation: `A high carbohydrate load with minimal dietary fiber (<2g) indicates refined carbohydrates with higher glycemic impact (ICMR-NIN Guideline 7).`,
          evidence: `Carbs: ${totalCarbs}g, Fiber: ${fiber}g.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
          referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
        });
      }

      if (addedSugar !== undefined) {
        relevantNutrients.push({
          name: 'Added Sugars',
          value: addedSugar,
          unit: 'g',
          dailyValuePercentage: Math.round((addedSugar / STANDARD_DAILY_VALUES.addedSugarsG) * 100),
          rating: addedSugar > 10 ? 'high' : addedSugar > 5 ? 'moderate' : 'low',
          context: 'ICMR-NIN 2024 recommends < 25g daily added sugar for adults.',
        });
      }
    }

    // Elevated Cholesterol / Heart Health (Saturated Fat & Trans Fat)
    if (profile.healthConsiderations.includes('elevated_cholesterol')) {
      const satFat = n.saturatedFatG;
      const transFat = n.transFatG || 0;

      if (satFat !== undefined && satFat >= 4) {
        const satFatDv = Math.round((satFat / STANDARD_DAILY_VALUES.saturatedFatG) * 100);
        reasons.push({
          id: 'health-cholesterol-sat-fat',
          ruleId: 'RULE_CHOLESTEROL_SAT_FAT',
          category: 'health',
          severity: satFat >= 7 ? 'alert' : 'caution',
          title: `Saturated Fat: ${satFat}g (${satFatDv}% DV)`,
          explanation: `Saturated fats raise LDL cholesterol. FSSAI & ICMR-NIN recommend keeping saturated fat under 10% of total daily energy intake (under ~20g for a 2,000 kcal diet).`,
          evidence: `Saturated fat: ${satFat}g per serving.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
          referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
        });
        sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
      }

      if (transFat > 0) {
        reasons.push({
          id: 'health-cholesterol-trans-fat',
          ruleId: 'RULE_CHOLESTEROL_TRANS_FAT',
          category: 'health',
          severity: 'alert',
          title: `Contains Trans Fat: ${transFat}g`,
          explanation: 'FSSAI limits industrial trans fatty acids to <=2% of total fats. Trans fats simultaneously raise atherogenic LDL and reduce protective HDL cholesterol.',
          evidence: `Trans fat: ${transFat}g stated on label.`,
          referenceTitle: REFERENCE_SOURCES.fssai2022.name,
          referenceUrl: REFERENCE_SOURCES.fssai2022.url,
        });
        sourcesUsed.set('fssai2022', REFERENCE_SOURCES.fssai2022);
      }

      if (satFat !== undefined) {
        relevantNutrients.push({
          name: 'Saturated Fat',
          value: satFat,
          unit: 'g',
          dailyValuePercentage: Math.round((satFat / STANDARD_DAILY_VALUES.saturatedFatG) * 100),
          rating: satFat > 4 ? 'high' : satFat > 2 ? 'moderate' : 'low',
          context: 'Limiting saturated fat supports optimal cardiovascular health.',
        });
      }
    }

    // 6. FSSAI 2022 FAT DECLARATION RULE
    if ((n.totalFatG ?? 0) > 0.5 && n.saturatedFatG === undefined) {
      uncertainties.push('Total fat is > 0.5%, but saturated fat and trans fat are not declared (required under FSSAI 2022).');
    }

    // 6b. ICMR-NIN 2024 GENERAL SUGAR & SODIUM GUIDELINE THRESHOLDS
    const effectiveSugar = n.addedSugarsG ?? n.totalSugarsG;
    if (effectiveSugar !== undefined && effectiveSugar >= 12.5) {
      if (!reasons.some(r => r.ruleId === 'RULE_DIABETES_ADDED_SUGAR')) {
        const pct = Math.round((effectiveSugar / STANDARD_DAILY_VALUES.addedSugarsG) * 100);
        reasons.push({
          id: 'guideline-icmr-sugar',
          ruleId: 'RULE_ICMR_HIGH_SUGAR',
          category: 'health',
          severity: effectiveSugar >= 20 ? 'alert' : 'caution',
          title: `High Sugar Load (${effectiveSugar}g per serving)`,
          explanation: `ICMR-NIN 2024 Guideline 3 recommends limiting added sugars to <25g/day. A single serving provides ${pct}% of the recommended daily ceiling.`,
          evidence: `Sugar content: ${effectiveSugar}g.`,
          referenceTitle: REFERENCE_SOURCES.icmrNin2024.name,
          referenceUrl: REFERENCE_SOURCES.icmrNin2024.url,
        });
        sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
      }
      if (!relevantNutrients.some(rn => rn.name.toLowerCase().includes('sugar'))) {
        relevantNutrients.push({
          name: n.addedSugarsG !== undefined ? 'Added Sugars' : 'Sugars',
          value: effectiveSugar,
          unit: 'g',
          dailyValuePercentage: Math.round((effectiveSugar / STANDARD_DAILY_VALUES.addedSugarsG) * 100),
          rating: 'high',
          context: 'ICMR-NIN 2024 recommends < 25g daily added sugar for adults.',
        });
      }
    }

    // 7. DEFAULT RELEVANT NUTRIENTS
    if (!relevantNutrients.some(rn => rn.name === 'Calories') && n.calories !== undefined) {
      relevantNutrients.push({
        name: 'Calories',
        value: n.calories,
        unit: 'kcal',
        rating: n.calories > 350 ? 'high' : n.calories > 150 ? 'moderate' : 'low',
        context: 'Energy provided per declared serving.',
      });
    }

    // 8. OVERALL STATUS DETERMINATION
    const hasAlert = reasons.some(r => r.severity === 'alert');
    const hasCaution = reasons.some(r => r.severity === 'caution');
    const hasCriticalUncertainty = uncertainties.some(u => u.includes('Ingredient list could not be identified'));

    let status: AssessmentStatus = 'fits_preferences';
    let headline = '';
    let summary = '';

    if (hasCriticalUncertainty) {
      status = 'not_enough_information';
      headline = 'Insufficient Label Information';
      summary = 'Essential data such as the complete ingredient statement is missing from this label scan. Because safety or compatibility cannot be verified without ingredient data, we cannot confirm whether this product fits your profile.';
    } else if (hasAlert) {
      // In base engine: 'review_carefully' for backward-compatibility with tests, with clear potential conflict headline
      status = 'review_carefully';
      headline = 'Review Carefully: Specific Conflicts Detected';
      summary = 'One or more ingredients or nutritional attributes directly conflict with your stated dietary restrictions, allergies, or health priorities. Review the highlighted items below before making a consumption decision.';
    } else if (hasCaution || uncertainties.length > 0) {
      status = 'review_carefully';
      headline = 'Review Carefully: Advisory Notices & Considerations';
      summary = 'No direct allergen conflicts were identified, but advisory warnings (such as facility cross-contact notices) or elevated nutrient levels relevant to your health goals require your attention.';
    } else {
      status = 'fits_preferences';
      headline = 'Potentially Fits Your Stated Preferences';
      summary = 'Based on the visible printed label and your current profile, no stated allergens, dietary conflicts, or elevated flagged nutrients were detected. Note that this is educational guidance, not an absolute medical guarantee.';
    }

    // Fallback next steps if none generated
    if (nextSteps.size === 0) {
      nextSteps.add('Confirm the printed expiration date and packaging integrity before consumption.');
      nextSteps.add('Always review the physical package if you have severe or anaphylactic food allergies.');
    }

    // Default sources if none accumulated
    if (sourcesUsed.size === 0) {
      sourcesUsed.set('icmrNin2024', REFERENCE_SOURCES.icmrNin2024);
      sourcesUsed.set('fssai2022', REFERENCE_SOURCES.fssai2022);
    }

    // 9. DETAILED USER HEALTH & NUTRIENT BUDGET EVALUATION
    const isDiabetic = (profile.healthConsiderations || []).some(h => h.includes('diabetes') || h.includes('prediabetes')) || (profile.dietaryGoals || []).includes('reduced_sugar');
    const isHypertensive = (profile.healthConsiderations || []).some(h => h.includes('hypertension') || h.includes('heart_disease')) || (profile.dietaryGoals || []).includes('reduced_sodium');
    const isHighCholesterol = (profile.healthConsiderations || []).includes('elevated_cholesterol');

    // Sugar Budget Calculation
    const productSugar = (n.addedSugarsG ?? n.totalSugarsG) || 0;
    const recommendedSugarDaily = isDiabetic 
      ? 15 
      : (profile.sugarLimitG || STANDARD_DAILY_VALUES.addedSugarsG); // 25g default
    const sugarPct = Math.round((productSugar / recommendedSugarDaily) * 100);
    const sugarVerdict = sugarPct > 50 ? 'excessive' : sugarPct > 20 ? 'moderate' : 'optimal';
    const sugarRec = isDiabetic
      ? `For blood sugar control, your daily target is ≤${recommendedSugarDaily}g. This single serving provides ${productSugar}g (${sugarPct}% of daily allowance). ${sugarPct > 30 ? 'Caution: May cause a rapid blood glucose spike.' : 'Acceptable portion when paired with dietary fiber.'}`
      : `ICMR-NIN 2024 recommends <${recommendedSugarDaily}g added sugar per day. This serving delivers ${productSugar}g (${sugarPct}% of daily limit). ${sugarPct > 40 ? 'High sugar load; minimize other sweet items today.' : 'Fits comfortably within your daily threshold.'}`;

    // Sodium Budget Calculation
    const productSodium = n.sodiumMg || 0;
    const recommendedSodiumDaily = isHypertensive 
      ? (profile.sodiumTargetMg ? Math.min(profile.sodiumTargetMg, 1500) : 1500) 
      : (profile.sodiumTargetMg || STANDARD_DAILY_VALUES.sodiumMg); // 2000mg default
    const sodiumPct = Math.round((productSodium / recommendedSodiumDaily) * 100);
    const sodiumVerdict = sodiumPct > 30 ? 'excessive' : sodiumPct > 15 ? 'moderate' : 'optimal';
    const sodiumRec = isHypertensive
      ? `For cardiovascular health, the recommended ceiling is ≤1,500mg sodium daily. This serving provides ${productSodium}mg (${sodiumPct}% of daily limit). ${sodiumPct > 25 ? 'High sodium load; consume with plenty of water and low-sodium foods.' : 'Moderate sodium content.'}`
      : `ICMR-NIN 2024 & WHO recommend <${recommendedSodiumDaily}mg sodium (<5g salt) per day. This serving supplies ${productSodium}mg (${sodiumPct}% of budget).`;

    // Saturated Fat Budget Calculation
    const productSatFat = n.saturatedFatG || 0;
    const recommendedSatFatDaily = isHighCholesterol ? 12 : STANDARD_DAILY_VALUES.saturatedFatG; // 20g default
    const fatPct = Math.round((productSatFat / recommendedSatFatDaily) * 100);
    const fatVerdict = fatPct > 35 ? 'excessive' : fatPct > 15 ? 'moderate' : 'optimal';
    const fatRec = isHighCholesterol
      ? `To manage cholesterol, keep saturated fat <10% of calories (<${recommendedSatFatDaily}g/day). This serving has ${productSatFat}g (${fatPct}% of budget).`
      : `Recommended saturated fat ceiling is <${recommendedSatFatDaily}g daily. This product has ${productSatFat}g (${fatPct}% of daily limit).`;

    // Allergen Summary
    const hasAllergenAlert = reasons.some(r => r.category === 'allergy' && r.severity === 'alert');
    const hasAllergenCaution = reasons.some(r => r.category === 'allergy' && r.severity === 'caution');
    let allergenClearance: 'cleared' | 'caution' | 'conflict' | 'unverified' = 'cleared';
    let allergenSummary = 'No allergens declared on the label match your saved allergen profile.';

    if (hasAllergenAlert) {
      allergenClearance = 'conflict';
      allergenSummary = 'Direct conflict detected with your declared allergen profile. Avoid consumption.';
    } else if (hasAllergenCaution) {
      allergenClearance = 'caution';
      allergenSummary = 'Precautionary facility warning found (e.g. shared equipment or cross-contact risk).';
    } else if (hasCriticalUncertainty) {
      allergenClearance = 'unverified';
      allergenSummary = 'Ingredient list was not detected or verified; allergen safety cannot be confirmed.';
    }

    const healthEvaluation: UserHealthEvaluation = {
      profileName: profile.name || (profile.isGuest ? 'Guest Profile' : 'Your Profile'),
      isGuest: profile.isGuest,
      dietaryMatch: hasAlert ? 'conflict' : hasCaution ? 'caution' : 'fits',
      allergenClearance,
      allergenSummary,
      sugarEvaluation: {
        metric: 'Sugar & Added Sugars',
        productValue: productSugar,
        unit: 'g',
        recommendedDailyBudget: recommendedSugarDaily,
        percentageOfBudget: sugarPct,
        verdict: sugarVerdict,
        userRecommendation: sugarRec,
      },
      sodiumEvaluation: {
        metric: 'Sodium (Salt)',
        productValue: productSodium,
        unit: 'mg',
        recommendedDailyBudget: recommendedSodiumDaily,
        percentageOfBudget: sodiumPct,
        verdict: sodiumVerdict,
        userRecommendation: sodiumRec,
      },
      fatEvaluation: {
        metric: 'Saturated Fat',
        productValue: productSatFat,
        unit: 'g',
        recommendedDailyBudget: recommendedSatFatDaily,
        percentageOfBudget: fatPct,
        verdict: fatVerdict,
        userRecommendation: fatRec,
      },
      calorieEvaluation: n.calories !== undefined ? {
        metric: 'Energy (Calories)',
        productValue: n.calories,
        unit: 'kcal',
        recommendedDailyBudget: profile.calorieTargetDaily || 2000,
        percentageOfBudget: Math.round((n.calories / (profile.calorieTargetDaily || 2000)) * 100),
        verdict: (n.calories / (profile.calorieTargetDaily || 2000)) > 0.35 ? 'excessive' : 'optimal',
        userRecommendation: `Supplies ${n.calories} kcal (${Math.round((n.calories / (profile.calorieTargetDaily || 2000)) * 100)}% of your ${profile.calorieTargetDaily || 2000} kcal daily budget).`,
      } : undefined,
      proteinEvaluation: n.proteinG !== undefined ? {
        metric: 'Protein',
        productValue: n.proteinG,
        unit: 'g',
        recommendedDailyBudget: profile.proteinTargetG || 55,
        percentageOfBudget: Math.round((n.proteinG / (profile.proteinTargetG || 55)) * 100),
        verdict: 'optimal',
        userRecommendation: `Provides ${n.proteinG}g protein (${Math.round((n.proteinG / (profile.proteinTargetG || 55)) * 100)}% of your ${profile.proteinTargetG || 55}g daily target).`,
      } : undefined,
      overallHealthSummary: hasAlert
        ? 'This food has specific conflicts with your saved restrictions. Review flagged nutrients and ingredients below.'
        : hasCaution
        ? 'This food fits your general profile, but advisory items or high nutrient concentrations (such as sugar or sodium) require your attention.'
        : 'This product fits your personal dietary profile and health targets cleanly.',
    };

    return {
      id: `assess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      assessedAt: new Date().toISOString(),
      status,
      headline,
      summary,
      personalizedReasons: reasons,
      ingredientsOfConcern: ingredientConcerns,
      uncertainties,
      relevantNutrients,
      practicalNextSteps: Array.from(nextSteps),
      sources: Array.from(sourcesUsed.values()),
      healthEvaluation,
      userProfileSnapshot: {
        dietaryPreferences: [...profile.dietaryPreferences],
        allergies: [...profile.allergies],
        healthConsiderations: [...profile.healthConsiderations],
      },
    };
  }
}
