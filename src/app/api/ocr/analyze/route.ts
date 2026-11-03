import { NextRequest, NextResponse } from 'next/server';
import { parseNutritionFromText } from '@/lib/ocr/ocrAdapter';
import { SAMPLE_PRODUCTS } from '@/lib/sampleProducts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, rawText, sampleId } = body;

    // 1. If sampleId provided, load instant sample product
    if (sampleId) {
      const sample = SAMPLE_PRODUCTS.find(p => p.id === sampleId);
      if (sample) {
        return NextResponse.json({
          product: sample,
          provider: 'sample_matcher',
          isSimulated: true,
          warnings: ['Loaded verified sample food product for demonstration.'],
        });
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. If Gemini Vision API Key is present and image is supplied
    if (apiKey && imageBase64) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const prompt = `
You are an expert OCR & Food Label digitization assistant.
Analyze this food label photo and extract all visible Nutrition Facts and Ingredient statements.
Return ONLY a valid JSON object matching this schema:
{
  "name": "string",
  "brand": "string",
  "ingredientsText": "string",
  "allergenWarningText": "string",
  "nutrition": {
    "servingSize": "string",
    "servingSizeGrams": 0,
    "calories": 0,
    "totalFatG": 0,
    "saturatedFatG": 0,
    "transFatG": 0,
    "cholesterolMg": 0,
    "sodiumMg": 0,
    "totalCarbohydratesG": 0,
    "dietaryFiberG": 0,
    "totalSugarsG": 0,
    "addedSugarsG": 0,
    "proteinG": 0,
    "potassiumMg": 0,
    "calciumMg": 0,
    "ironMg": 0
  },
  "confidenceScore": 95,
  "uncertainFields": []
}
If any nutrition item is NOT printed or unreadable, omit it or set to null. NEVER make up numbers.
`;

        const response = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (response.ok) {
          const resData = await response.json();
          const jsonText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            const product = {
              id: `prod-${Date.now()}`,
              name: parsed.name || 'Scanned Product',
              brand: parsed.brand,
              ingredientsText: parsed.ingredientsText || '',
              parsedIngredients: (parsed.ingredientsText || '').split(/[,;]/).map((i: string) => i.trim()).filter(Boolean),
              allergenWarningText: parsed.allergenWarningText,
              nutrition: {
                servingSize: parsed.nutrition?.servingSize || '1 serving',
                servingSizeGrams: parsed.nutrition?.servingSizeGrams,
                servingBasis: 'per_serving' as const,
                calories: parsed.nutrition?.calories,
                totalFatG: parsed.nutrition?.totalFatG,
                saturatedFatG: parsed.nutrition?.saturatedFatG,
                transFatG: parsed.nutrition?.transFatG,
                cholesterolMg: parsed.nutrition?.cholesterolMg,
                sodiumMg: parsed.nutrition?.sodiumMg,
                totalCarbohydratesG: parsed.nutrition?.totalCarbohydratesG,
                dietaryFiberG: parsed.nutrition?.dietaryFiberG,
                totalSugarsG: parsed.nutrition?.totalSugarsG,
                addedSugarsG: parsed.nutrition?.addedSugarsG,
                proteinG: parsed.nutrition?.proteinG,
                potassiumMg: parsed.nutrition?.potassiumMg,
              },
              ocrConfidence: parsed.confidenceScore || 90,
              uncertainFields: parsed.uncertainFields || [],
              scannedAt: new Date().toISOString(),
              isSampleData: false,
            };

            return NextResponse.json({
              product,
              provider: 'gemini_vision',
              isSimulated: false,
              warnings: [],
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini vision API error, continuing to heuristic fallback:', geminiError);
      }
    }

    // 3. Fallback Heuristic Parser using provided rawText or demo text
    if (rawText && typeof rawText === 'string') {
      const parsed = parseNutritionFromText(rawText);
      return NextResponse.json({
        product: parsed,
        provider: 'heuristic_parser',
        isSimulated: false,
        warnings: ['Parsed using pattern heuristics. Please confirm numbers on review screen.'],
      });
    }

    // 4. If image upload was provided but no Gemini key was configured:
    // Fallback to a cleanly labeled realistic extraction with guidance
    const fallbackProduct = SAMPLE_PRODUCTS[0];
    return NextResponse.json({
      product: {
        ...fallbackProduct,
        id: `prod-${Date.now()}`,
        name: 'Uploaded Label (Sample Extracted)',
        ocrConfidence: 82,
        isSampleData: true,
      },
      provider: 'heuristic_parser',
      isSimulated: true,
      warnings: [
        'No external OCR API key configured. Extracted sample data for demonstration. You can edit all fields manually before assessment.',
      ],
    });
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process label image or text' },
      { status: 500 }
    );
  }
}

