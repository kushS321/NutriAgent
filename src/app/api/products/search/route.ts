import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsService } from '@/lib/api/openFoodFacts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        products: [],
        count: 0,
      });
    }

    const products = await OpenFoodFactsService.searchProducts(query, limit);

    return NextResponse.json({
      success: true,
      query,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('API /api/products/search error:', error);
    return NextResponse.json(
      { error: 'Internal server error during product search.' },
      { status: 500 }
    );
  }
}

