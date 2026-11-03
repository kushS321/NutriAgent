import { ExtractedProduct, ProductComparison } from '@/types/nutrition';
import { AssessmentEngine } from './rulesEngine';
import { UserRepository } from '../storage/userRepository';

export class ComparisonEngine {
  public static compare(
    productA: ExtractedProduct,
    productB: ExtractedProduct,
    servingBasis: 'per_serving' | 'per_100g' = 'per_serving'
  ): ProductComparison {
    const profile = UserRepository.getProfile();
    const assessA = AssessmentEngine.assess(productA, profile);
    const assessB = AssessmentEngine.assess(productB, profile);

    // Multiplier if normalizing to 100g
    const getMultiplier = (prod: ExtractedProduct): number => {
      if (servingBasis === 'per_serving') return 1;
      const grams = prod.nutrition.servingSizeGrams || 100;
      return grams > 0 ? 100 / grams : 1;
    };

    const multA = getMultiplier(productA);
    const multB = getMultiplier(productB);

    const calcValue = (raw: number | undefined, mult: number): number | undefined => {
      if (raw === undefined) return undefined;
      return Math.round(raw * mult * 10) / 10;
    };

    const diffItems = [
      {
        nutrient: 'Calories',
        valA: calcValue(productA.nutrition.calories, multA),
        valB: calcValue(productB.nutrition.calories, multB),
        unit: 'kcal',
      },
      {
        nutrient: 'Total Sugars',
        valA: calcValue(productA.nutrition.totalSugarsG, multA),
        valB: calcValue(productB.nutrition.totalSugarsG, multB),
        unit: 'g',
      },
      {
        nutrient: 'Added Sugars',
        valA: calcValue(productA.nutrition.addedSugarsG, multA),
        valB: calcValue(productB.nutrition.addedSugarsG, multB),
        unit: 'g',
      },
      {
        nutrient: 'Sodium',
        valA: calcValue(productA.nutrition.sodiumMg, multA),
        valB: calcValue(productB.nutrition.sodiumMg, multB),
        unit: 'mg',
      },
      {
        nutrient: 'Dietary Fiber',
        valA: calcValue(productA.nutrition.dietaryFiberG, multA),
        valB: calcValue(productB.nutrition.dietaryFiberG, multB),
        unit: 'g',
      },
      {
        nutrient: 'Protein',
        valA: calcValue(productA.nutrition.proteinG, multA),
        valB: calcValue(productB.nutrition.proteinG, multB),
        unit: 'g',
      },
      {
        nutrient: 'Total Fat',
        valA: calcValue(productA.nutrition.totalFatG, multA),
        valB: calcValue(productB.nutrition.totalFatG, multB),
        unit: 'g',
      },
      {
        nutrient: 'Saturated Fat',
        valA: calcValue(productA.nutrition.saturatedFatG, multA),
        valB: calcValue(productB.nutrition.saturatedFatG, multB),
        unit: 'g',
      },
    ];

    const differences = diffItems.map(item => {
      const vA = item.valA;
      const vB = item.valB;

      if (vA === undefined || vB === undefined) {
        return {
          nutrient: item.nutrient,
          valueA: vA,
          valueB: vB,
          unit: item.unit,
          difference: 0,
          higherIn: 'unknown' as const,
          context: 'One or both labels did not list this nutrient explicitly.',
        };
      }

      const diff = Math.round((vA - vB) * 10) / 10;
      let higherIn: 'A' | 'B' | 'equal' = 'equal';
      if (diff > 0.1) higherIn = 'A';
      else if (diff < -0.1) higherIn = 'B';

      let context = '';
      if (higherIn === 'equal') {
        context = `Both products contain identical amounts (${vA} ${item.unit}).`;
      } else {
        const higherProd = higherIn === 'A' ? productA.name : productB.name;
        context = `${higherProd} provides ${Math.abs(diff)} ${item.unit} more ${item.nutrient.toLowerCase()}.`;
      }

      return {
        nutrient: item.nutrient,
        valueA: vA,
        valueB: vB,
        unit: item.unit,
        difference: diff,
        higherIn,
        context,
      };
    });

    // Objective trade-off explanation (No claiming one is universally healthiest!)
    const tradeOffParts: string[] = [];

    // Sugar trade-off
    const sugarDiff = differences.find(d => d.nutrient === 'Added Sugars' || d.nutrient === 'Total Sugars');
    if (sugarDiff && sugarDiff.higherIn !== 'equal' && sugarDiff.higherIn !== 'unknown') {
      const lower = sugarDiff.higherIn === 'A' ? productB.name : productA.name;
      tradeOffParts.push(`${lower} has lower sugar content`);
    }

    // Sodium trade-off
    const sodiumDiff = differences.find(d => d.nutrient === 'Sodium');
    if (sodiumDiff && sodiumDiff.higherIn !== 'equal' && sodiumDiff.higherIn !== 'unknown') {
      const lower = sodiumDiff.higherIn === 'A' ? productB.name : productA.name;
      tradeOffParts.push(`${lower} provides less sodium`);
    }

    // Fiber / Protein trade-off
    const fiberDiff = differences.find(d => d.nutrient === 'Dietary Fiber');
    if (fiberDiff && fiberDiff.higherIn !== 'equal' && fiberDiff.higherIn !== 'unknown') {
      const higher = fiberDiff.higherIn === 'A' ? productA.name : productB.name;
      tradeOffParts.push(`${higher} offers more dietary fiber`);
    }

    const tradeOffSummary = tradeOffParts.length > 0
      ? `Trade-off analysis: ${tradeOffParts.join(', while ')}. Nutritional suitability depends on whether your current focus is managing blood pressure, blood glucose, or satiety.`
      : 'Both products have comparable primary macronutrient profiles. Compare ingredient lists and allergen declarations to determine personal fit.';

    return {
      id: `comp-${Date.now()}`,
      productA,
      productB,
      assessmentA: assessA,
      assessmentB: assessB,
      servingBasisComparison: servingBasis,
      differences,
      tradeOffSummary,
      createdAt: new Date().toISOString(),
    };
  }
}

