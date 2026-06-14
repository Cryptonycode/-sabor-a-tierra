import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { ProductInput, ProductService } from '@/services/productService';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 401 });

const mapProductStatus = (product: Record<string, unknown>) => ({
  ...product,
  status: product.is_available ? 'Publicado' : 'Archivado'
});

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const products = await ProductService.getAllAdminProducts();
    const mappedProducts = products.map((product) => mapProductStatus(product));
    return NextResponse.json(mappedProducts);
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

export async function POST(request: Request) {
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
    const product = await ProductService.createProduct(payloadToInsert);
    return NextResponse.json(mapProductStatus(product), { status: 201 });
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
