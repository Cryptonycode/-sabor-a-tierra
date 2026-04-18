import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { ProductInput, ProductService } from '@/services/productService';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 401 });

interface Params {
  params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as ProductInput;
    const product = await ProductService.updateProduct(params.id, body);
    return NextResponse.json(product);
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

export async function DELETE(_request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    await ProductService.deleteProduct(params.id);
    return new NextResponse(null, { status: 204 });
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
