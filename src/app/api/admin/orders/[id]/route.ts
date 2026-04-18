import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { getOrderById, updateAdminOrder } from '@/lib/server/orderDomain';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

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
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const updated = await updateAdminOrder(id, {
      status: body.status,
      payment_status: body.payment_status,
      tracking_number: body.tracking_number,
      notes: body.notes,
      updated_by: admin.email
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 400 }
    );
  }
}
