import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { VariantInput, VariantService } from '@/services/variantService';

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'No autorizado' }, { status: 401 });

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const variants = await VariantService.getVariantsByProductId(params.id);
    return NextResponse.json(variants);
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

export async function POST(request: Request, { params }: Params) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return unauthorizedResponse();
  }

  try {
    const body = (await request.json()) as VariantInput;
    const variant = await VariantService.createVariant({ ...body, product_id: params.id });
    return NextResponse.json(variant, { status: 201 });
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
