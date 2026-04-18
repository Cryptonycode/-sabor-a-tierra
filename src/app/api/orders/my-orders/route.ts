import { NextResponse } from 'next/server';
import { getAuthenticatedCustomerFromRequest } from '@/lib/server/customerAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { getOrderById } from '@/lib/server/orderDomain';

export async function GET(request: Request) {
  try {
    const customer = await getAuthenticatedCustomerFromRequest(request);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id')
      .or(`customer_id.eq.${customer.id},customer_email.eq.${customer.email}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const orders = await Promise.all((data || []).map((entry) => getOrderById(entry.id)));

    return NextResponse.json({
      success: true,
      orders: orders.filter(Boolean)
    });
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
