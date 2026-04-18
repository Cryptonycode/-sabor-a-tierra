import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const getCustomerToken = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookieStore = cookies();
  return (
    cookieStore.get('customer_token')?.value ||
    cookieStore.get('sb-access-token')?.value ||
    cookieStore.get('sb:token')?.value ||
    null
  );
};

const getAuthenticatedCustomer = async (request: Request) => {
  const token = getCustomerToken(request);
  if (!token) return null;

  const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !userData.user?.email) {
    return null;
  }

  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (customer && !customerError) {
    return customer;
  }

  const { data: customerByEmail, error: customerByEmailError } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('email', userData.user.email)
    .maybeSingle();

  if (customerByEmailError || !customerByEmail) {
    return null;
  }

  return customerByEmail;
};

export async function GET(request: Request) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const customer = await getAuthenticatedCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const payload = await request.json();
    const allowed: Record<string, unknown> = {};
    const fields = [
      'first_name',
      'last_name',
      'phone',
      'marketing_emails',
      'newsletter_subscribed',
      'default_shipping_address',
      'default_shipping_city',
      'default_shipping_postal_code',
      'default_shipping_province'
    ];

    for (const field of fields) {
      if (payload[field] !== undefined) {
        allowed[field] = payload[field];
      }
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ ...allowed, updated_at: new Date().toISOString() })
      .eq('id', customer.id)
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
