import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeOrders = searchParams.get('include_orders') === 'true';

    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !customer) {
      return NextResponse.json({ success: false, message: 'Cliente no encontrado' }, { status: 404 });
    }

    if (!includeOrders) {
      return NextResponse.json({ success: true, customer });
    }

    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', params.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json({ success: false, message: ordersError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer, orders: orders || [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const allowed: Record<string, unknown> = {};
    const fields = [
      'first_name',
      'last_name',
      'phone',
      'is_active',
      'marketing_emails',
      'newsletter_subscribed',
      'default_shipping_address',
      'default_shipping_city',
      'default_shipping_postal_code',
      'default_shipping_province',
      'email_verified'
    ];

    for (const field of fields) {
      if (payload[field] !== undefined) {
        allowed[field] = payload[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
  }

  try {
    const { error } = await supabaseAdmin.from('customers').delete().eq('id', params.id);
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
