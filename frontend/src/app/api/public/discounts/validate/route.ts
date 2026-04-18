import { NextResponse } from 'next/server';
import { validateDiscountCode } from '@/lib/server/discounts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = String(body?.code || '').trim();

    if (!code) {
      return NextResponse.json(
        { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Código requerido' },
        { status: 400 }
      );
    }

    const result = await validateDiscountCode({
      code,
      customerEmail: body?.customerEmail,
      subtotal: typeof body?.subtotal === 'number' ? body.subtotal : undefined
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        isValid: false,
        percentage: null,
        amount: null,
        minOrderAmount: null,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}
