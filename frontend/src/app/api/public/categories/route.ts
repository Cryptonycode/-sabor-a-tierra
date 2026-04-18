import { NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET() {
  try {
    const categories = await ProductService.getPublicCategories();
    return NextResponse.json(categories);
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
