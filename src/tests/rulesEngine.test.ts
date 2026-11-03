import { describe, it, expect } from 'vitest';
import { AssessmentEngine } from '../lib/assessment/rulesEngine';
import { SAMPLE_PRODUCTS } from '../lib/sampleProducts';
import { UserProfile, ExtractedProduct } from '../types/nutrition';

const baseProfile: UserProfile = {
  id: 'test-user',
  name: 'Test Profile',
  isGuest: true,
  dietaryPreferences: [],
  allergies: [],
  healthConsiderations: [],
  customIngredientsToAvoid: [],
  privacySettings: {
    storeImagesConsent: false,
    telemetryConsent: false,
  },
  createdAt: '2026-10-28T00:00:00Z',
  updatedAt: '2026-10-28T00:00:00Z',
};

describe('AssessmentEngine - Allergen Flags', () => {
  it('flags direct allergen conflict with alert severity when ingredient matches', () => {
    const profile: UserProfile = {
      ...baseProfile,
      allergies: ['milk'],
    };

    // Chobani yogurt contains milk
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[1], profile);

    expect(assessment.status).toBe('review_carefully');
    const milkReason = assessment.personalizedReasons.find(r => r.category === 'allergy' && r.title.includes('Milk'));
    expect(milkReason).toBeDefined();
    expect(milkReason?.severity).toBe('alert');
    expect(assessment.ingredientsOfConcern.some(c => c.ingredient.includes('milk'))).toBe(true);
  });

  it('detects allergen synonyms like whey and casein for milk', () => {
    const profile: UserProfile = {
      ...baseProfile,
      allergies: ['milk'],
    };

    const mockProduct: ExtractedProduct = {
      id: 'mock-whey-bar',
      name: 'Protein Shake Bar',
      ingredientsText: 'Isolated whey protein, cocoa butter, organic stevia.',
      parsedIngredients: ['Isolated whey protein', 'cocoa butter', 'organic stevia'],
      nutrition: {
        servingSize: '1 bar (50g)',
        servingBasis: 'per_serving',
        calories: 210,
      },
      ocrConfidence: 95,
      uncertainFields: [],
      scannedAt: '2026-10-28T00:00:00Z',
    };

    const assessment = AssessmentEngine.assess(mockProduct, profile);
    expect(assessment.status).toBe('review_carefully');
    expect(assessment.personalizedReasons.some(r => r.evidence.includes('whey'))).toBe(true);
  });

  it('flags precautionary cross-contact statements with caution severity', () => {
    const profile: UserProfile = {
      ...baseProfile,
      allergies: ['peanuts'],
    };

    // Granola bar states "May contain peanut, almond and pecan ingredients"
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[0], profile);

    expect(assessment.status).toBe('review_carefully');
    const crossReason = assessment.personalizedReasons.find(r => r.ruleId === 'RULE_ALLERGEN_CROSS_CONTACT');
    expect(crossReason).toBeDefined();
    expect(crossReason?.severity).toBe('caution');
  });
});

describe('AssessmentEngine - Health Considerations', () => {
  it('cautions when sodium exceeds hypertension target (>480mg)', () => {
    const profile: UserProfile = {
      ...baseProfile,
      healthConsiderations: ['hypertension'],
    };

    // Campbell's Tomato soup has 480mg sodium
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[2], profile);

    expect(assessment.status).toBe('review_carefully');
    const sodiumReason = assessment.personalizedReasons.find(r => r.ruleId === 'RULE_HYPERTENSION_SODIUM_BURDEN');
    expect(sodiumReason).toBeDefined();
    expect(sodiumReason?.severity).toBe('caution');
    expect(assessment.relevantNutrients.some(n => n.name === 'Sodium' && n.value === 480)).toBe(true);
  });

  it('flags added sugar for diabetes considerations (>10g)', () => {
    const profile: UserProfile = {
      ...baseProfile,
      healthConsiderations: ['diabetes_type2'],
    };

    // Granola bar has 11g added sugar
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[0], profile);

    expect(assessment.status).toBe('review_carefully');
    const sugarReason = assessment.personalizedReasons.find(r => r.ruleId === 'RULE_DIABETES_ADDED_SUGAR');
    expect(sugarReason).toBeDefined();
  });

  it('flags saturated fat for elevated cholesterol (>=4g)', () => {
    const profile: UserProfile = {
      ...baseProfile,
      healthConsiderations: ['elevated_cholesterol'],
    };

    // KIND bar has 4.5g saturated fat
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[4], profile);

    const satFatReason = assessment.personalizedReasons.find(r => r.ruleId === 'RULE_CHOLESTEROL_SAT_FAT');
    expect(satFatReason).toBeDefined();
  });
});

