import { ExtractedProduct, NutritionData } from '@/types/nutrition';

export interface OCRResult {
  product: ExtractedProduct;
  rawText: string;
  provider: 'gemini_vision' | 'heuristic_parser' | 'sample_matcher' | 'manual_entry';
  isSimulated: boolean;
  warnings: string[];
}

/**
 * Robust regex parser to extract standard Nutrition Facts from OCR string
 */
export function parseNutritionFromText(rawText: string, productNameHint?: string): ExtractedProduct {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const textLower = rawText.toLowerCase();

  const nutrition: NutritionData = {
    servingSize: '1 serving',
    servingBasis: 'per_serving',
  };

  const uncertainFields: string[] = [];

  // 1. Serving Size
  const servingMatch = rawText.match(/serving\s*size\s*[:\-]?\s*([^\n\r]+)/i);
  if (servingMatch) {
    nutrition.servingSize = servingMatch[1].trim();
    const gramsMatch = nutrition.servingSize.match(/(\d+(?:\.\d+)?)\s*g/i);
    if (gramsMatch) {
      nutrition.servingSizeGrams = parseFloat(gramsMatch[1]);
    }
  } else {
    uncertainFields.push('servingSize');
  }

  // Helper number extractor
  const extractNumber = (patterns: RegExp[]): number | undefined => {
    for (const pat of patterns) {
      const match = rawText.match(pat);
      if (match && match[1]) {
        const val = parseFloat(match[1]);
        if (!isNaN(val)) return val;
      }
    }
    return undefined;
  };

  // Calories
  nutrition.calories = extractNumber([
    /calories\s*[:\-]?\s*(\d+)/i,
    /energy\s*[:\-]?\s*(\d+)\s*kcal/i,
  ]);
  if (nutrition.calories === undefined) uncertainFields.push('calories');

  // Total Fat
  nutrition.totalFatG = extractNumber([
    /total\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Saturated Fat
  nutrition.saturatedFatG = extractNumber([
    /saturated\s*(?:fat)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /sat(?:\.|\s*)\s*fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Trans Fat
  nutrition.transFatG = extractNumber([
    /trans\s*(?:fat)?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Cholesterol
  nutrition.cholesterolMg = extractNumber([
    /cholesterol\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
  ]);

  // Sodium
  nutrition.sodiumMg = extractNumber([
    /sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
    /salt\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i,
  ]);
  if (nutrition.sodiumMg === undefined) uncertainFields.push('sodiumMg');

  // Total Carbohydrate
  nutrition.totalCarbohydratesG = extractNumber([
    /total\s*carb(?:ohydrate)?s?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /carb(?:ohydrate)?s?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);
  if (nutrition.totalCarbohydratesG === undefined) uncertainFields.push('totalCarbohydratesG');

  // Dietary Fiber
  nutrition.dietaryFiberG = extractNumber([
    /dietary\s*fiber\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /fiber\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /fibre\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Total Sugars
  nutrition.totalSugarsG = extractNumber([
    /total\s*sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
    /sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Added Sugars
  nutrition.addedSugarsG = extractNumber([
    /(?:includes|incl\.)?\s*(\d+(?:\.\d+)?)\s*g\s*added\s*sugars?/i,
    /added\s*sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);

  // Protein
  nutrition.proteinG = extractNumber([
    /protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i,
  ]);
  if (nutrition.proteinG === undefined) uncertainFields.push('proteinG');

  // Potassium & Calcium & Iron
  nutrition.potassiumMg = extractNumber([/potassium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i]);
  nutrition.calciumMg = extractNumber([/calcium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i]);
  nutrition.ironMg = extractNumber([/iron\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i]);

  // Extract Ingredients
  let ingredientsText = '';
  const ingMatch = rawText.match(/ingredients\s*[:\-]?\s*([^\n\r]+(?:\n[^\n\r]+)*)/i);
  if (ingMatch) {
    ingredientsText = ingMatch[1].replace(/contains:?.*$/i, '').trim();
  } else {
    // Look for lines containing commas and food words
    const candidateLines = lines.filter(l => l.includes(',') && !l.toLowerCase().includes('calories'));
    if (candidateLines.length > 0) {
      ingredientsText = candidateLines.join(' ');
    } else {
      uncertainFields.push('ingredientsText');
    }
  }

  // Parse comma-separated ingredients
  const parsedIngredients = ingredientsText
    .split(/[,;]/)
    .map(i => i.trim().replace(/^[\(\)]+|[\(\)]+$/g, ''))
    .filter(i => i.length > 1 && !i.startsWith('%'));

  // Extract Allergen Warning (Contains / May contain)
  let allergenWarningText: string | undefined = undefined;
  const allergenMatch = rawText.match(/(?:contains|allergen|may contain)\s*[:\-]?\s*([^\n\r]+)/i);
  if (allergenMatch) {
    allergenWarningText = allergenMatch[0].trim();
  }

  // Calculate heuristic OCR confidence
  let confidence = 85;
  if (uncertainFields.includes('ingredientsText')) confidence -= 30;
  if (uncertainFields.includes('calories')) confidence -= 10;
  if (uncertainFields.includes('sodiumMg')) confidence -= 10;
  if (uncertainFields.includes('totalCarbohydratesG')) confidence -= 10;
  confidence = Math.max(30, Math.min(98, confidence));

  // Product name guess
  const productName = productNameHint || lines[0] || 'Scanned Food Product';

  return {
    id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: productName,
    ingredientsText: ingredientsText || 'Ingredients not detected. Please enter manually.',
    parsedIngredients,
    allergenWarningText,
    nutrition,
    ocrConfidence: confidence,
    uncertainFields,
    scannedAt: new Date().toISOString(),
    isSampleData: false,
  };
}

