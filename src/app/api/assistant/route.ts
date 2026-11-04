import { NextRequest, NextResponse } from 'next/server';
import { COMMON_FOOD_ADDITIVES } from '@/lib/assessment/allergenDict';
import { STANDARD_DAILY_VALUES } from '@/lib/assessment/rulesEngine';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, activeProduct, userProfile } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'A question string is required.' },
        { status: 400 }
      );
    }

    const qLower = question.toLowerCase();

    // 1. Check if GEMINI_API_KEY is available for multimodal LLM synthesis
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && !geminiKey.includes('your-gemini')) {
      try {
        const responseText = await callGeminiAPI(geminiKey, question, activeProduct, userProfile);
        if (responseText) {
          return NextResponse.json({
            success: true,
            answer: responseText,
            source: 'gemini-2.5-flash',
            disclaimer: 'NutriAgent is an educational decision-support tool, not a medical diagnostic or treatment service.',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to rule-based assistant:', geminiError);
      }
    }

    // 2. Deterministic Knowledge & Rule-Based Nutrition Assistant
    const answerData = generateRuleBasedAnswer(qLower, activeProduct, userProfile);

    return NextResponse.json({
      success: true,
      answer: answerData.text,
      citations: answerData.citations,
      suggestedFollowUps: answerData.followUps,
      source: 'nutriagent-rules-engine',
      disclaimer: 'Informational decision support based on ICMR-NIN 2024 and FSSAI 2022 guidelines. Not medical advice.',
    });
  } catch (error) {
    console.error('API /api/assistant error:', error);
    return NextResponse.json(
      { error: 'Failed to process nutrition inquiry.' },
      { status: 500 }
    );
  }
}

/**
 * Gemini 1.5 Flash server-side handler
 */
async function callGeminiAPI(
  apiKey: string,
  question: string,
  product?: any,
  profile?: any
): Promise<string | null> {
  const systemPrompt = `You are NutriAgent Nutrition Assistant, an evidence-aware food label expert built on ICMR-NIN 2024 Dietary Guidelines for Indians, FSSAI regulations, and WHO standards.
Rules:
1. Always be helpful, objective, transparent, and concise (under 180 words).
2. Answer the user's specific food or label question directly.
3. Cite reliable sources: ICMR-NIN 2024, FSSAI 2022, or WHO.
4. If asked "Can I eat this?", evaluate the product facts against the user's preferences, stating evidence clearly.
5. NEVER fabricate nutrition numbers or diagnose medical conditions.
6. Clearly mention that you provide educational guidance, not clinical medical advice.`;

  let userContext = `Question: "${question}"\n`;
  if (product) {
    userContext += `\nCurrently Scanned Product:
- Name: ${product.name} (Brand: ${product.brand || 'N/A'})
- Serving Size: ${product.nutrition?.servingSize || 'N/A'}
- Calories: ${product.nutrition?.calories ?? 'N/A'} kcal
- Sodium: ${product.nutrition?.sodiumMg ?? 'N/A'} mg
- Saturated Fat: ${product.nutrition?.saturatedFatG ?? 'N/A'} g
- Total Sugars: ${product.nutrition?.totalSugarsG ?? 'N/A'} g
- Added Sugars: ${product.nutrition?.addedSugarsG ?? 'N/A'} g
- Protein: ${product.nutrition?.proteinG ?? 'N/A'} g
- Ingredients: ${product.ingredientsText || 'N/A'}
- Allergen Warning: ${product.allergenWarningText || 'None'}`;
  }
  if (profile) {
    userContext += `\n\nUser Profile:
- Dietary Preferences: ${profile.dietaryPreferences?.join(', ') || 'Standard'}
- Stated Allergies: ${profile.allergies?.join(', ') || 'None'}
- Health Priorities: ${profile.healthConsiderations?.join(', ') || 'General health'}
- Ingredients to Avoid: ${profile.customIngredientsToAvoid?.join(', ') || 'None'}`;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userContext}` }],
        },
      ],
        generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    console.error('Gemini API error:', res.status, await res.text());
    return null;
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

/**
 * Intelligent Rule-Based Nutrition Expert System
 */
function generateRuleBasedAnswer(
  q: string,
  product?: any,
  profile?: any
): { text: string; citations: any[]; followUps: string[] } {
  const citations = [];
  const followUps = [];

  // Question 1: Active Product evaluation ("Can I eat this?", "Is this good for me?")
  if (
    product &&
    (q.includes('can i eat') ||
      q.includes('suit') ||
      q.includes('safe') ||
      q.includes('should i') ||
      q.includes('good for me'))
  ) {
    const name = product.name;
    const sodium = product.nutrition?.sodiumMg;
    const sugar = product.nutrition?.addedSugarsG ?? product.nutrition?.totalSugarsG;
    const allergens = product.allergenWarningText || '';
    const ingredients = (product.ingredientsText || '').toLowerCase();

    let issues: string[] = [];
    if (profile?.allergies?.length) {
      for (const a of profile.allergies) {
        if (ingredients.includes(a) || allergens.toLowerCase().includes(a)) {
          issues.push(`Conflicts with your stated "${a}" allergy.`);
        }
      }
    }
    if (profile?.healthConsiderations?.includes('hypertension') && sodium && sodium > 350) {
      issues.push(`Elevated sodium: ${sodium} mg per serving (hypertension target <350mg/serving).`);
    }
    if (
      (profile?.healthConsiderations?.includes('diabetes_type2') ||
        profile?.healthConsiderations?.includes('prediabetes')) &&
      sugar &&
      sugar > 8
    ) {
      issues.push(`High sugar content: ${sugar}g per serving (ICMR-NIN advises limiting added sugars).`);
    }

    citations.push({
      source: 'ICMR-NIN Dietary Guidelines for Indians (2024)',
      guideline: 'Guideline 3 (Added Sugars) & Guideline 5 (Sodium Reduction)',
    });

    if (issues.length > 0) {
      return {
        text: `Based on your stated profile, you should **review this product carefully** before eating:\n\n• ${issues.join(
          '\n• '
        )}\n\nProduct **${name}** contains ${product.nutrition?.calories || 0} kcal, ${
          product.nutrition?.sodiumMg || 0
        }mg sodium, and ${product.nutrition?.totalSugarsG || 0}g sugars per serving. Please inspect physical packaging if you have severe allergies.`,
        citations,
        followUps: ['What are low-sodium alternatives?', 'Explain the allergen statement'],
      };
    } else {
      return {
        text: `Based on your active dietary preferences and stated health goals, **${name}** has no detected direct allergen conflicts or elevated thresholds.\n\nKey Facts:\n• Serving Size: ${
          product.nutrition?.servingSize || 'Standard'
        }\n• Calories: ${product.nutrition?.calories || 0} kcal\n• Protein: ${
          product.nutrition?.proteinG || 0
        }g\n• Sodium: ${product.nutrition?.sodiumMg || 0}mg\n\nAlways verify physical package integrity and expiration date.`,
        citations,
        followUps: ['How do I log this into my meal planner?', 'Compare with another product'],
      };
    }
  }

  // Question 2: Additives & INS Numbers (e.g. MSG, INS 621, INS 322, INS 120, Palm Oil)
  for (const [code, info] of Object.entries(COMMON_FOOD_ADDITIVES)) {
    if (q.includes(code) || q.includes(info.name.toLowerCase()) || (code === 'ins 621' && q.includes('msg'))) {
      citations.push({
        source: 'FSSAI Food Safety and Standards Regulations (2022)',
        guideline: 'Permitted Food Additives and Labelling Declarations',
      });
      return {
        text: `**${info.code} — ${info.name}**\n\n• **Function:** ${info.purpose}\n• **Source Origin:** ${info.origin.toUpperCase()}\n• **Safety & Regulatory Context:** ${info.note}\n\nUnder FSSAI regulations, this additive must be explicitly declared on the package ingredients list by name or INS number.`,
        citations,
        followUps: ['Are food additives safe in moderation?', 'How to spot hidden sugars on labels'],
      };
    }
  }

  // Question 3: Palm oil
  if (q.includes('palm oil')) {
    citations.push({
      source: 'ICMR-NIN Dietary Guidelines for Indians (2024)',
      guideline: 'Guideline 4: Limit Intake of Saturated Fats',
    });
    return {
      text: `**Palm Oil & Palmolein**\n\nPalm oil is one of the most widely used cooking and processing oils in packaged foods due to its high oxidative stability and low cost. However, it contains approximately **50% saturated fatty acids** (primarily palmitic acid).\n\n• **ICMR-NIN 2024 Recommendation:** Saturated fats should contribute less than 10% of total daily energy (~20g for a 2,000 kcal diet).\n• **Impact on Health:** High habitual consumption of palm oil can increase circulating LDL cholesterol. Choosing products made with high-oleic sunflower, mustard, or groundnut oil provides a healthier fatty acid profile.`,
      citations,
      followUps: ['What are healthy cooking oils under ICMR-NIN?', 'How much saturated fat is too much?'],
    };
  }

  // Question 4: Sugar & Added Sugar Limits
  if (q.includes('sugar') || q.includes('added sugar')) {
    citations.push({
      source: 'ICMR-NIN Dietary Guidelines for Indians (2024)',
      guideline: 'Guideline 3: Restrict Intake of Added Sugars (<25g/day)',
    });
    return {
      text: `**ICMR-NIN 2024 Added Sugar Guidelines**\n\n• **Daily Cap:** Less than **25 grams per day** (approx. 5 teaspoons or <5% of total caloric intake) for adults with a 2,000 kcal diet.\n• **Difference:** *Total Sugar* includes naturally occurring sugars (like lactose in milk or fructose in fruit) plus *Added Sugars* (sucrose, glucose syrup, high fructose corn syrup, maltodextrin).\n• **Label Reading Tip:** Ingredients are listed by weight in descending order. If sugar, syrup, or maltodextrin is in the top 3 ingredients, the product is sugar-dense.`,
      citations,
      followUps: ['What are hidden names for sugar?', 'What is the recommended sodium intake?'],
    };
  }

  // Question 5: Sodium & Salt
  if (q.includes('sodium') || q.includes('salt') || q.includes('blood pressure') || q.includes('hypertension')) {
    citations.push({
      source: 'ICMR-NIN 2024 & World Health Organization (WHO)',
      guideline: 'Guideline 5: Limit Salt to <5g/day (<2,000mg sodium)',
    });
    return {
      text: `**Sodium vs Salt: How to Read the Label**\n\n• **Daily Recommendation:** Less than **5 grams of salt** per day, which equals **2,000 mg of sodium** (ICMR-NIN 2024 & WHO).\n• **Hypertension Stricter Target:** The American Heart Association recommends aiming for **1,500 mg sodium daily** for individuals with elevated blood pressure.\n• **Conversion Rule:** Salt (g) = Sodium (g) × 2.5. For example, 800 mg sodium = 0.8g sodium = 2.0g salt (40% of your entire day's allowance in one item!).`,
      citations,
      followUps: ['What foods have hidden high sodium?', 'Explain per 100g vs per serving'],
    };
  }

  // Question 6: Per 100g vs Per Serving
  if (q.includes('per 100') || q.includes('serving size') || q.includes('compare')) {
    citations.push({
      source: 'FSSAI Food Safety and Standards Regulations (2022)',
      guideline: 'Schedule II: Standardized Nutritional Declarations',
    });
    return {
      text: `**Understanding Per 100g vs Per Serving**\n\n• **Per 100g / 100ml:** Standardized baseline for direct comparison between two competing brands. It shows the true nutrient density regardless of container size.\n• **Per Serving:** The amount you actually consume in a typical single portion (e.g., 2 biscuits = 25g; 1 pack = 70g).\n• **Watch out for "Portion Distortion":** A tiny declared serving size can make a high-sugar or high-sodium product look artificially low in nutrients unless you calculate what you actually eat!`,
      citations,
      followUps: ['How to compare two packaged foods?', 'What is NOVA food classification?'],
    };
  }

  // Question 7: Vegetarian / Non-Vegetarian & FSSAI Symbols
  if (q.includes('veg') || q.includes('symbol') || q.includes('green dot') || q.includes('brown dot')) {
    citations.push({
      source: 'FSSAI Labelling Regulations (2022)',
      guideline: 'Mandatory Food Declarations: Vegetarian & Non-Vegetarian Logos',
    });
    return {
      text: `**FSSAI Food Classification Marks**\n\n• **Green Circle inside Green Square:** Vegetarian food containing strictly plant and dairy products.\n• **Brown Circle inside Brown Triangle/Square:** Non-vegetarian food containing animal flesh, poultry, seafood, egg products, or animal-origin derivatives (like gelatin or carmine INS 120).\n• **Blue Symbol:** Fortified food (+F logo) enriched with essential micronutrients like Iron, Vitamin A, Vitamin D, or Folic Acid according to FSSAI standards.`,
      citations,
      followUps: ['What are hidden non-vegetarian ingredients?', 'Is whey protein vegetarian?'],
    };
  }


    // Greetings and small talk
  const isGreeting =
    /^\s*(hi+|hello+|hey+|hola|namaste|good (morning|afternoon|evening)|how are (you|u)|what'?s up|sup|thanks|thank you|ok|okay)\b[\s!?.]*$/i.test(q);

  if (isGreeting) {
    return {
      text: `Hello! I'm the NutriAgent assistant. I can help you read packaged-food labels, understand additives like INS codes, and check daily sugar, salt and fat limits.\n\nWhat would you like to know?`,
      citations: [],
      followUps: [
        'What does INS 621 (MSG) mean on an ingredient list?',
        'What are the ICMR-NIN 2024 daily limits for sugar and salt?',
        'How to spot hidden sugars on labels',
      ],
    };
  }

  // Anything else: don't guess, don't give false information
  return {
    text: `Sorry, I couldn't find anything about that in my food and nutrition knowledge, so I won't guess.\n\nI can only help with packaged-food labels, ingredients, additives (INS codes), and daily sugar, sodium and fat limits. You can also scan a product and ask "Can I eat this?"`,
    citations: [],
    followUps: [
      'What are the ICMR-NIN 2024 daily limits for sugar and salt?',
      'How to spot hidden sugars on labels',
      'Explain the difference between per 100g and per serving',
    ],
  };
}


