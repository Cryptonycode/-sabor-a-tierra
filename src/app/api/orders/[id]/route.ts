import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/server/orderDomain';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Pedido no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener pedido',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
