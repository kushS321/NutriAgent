import { describe, it, expect } from 'vitest';
import { parseNutritionFromText } from '../lib/ocr/ocrAdapter';

describe('OCR Heuristic Parser', () => {
  it('correctly parses standard Nutrition Facts label text', () => {
    const rawLabelText = `
Nutrition Facts
Serving Size: 2 bars (42g)
Servings Per Container: 6
Calories: 190
Total Fat: 7g
Saturated Fat: 1g
Trans Fat: 0g
Cholesterol: 0mg
Sodium: 140mg
Total Carbohydrate: 29g
Dietary Fiber: 2g
Total Sugars: 12g
Includes 11g Added Sugars
Protein: 3g
Ingredients: Whole Grain Oats, Sugar, Canola Oil, Rice Flour, Honey, Salt.
Contains: Soy.
    `;

    const product = parseNutritionFromText(rawLabelText, "Granola Bar Test");

    expect(product.name).toBe("Granola Bar Test");
    expect(product.nutrition.servingSize).toContain('2 bars');
    expect(product.nutrition.calories).toBe(190);
    expect(product.nutrition.totalFatG).toBe(7);
    expect(product.nutrition.saturatedFatG).toBe(1);
    expect(product.nutrition.sodiumMg).toBe(140);
    expect(product.nutrition.totalCarbohydratesG).toBe(29);
    expect(product.nutrition.dietaryFiberG).toBe(2);
    expect(product.nutrition.totalSugarsG).toBe(12);
    expect(product.nutrition.addedSugarsG).toBe(11);
    expect(product.nutrition.proteinG).toBe(3);
    expect(product.ingredientsText).toContain('Whole Grain Oats');
    expect(product.parsedIngredients.length).toBeGreaterThan(3);
    expect(product.ocrConfidence).toBeGreaterThanOrEqual(80);
  });

  it('marks uncertainFields when essential fields are absent', () => {
    const incompleteText = `
Organic Apple Juice
Ingredients: Apple juice concentrate, ascorbic acid.
    `;

    const product = parseNutritionFromText(incompleteText, "Apple Juice");

    expect(product.uncertainFields).toContain('calories');
    expect(product.uncertainFields).toContain('sodiumMg');
    expect(product.uncertainFields).toContain('totalCarbohydratesG');
  });
});

