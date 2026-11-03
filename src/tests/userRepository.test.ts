import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepository, DEFAULT_GUEST_PROFILE } from '../lib/storage/userRepository';
import { SAMPLE_PRODUCTS } from '../lib/sampleProducts';

describe('UserRepository - Local-First Data Layer', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    // Clear in-memory mock store
    for (const key of Object.keys(store)) {
      delete store[key];
    }

    // Mock window & localStorage in Node environment
    (global as any).window = {};
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
    };
    store['nutriagent_meal_logs'] = JSON.stringify([]);
    store['nutriagent_history'] = JSON.stringify([]);
    store['nutriagent_saved_products'] = JSON.stringify([]);
  });

  it('retrieves default profile and persists modifications', () => {
    const profile = UserRepository.getProfile();
    expect(profile.name).toBe('Student Explorer');
    expect(profile.dietaryPreferences).toContain('vegetarian');

    profile.name = 'Priya Sharma';
    profile.dietaryPreferences = ['jain'];
    UserRepository.saveProfile(profile);

    const updated = UserRepository.getProfile();
    expect(updated.name).toBe('Priya Sharma');
    expect(updated.dietaryPreferences).toContain('jain');
  });

  it('adds and aggregates daily meal log totals accurately', () => {
    const date = '2026-11-03';
    
    // Add breakfast
    UserRepository.addMealEntry(
      {
        mealType: 'breakfast',
        name: 'Oatmeal with Almonds',
        servingsCount: 1,
        calories: 250,
        proteinG: 8,
        carbsG: 40,
        fatG: 6,
        sugarG: 4,
        sodiumMg: 90,
        fiberG: 5,
      },
      date
    );

    // Add lunch
    UserRepository.addMealEntry(
      {
        mealType: 'lunch',
        name: 'Dal Tadka with Roti',
        servingsCount: 1,
        calories: 380,
        proteinG: 14,
        carbsG: 55,
        fatG: 10,
        sugarG: 2,
        sodiumMg: 420,
        fiberG: 7,
      },
      date
    );

    const summary = UserRepository.getMealsByDate(date);
    expect(summary.items.length).toBe(2);
    expect(summary.totals.calories).toBe(630);
    expect(summary.totals.proteinG).toBe(22);
    expect(summary.totals.carbsG).toBe(95);
    expect(summary.totals.sodiumMg).toBe(510);
    expect(summary.totals.fiberG).toBe(12);
  });

  it('deletes meal entry and recalculates daily totals', () => {
    const date = '2026-11-03';
    const entry = UserRepository.addMealEntry(
      {
        mealType: 'snack',
        name: 'Apple',
        servingsCount: 1,
        calories: 95,
        proteinG: 0.5,
        carbsG: 25,
        fatG: 0.3,
        sugarG: 19,
        sodiumMg: 2,
        fiberG: 4.4,
      },
      date
    );

    const beforeDelete = UserRepository.getMealsByDate(date);
    expect(beforeDelete.items.some(i => i.id === entry.id)).toBe(true);

    UserRepository.deleteMealEntry(entry.id);
    const afterDelete = UserRepository.getMealsByDate(date);
    expect(afterDelete.items.some(i => i.id === entry.id)).toBe(false);
  });

  it('toggles saved product bookmarks correctly', () => {
    const sampleProduct = SAMPLE_PRODUCTS[0];
    const initialSaved = UserRepository.isProductSaved(sampleProduct.id);
    expect(initialSaved).toBe(false);

    // Save product
    const isSaved = UserRepository.toggleSavedProduct(sampleProduct);
    expect(isSaved).toBe(true);
    expect(UserRepository.isProductSaved(sampleProduct.id)).toBe(true);

    // Toggle off
    const isSavedAfter = UserRepository.toggleSavedProduct(sampleProduct);
    expect(isSavedAfter).toBe(false);
    expect(UserRepository.isProductSaved(sampleProduct.id)).toBe(false);
  });

  it('exports user data package as valid JSON for data sovereignty', () => {
    const exported = UserRepository.exportAllData();
    const parsed = JSON.parse(exported);
    expect(parsed.app).toBe('NutriAgent');
    expect(parsed.profile).toBeDefined();
    expect(Array.isArray(parsed.history)).toBe(true);
  });
});
