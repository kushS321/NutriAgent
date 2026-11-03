import { ExtractedProduct } from '@/types/nutrition';
import { SAMPLE_PRODUCTS } from '../sampleProducts';

/**
 * Open Food Facts API Client
 * Official endpoint: https://world.openfoodfacts.org/api/v2/product/{barcode}.json
 * User-Agent format: NutriAgent - Web - Version 1.0 - www.nutriagent.local
 */

const OFF_API_BASE = 'https://world.openfoodfacts.org/api/v2/product';
const OFF_SEARCH_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

export class OpenFoodFactsService {
  /**
   * Fetch a single packaged food product by Barcode (EAN-13, UPC-A, etc.)
   */
  public static async getProductByBarcode(barcode: string): Promise<ExtractedProduct | null> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return null;

    // Check local sample products first for instant response & offline reliability
    const localMatch = SAMPLE_PRODUCTS.find(
      (p) => p.barcode === cleanBarcode || p.id === cleanBarcode
    );
    if (localMatch) {
      return {
        ...localMatch,
        provenance: 'sample_catalog',
      };
    }

    try {
      const url = `${OFF_API_BASE}/${encodeURIComponent(cleanBarcode)}.json?fields=code,product_name,brands,ingredients_text,ingredients_tags,allergens_tags,nutriments,serving_size,serving_quantity,quantity,image_front_url,nova_group,ecoscore_grade`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NutriAgent - Web - Version 1.0 - www.nutriagent.local',
          Accept: 'application/json',
        },
        next: { revalidate: 3600 }, // Cache 1 hour
      });

      if (!response.ok) {
        console.warn(`Open Food Facts API error HTTP ${response.status} for barcode ${cleanBarcode}`);
        return null;
      }

      const data = await response.json();
      if (data.status !== 1 || !data.product) {
        return null;
      }

      return this.normalizeOFFProduct(data.product, cleanBarcode);
    } catch (err) {
      console.warn('Network error reaching Open Food Facts API:', err);
      return null;
    }
  }

  /**
   * Search Open Food Facts by food product name or brand
   */
  public static async searchProducts(query: string, limit = 8): Promise<ExtractedProduct[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    // Filter local catalog first
    const localMatches = SAMPLE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(cleanQuery) ||
        (p.brand && p.brand.toLowerCase().includes(cleanQuery)) ||
        (p.category && p.category.toLowerCase().includes(cleanQuery))
    );

    try {
      const url = `${OFF_SEARCH_BASE}?search_terms=${encodeURIComponent(
        cleanQuery
      )}&search_simple=1&action=process&json=1&page_size=${limit}&fields=code,product_name,brands,ingredients_text,ingredients_tags,allergens_tags,nutriments,serving_size,serving_quantity,quantity,image_front_url,nova_group,ecoscore_grade`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'NutriAgent - Web - Version 1.0 - www.nutriagent.local',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return localMatches.slice(0, limit);
      }

      const data = await response.json();
      const products: any[] = data.products || [];

      const normalizedList = products
        .map((p) => this.normalizeOFFProduct(p, p.code))
        .filter((p): p is ExtractedProduct => p !== null);

      // Merge local and remote, deduplicating by ID or barcode
      const combined = [...localMatches];
      for (const item of normalizedList) {
        if (!combined.some((c) => c.barcode === item.barcode || c.name === item.name)) {
          combined.push(item);
        }
      }

      return combined.slice(0, limit);
    } catch (err) {
      console.warn('OFF Search failed, returning local matches:', err);
      return localMatches.slice(0, limit);
    }
  }

  /**
   * Normalizes Open Food Facts raw product JSON into NutriAgent ExtractedProduct
   */
  public static normalizeOFFProduct(raw: any, barcode?: string): ExtractedProduct {
    const nutriments = raw.nutriments || {};
    const servingSize = raw.serving_size || '1 serving (100g)';
    const servingGrams = raw.serving_quantity ? parseFloat(raw.serving_quantity) : undefined;

    // Calories: try energy-kcal_serving, then energy-kcal_100g, or convert kJ
    let calories = nutriments['energy-kcal_serving'] ?? nutriments['energy-kcal_100g'];
    if (calories === undefined && nutriments['energy_100g']) {
      calories = Math.round(nutriments['energy_100g'] / 4.184);
    }

    // Per serving or per 100g
    const totalFatG = nutriments['fat_serving'] ?? nutriments['fat_100g'];
    const saturatedFatG = nutriments['saturated-fat_serving'] ?? nutriments['saturated-fat_100g'];
    const transFatG = nutriments['trans-fat_serving'] ?? nutriments['trans-fat_100g'];
    const cholesterolMg = nutriments['cholesterol_serving']
      ? nutriments['cholesterol_serving'] * 1000
      : nutriments['cholesterol_100g']
      ? nutriments['cholesterol_100g'] * 1000
      : undefined;

    // Sodium in mg (OFF often gives sodium in g or salt in g)
    let sodiumMg = nutriments['sodium_serving']
      ? nutriments['sodium_serving'] * 1000
      : nutriments['sodium_100g']
      ? nutriments['sodium_100g'] * 1000
      : undefined;
    if (sodiumMg === undefined && nutriments['salt_100g'] !== undefined) {
      sodiumMg = Math.round((nutriments['salt_100g'] / 2.5) * 1000); // 1g salt ≈ 400mg sodium
    }

    const totalCarbohydratesG = nutriments['carbohydrates_serving'] ?? nutriments['carbohydrates_100g'];
    const totalSugarsG = nutriments['sugars_serving'] ?? nutriments['sugars_100g'];
    const addedSugarsG = nutriments['added-sugars_serving'] ?? nutriments['added-sugars_100g'];
    const dietaryFiberG = nutriments['fiber_serving'] ?? nutriments['fiber_100g'];
    const proteinG = nutriments['proteins_serving'] ?? nutriments['proteins_100g'];

    const rawIngredients = raw.ingredients_text || '';
    const parsedIngredients = rawIngredients
      ? rawIngredients
          .split(/[,;]/)
          .map((i: string) => i.trim().replace(/^[\(\)]+|[\(\)]+$/g, ''))
          .filter((i: string) => i.length > 1)
      : [];

    // Allergens
    let allergenWarning = '';
    if (Array.isArray(raw.allergens_tags) && raw.allergens_tags.length > 0) {
      const cleanTags = raw.allergens_tags
        .map((t: string) => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' '))
        .join(', ');
      allergenWarning = `Contains: ${cleanTags}`;
    }

    const uncertainFields: string[] = [];
    if (!rawIngredients) uncertainFields.push('ingredients');
    if (calories === undefined) uncertainFields.push('calories');
    if (sodiumMg === undefined) uncertainFields.push('sodium');

    return {
      id: raw.code || barcode || `off-${Date.now()}`,
      name: raw.product_name || raw.product_name_en || 'Packaged Food Product',
      brand: raw.brands || undefined,
      barcode: raw.code || barcode,
      category: raw.categories || 'Packaged Foods',
      ingredientsText: rawIngredients || 'Ingredient declaration not provided in Open Food Facts record.',
      parsedIngredients,
      allergenWarningText: allergenWarning || undefined,
      nutrition: {
        servingSize,
        servingSizeGrams: servingGrams,
        servingBasis: raw.serving_size ? 'per_serving' : 'per_100g',
        calories: calories ? Math.round(calories) : undefined,
        totalFatG: totalFatG !== undefined ? Math.round(totalFatG * 10) / 10 : undefined,
        saturatedFatG: saturatedFatG !== undefined ? Math.round(saturatedFatG * 10) / 10 : undefined,
        transFatG: transFatG !== undefined ? Math.round(transFatG * 10) / 10 : undefined,
        cholesterolMg: cholesterolMg !== undefined ? Math.round(cholesterolMg) : undefined,
        sodiumMg: sodiumMg !== undefined ? Math.round(sodiumMg) : undefined,
        totalCarbohydratesG: totalCarbohydratesG !== undefined ? Math.round(totalCarbohydratesG * 10) / 10 : undefined,
        dietaryFiberG: dietaryFiberG !== undefined ? Math.round(dietaryFiberG * 10) / 10 : undefined,
        totalSugarsG: totalSugarsG !== undefined ? Math.round(totalSugarsG * 10) / 10 : undefined,
        addedSugarsG: addedSugarsG !== undefined ? Math.round(addedSugarsG * 10) / 10 : undefined,
        proteinG: proteinG !== undefined ? Math.round(proteinG * 10) / 10 : undefined,
      },
      nutritionPer100g: {
        servingSize: '100g / 100ml',
        servingBasis: 'per_100g',
        calories: nutriments['energy-kcal_100g'] ? Math.round(nutriments['energy-kcal_100g']) : undefined,
        totalFatG: nutriments['fat_100g'] !== undefined ? Math.round(nutriments['fat_100g'] * 10) / 10 : undefined,
        saturatedFatG: nutriments['saturated-fat_100g'] !== undefined ? Math.round(nutriments['saturated-fat_100g'] * 10) / 10 : undefined,
        transFatG: nutriments['trans-fat_100g'] !== undefined ? Math.round(nutriments['trans-fat_100g'] * 10) / 10 : undefined,
        sodiumMg: nutriments['sodium_100g'] !== undefined ? Math.round(nutriments['sodium_100g'] * 1000) : undefined,
        totalCarbohydratesG: nutriments['carbohydrates_100g'] !== undefined ? Math.round(nutriments['carbohydrates_100g'] * 10) / 10 : undefined,
        dietaryFiberG: nutriments['fiber_100g'] !== undefined ? Math.round(nutriments['fiber_100g'] * 10) / 10 : undefined,
        totalSugarsG: nutriments['sugars_100g'] !== undefined ? Math.round(nutriments['sugars_100g'] * 10) / 10 : undefined,
        proteinG: nutriments['proteins_100g'] !== undefined ? Math.round(nutriments['proteins_100g'] * 10) / 10 : undefined,
      },
      ocrConfidence: 95,
      imageUri: raw.image_front_url || undefined,
      uncertainFields,
      scannedAt: new Date().toISOString(),
      isSampleData: false,
      provenance: 'open_food_facts',
      novaGroup: raw.nova_group ? parseInt(raw.nova_group) : undefined,
      ecoScore: raw.ecoscore_grade?.toUpperCase() || undefined,
    };
  }
}

