import { NextResponse } from 'next/server';
import { createOrderFromCheckout } from '@/lib/server/orderDomain';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const order = await createOrderFromCheckout(payload);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear pedido',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 400 }
    );
  }
}
