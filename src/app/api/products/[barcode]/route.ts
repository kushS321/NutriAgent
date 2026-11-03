import { NextRequest, NextResponse } from 'next/server';
import { OpenFoodFactsService } from '@/lib/api/openFoodFacts';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  try {
    const barcode = params.barcode;
    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode parameter is required.' },
        { status: 400 }
      );
    }

    const product = await OpenFoodFactsService.getProductByBarcode(barcode);

    if (!product) {
      return NextResponse.json(
        {
          error: 'Product not found in Open Food Facts or local database.',
          barcode,
          suggestions: [
            'Try scanning another angle or cleaner barcode',
            'Search product by name',
            'Upload a photo of the food label for OCR extraction',
            'Enter the values manually',
          ],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
      provenance: product.provenance || 'open_food_facts',
    });
  } catch (error) {
    console.error('API /api/products/[barcode] error:', error);
    return NextResponse.json(
      { error: 'Internal server error resolving barcode.' },
      { status: 500 }
    );
  }
}

