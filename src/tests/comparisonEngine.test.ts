import { describe, it, expect } from 'vitest';
import { ComparisonEngine } from '../lib/assessment/comparisonEngine';
import { SAMPLE_PRODUCTS } from '../lib/sampleProducts';

describe('ComparisonEngine', () => {
  it('correctly calculates differences per declared serving', () => {
    const prodA = SAMPLE_PRODUCTS[0]; // Granola Bar (190 kcal, 140mg sodium, 11g added sugar)
    const prodB = SAMPLE_PRODUCTS[1]; // Greek Yogurt (60 kcal, 65mg sodium, 0g added sugar)

    const comparison = ComparisonEngine.compare(prodA, prodB, 'per_serving');

    expect(comparison.productA.id).toBe(prodA.id);
    expect(comparison.productB.id).toBe(prodB.id);

    const calDiff = comparison.differences.find(d => d.nutrient === 'Calories');
    expect(calDiff).toBeDefined();
    expect(calDiff?.valueA).toBe(190);
    expect(calDiff?.valueB).toBe(60);
    expect(calDiff?.difference).toBe(130);
    expect(calDiff?.higherIn).toBe('A');

    const sugarDiff = comparison.differences.find(d => d.nutrient === 'Added Sugars');
    expect(sugarDiff?.valueA).toBe(11);
    expect(sugarDiff?.valueB).toBe(0);

    expect(comparison.tradeOffSummary).toContain('Trade-off analysis');
  });

  it('normalizes to 100g basis when requested', () => {
    const prodA = SAMPLE_PRODUCTS[0]; // Granola: 42g serving, 190 kcal -> 190 * (100 / 42) = ~452.4 kcal per 100g
    const prodB = SAMPLE_PRODUCTS[1]; // Yogurt: 150g serving, 60 kcal -> 60 * (100 / 150) = 40 kcal per 100g

    const comparison = ComparisonEngine.compare(prodA, prodB, 'per_100g');
    const calDiff = comparison.differences.find(d => d.nutrient === 'Calories');

    expect(calDiff?.valueA).toBeCloseTo(452.4, 0);
    expect(calDiff?.valueB).toBe(40);
  });
});

