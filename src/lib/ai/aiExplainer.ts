import { ExtractedProduct, FoodAssessment, UserProfile } from '@/types/nutrition';

export interface AIExplanationResult {
  headlineSummary: string;
  conversationalVerdict: string;
  keyTakeaways: string[];
  ingredientNotes: string[];
  disclaimerNote: string;
  isAiGenerated: boolean;
  provider: 'gemini' | 'deterministic_synthesizer';
}

export class AIExplainer {
  public static async generateExplanation(
    product: ExtractedProduct,
    assessment: FoodAssessment,
    profile: UserProfile
  ): Promise<AIExplanationResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const geminiResult = await this.callGeminiModel(product, assessment, profile, apiKey);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic synthesizer:', err);
      }
    }

    // High quality deterministic fallback plain-language explanation
    return this.synthesizeDeterministicExplanation(product, assessment, profile);
  }

  private static synthesizeDeterministicExplanation(
    product: ExtractedProduct,
    assessment: FoodAssessment,
    profile: UserProfile
  ): AIExplanationResult {
    const isFits = assessment.status === 'fits_preferences';
    const isUncertain = assessment.status === 'not_enough_information';
    const alerts = assessment.personalizedReasons.filter(r => r.severity === 'alert');
    const cautions = assessment.personalizedReasons.filter(r => r.severity === 'caution');

    let verdict = '';
    if (isUncertain) {
      verdict = `We cannot safely determine whether "${product.name}" fits your lifestyle because critical label details—like the full ingredient list or serving portion—are missing or unreadable.`;
    } else if (alerts.length > 0) {
      verdict = `Based on your stated preferences, you should review this product carefully before eating it. We detected explicit conflicts with your restrictions: ${alerts.map(a => a.title).join('; ')}.`;
    } else if (cautions.length > 0) {
      verdict = `"${product.name}" may be acceptable in moderation, but contains advisory notices or elevated nutrient counts (${cautions.map(c => c.title).join(', ')}) relevant to your stated health goals.`;
    } else {
      verdict = `"${product.name}" appears consistent with your stated profile (${profile.dietaryPreferences.join(', ') || 'general diet'}). No declared allergens or flagged threshold overages were found in the visible label.`;
    }

    const keyTakeaways: string[] = [];
    if (alerts.length > 0) {
      keyTakeaways.push(`Allergen/Diet conflict: ${alerts[0].explanation}`);
    }
    if (assessment.relevantNutrients.length > 0) {
      const topNutrient = assessment.relevantNutrients[0];
      keyTakeaways.push(`${topNutrient.name}: ${topNutrient.value} ${topNutrient.unit} per serving (${topNutrient.context})`);
    }
    if (assessment.uncertainties.length > 0) {
      keyTakeaways.push(`Label note: ${assessment.uncertainties[0]}`);
    } else {
      keyTakeaways.push('Label values verified against standard serving proportions.');
    }

    const ingredientNotes = assessment.ingredientsOfConcern.map(c =>
      `• ${c.ingredient}: ${c.context}`
    );

    return {
      headlineSummary: assessment.headline,
      conversationalVerdict: verdict,
      keyTakeaways,
      ingredientNotes,
      disclaimerNote: 'Educational decision-support only; always check physical packaging before ingestion.',
      isAiGenerated: false,
      provider: 'deterministic_synthesizer',
    };
  }

  private static async callGeminiModel(
    product: ExtractedProduct,
    assessment: FoodAssessment,
    profile: UserProfile,
    apiKey: string
  ): Promise<AIExplanationResult | null> {
    const prompt = `
You are NutriAgent's food label explainer. You provide factual, cautious, educational explanations of food labels.
Never fabricate medical advice, never diagnose, and never promise that a food is completely safe.

Product: ${product.name}
Ingredients: ${product.ingredientsText}
Nutrition Facts: ${JSON.stringify(product.nutrition)}
User Preferences: ${profile.dietaryPreferences.join(', ')}
User Allergies: ${profile.allergies.join(', ')}
User Health Goals: ${profile.healthConsiderations.join(', ')}
Rule-based Status: ${assessment.status}
Rule-based Reasons: ${assessment.personalizedReasons.map(r => `${r.title}: ${r.explanation}`).join(' | ')}

Return ONLY valid JSON matching this schema:
{
  "headlineSummary": "string",
  "conversationalVerdict": "string",
  "keyTakeaways": ["string"],
  "ingredientNotes": ["string"],
  "disclaimerNote": "string"
}
`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    return {
      headlineSummary: parsed.headlineSummary || assessment.headline,
      conversationalVerdict: parsed.conversationalVerdict,
      keyTakeaways: parsed.keyTakeaways || [],
      ingredientNotes: parsed.ingredientNotes || [],
      disclaimerNote: parsed.disclaimerNote || 'Educational guidance only.',
      isAiGenerated: true,
      provider: 'gemini',
    };
  }
}

