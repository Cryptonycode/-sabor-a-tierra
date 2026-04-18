import { NextResponse } from 'next/server';
import { getAuthenticatedCustomerFromRequest } from '@/lib/server/customerAuth';
import { getOrderById } from '@/lib/server/orderDomain';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const customer = await getAuthenticatedCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Pedido no encontrado' }, { status: 404 });
    }

    const canAccess = order.customer_id === customer.id || order.customer_email === customer.email;
    if (!canAccess) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
