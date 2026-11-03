import { NextRequest, NextResponse } from 'next/server';
import { AssessmentEngine } from '@/lib/assessment/rulesEngine';
import { AIExplainer } from '@/lib/ai/aiExplainer';
import { ExtractedProduct, UserProfile } from '@/types/nutrition';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, profile } = body as {
      product: ExtractedProduct;
      profile: UserProfile;
    };

    if (!product || !profile) {
      return NextResponse.json(
        { error: 'Missing product or profile in request body' },
        { status: 400 }
      );
    }

    // 1. Deterministic assessment execution
    const assessment = AssessmentEngine.assess(product, profile);

    // 2. Plain language AI/smart explanation
    const aiExplanation = await AIExplainer.generateExplanation(product, assessment, profile);

    assessment.aiGeneratedInsight = aiExplanation.conversationalVerdict;

    return NextResponse.json({
      assessment,
      aiExplanation,
    });
  } catch (error) {
    console.error('Assessment API error:', error);
    return NextResponse.json(
      { error: 'Internal assessment execution error' },
      { status: 500 }
    );
  }
}

