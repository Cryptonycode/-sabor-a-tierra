import { NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const featured = searchParams.get('featured') === 'true';

    const products = await ProductService.getPublicProducts({
      category,
      search,
      featured
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
