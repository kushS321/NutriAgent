import { NextRequest, NextResponse } from 'next/server';
import { ComparisonEngine } from '@/lib/assessment/comparisonEngine';
import { ExtractedProduct } from '@/types/nutrition';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productA, productB, servingBasis } = body as {
      productA: ExtractedProduct;
      productB: ExtractedProduct;
      servingBasis?: 'per_serving' | 'per_100g';
    };

    if (!productA || !productB) {
      return NextResponse.json(
        { error: 'Both productA and productB are required for comparison.' },
        { status: 400 }
      );
    }

    const comparison = ComparisonEngine.compare(productA, productB, servingBasis || 'per_serving');
    return NextResponse.json({ comparison });
  } catch (error) {
    console.error('Comparison API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate product comparison.' },
      { status: 500 }
    );
  }
}

