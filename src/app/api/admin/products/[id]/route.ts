import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { ProductDeleteConflictError, ProductInput, ProductService } from '@/services/productService';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 401 });

const mapProductStatus = (product: Record<string, unknown>) => ({
  ...product,
  status: product.is_available ? 'Publicado' : 'Archivado'
});

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const product = await ProductService.getAdminProductById(params.id);
    return NextResponse.json(mapProductStatus(product));
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

export async function PUT(request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as ProductInput & { status?: string };
    const { status, ...restData } = body;
    const payloadToInsert = {
      ...restData,
      is_available: status === 'Publicado'
    };
    const product = await ProductService.updateProduct(params.id, payloadToInsert);
    return NextResponse.json(mapProductStatus(product));
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
    if (error instanceof ProductDeleteConflictError) {
      return NextResponse.json(
        {
          error: 'Conflicto al eliminar producto',
          message: error.message
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
