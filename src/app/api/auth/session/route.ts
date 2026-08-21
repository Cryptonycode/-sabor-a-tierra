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

// A diferencia de /api/customers/me, esta ruta responde con éxito aunque el
// cliente no tenga todavía una fila en `customers`: el email verificado de la
// sesión basta para identificarlo en el checkout.
export async function GET(request: Request) {
  try {
    const token = getCustomerToken(request);
    if (!token) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { data: userData, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !userData.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Sesión inválida o expirada' },
        { status: 401 }
      );
    }

    const { email, id } = { email: userData.user.email, id: userData.user.id };

    const { data: customerById } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    let customer = customerById ?? null;

    if (!customer) {
      const { data: customerByEmail } = await supabaseAdmin
        .from('customers')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      customer = customerByEmail ?? null;
    }

    return NextResponse.json({ success: true, email, customer });
  } catch (error) {
    console.error('❌ Error en /api/auth/session:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
