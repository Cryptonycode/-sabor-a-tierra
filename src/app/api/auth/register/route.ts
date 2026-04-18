import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { createWelcomeDiscountIfMissing } from '@/lib/server/discounts';

const generateTempPassword = () => `Tmp-${crypto.randomUUID()}-Aa1!`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const firstName = String(body?.first_name || '').trim();
    const lastName = String(body?.last_name || '').trim();
    const phone = body?.phone ? String(body.phone).trim() : null;
    const marketingEmails = body?.marketing_emails ?? true;
    const password = body?.password ? String(body.password) : generateTempPassword();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email requerido' }, { status: 400 });
    }

    let userId: string | null = null;
    const supabaseAuth = createSupabaseAuthClient();
    const { data: signUpData, error: signUpError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (!signUpError && signUpData.user?.id) {
      userId = signUpData.user.id;
    } else {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        return NextResponse.json(
          { success: false, message: signUpError?.message || 'No se pudo registrar el usuario' },
          { status: 400 }
        );
      }

      const existing = usersData.users.find((user) => user.email?.toLowerCase() === email);
      if (!existing) {
        return NextResponse.json(
          { success: false, message: signUpError?.message || 'No se pudo registrar el usuario' },
          { status: 400 }
        );
      }

      userId = existing.id;
    }

    const customerPayload = {
      id: userId,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      marketing_emails: Boolean(marketingEmails),
      newsletter_subscribed: Boolean(marketingEmails),
      email_verified: false,
      updated_at: new Date().toISOString()
    };

    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .upsert(customerPayload, { onConflict: 'id' })
      .select('*')
      .single();

    if (customerError) {
      return NextResponse.json({ success: false, message: customerError.message }, { status: 500 });
    }

    const discountCode = await createWelcomeDiscountIfMissing(email);

    return NextResponse.json({
      success: true,
      customer,
      discountCode,
      message: 'Registro completado. Cupón de bienvenida generado.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