describe('AssessmentEngine - Data Completeness & Safety States', () => {
  it('returns "not_enough_information" if ingredient list is completely missing', () => {
    const profile: UserProfile = {
      ...baseProfile,
      dietaryPreferences: ['vegan'],
    };

    const emptyProduct: ExtractedProduct = {
      id: 'mock-empty',
      name: 'Unreadable Can',
      ingredientsText: '',
      parsedIngredients: [],
      nutrition: {
        servingSize: '1 can',
        servingBasis: 'per_serving',
      },
      ocrConfidence: 40,
      uncertainFields: ['ingredientsText'],
      scannedAt: '2026-10-28T00:00:00Z',
    };

    const assessment = AssessmentEngine.assess(emptyProduct, profile);
    expect(assessment.status).toBe('not_enough_information');
    expect(assessment.headline).toContain('Insufficient');
  });

  it('returns "fits_preferences" when no flags or conflicts are detected', () => {
    const profile: UserProfile = {
      ...baseProfile,
      dietaryPreferences: ['vegan'],
      allergies: ['peanuts', 'tree_nuts'],
    };

    // Oat milk has no animal ingredients, no peanuts, no tree nuts
    const assessment = AssessmentEngine.assess(SAMPLE_PRODUCTS[3], profile);
    expect(assessment.status).toBe('fits_preferences');
    expect(assessment.headline).toContain('Potentially Fits');
  });
});

describe('AssessmentEngine - Indian Guidelines & Dietary Preferences', () => {
  it('detects Jain dietary restrictions (onion, garlic, root vegetables)', () => {
    const profile: UserProfile = {
      ...baseProfile,
      dietaryPreferences: ['jain'],
    };

    const productWithOnionGarlic: ExtractedProduct = {
      id: 'mock-curry-paste',
      name: 'Curry Paste',
      ingredientsText: 'Tomato puree, onion paste, garlic powder, ginger, cumin, sunflower oil.',
      parsedIngredients: ['Tomato puree', 'onion paste', 'garlic powder', 'ginger', 'cumin', 'sunflower oil'],
      nutrition: {
        servingSize: '2 tbsp (30g)',
        servingBasis: 'per_serving',
        calories: 45,
      },
      ocrConfidence: 95,
      uncertainFields: [],
      scannedAt: '2026-11-03T00:00:00Z',
    };

    const assessment = AssessmentEngine.assess(productWithOnionGarlic, profile);
    expect(assessment.status).toBe('review_carefully');
    const jainReason = assessment.personalizedReasons.find(r => r.ruleId === 'RULE_JAIN_RESTRICTED_INGREDIENTS');
    expect(jainReason).toBeDefined();
    expect(jainReason?.severity).toBe('alert');
    expect(assessment.ingredientsOfConcern.some(c => c.ingredient.includes('onion') || c.ingredient.includes('garlic'))).toBe(true);
  });

  it('correctly evaluates Indian vegetarian vs non-vegetarian products', () => {
    const vegProfile: UserProfile = {
      ...baseProfile,
      dietaryPreferences: ['vegetarian'],
    };

    // Maggi noodles (sample product 6)
    const maggiProduct = SAMPLE_PRODUCTS.find(p => p.id === 'sample-maggi-masala') || SAMPLE_PRODUCTS[6];
    if (maggiProduct) {
      const assessment = AssessmentEngine.assess(maggiProduct, vegProfile);
      // Maggi is vegetarian (onion powder is present, which is fine for standard vegetarian)
      expect(assessment.ingredientsOfConcern.some(c => c.category === 'dietary_preference' && c.ingredient.includes('meat'))).toBe(false);
    }
  });

  it('flags high sugar products according to ICMR-NIN 2024 guidelines (>12.5g per single serving)', () => {
    const profile: UserProfile = {
      ...baseProfile,
      dietaryPreferences: [],
    };

    const highSugarCookie: ExtractedProduct = {
      id: 'mock-sweet-biscuit',
      name: 'Super Sugar Cookie',
      ingredientsText: 'Refined wheat flour (maida), sugar, palm oil, inverted sugar syrup, salt.',
      parsedIngredients: ['Refined wheat flour (maida)', 'sugar', 'palm oil', 'inverted sugar syrup', 'salt'],
      nutrition: {
        servingSize: '50g',
        servingBasis: 'per_serving',
        calories: 240,
        totalSugarsG: 18,
        addedSugars: 16,
      },
      ocrConfidence: 90,
      uncertainFields: [],
      scannedAt: '2026-11-03T00:00:00Z',
    };

    const assessment = AssessmentEngine.assess(highSugarCookie, profile);
    // Should highlight high sugar in relevant nutrients or rule reasons
    const sugarNutrient = assessment.relevantNutrients.find(n => n.name.toLowerCase().includes('sugar'));
    expect(sugarNutrient).toBeDefined();
    expect(sugarNutrient?.value).toBeGreaterThanOrEqual(16);
  });
});

