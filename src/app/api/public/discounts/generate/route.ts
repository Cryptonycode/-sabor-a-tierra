import { NextResponse } from 'next/server';
import {
  createWelcomeDiscountForEmail,
  deleteDiscount,
  findDiscountByCustomerEmail
} from '@/lib/server/discounts';
import { sendWelcomeDiscountEmail } from '@/lib/server/email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = String(body?.email || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Introduce un email válido' },
        { status: 400 }
      );
    }

    const existing = await findDiscountByCustomerEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Este correo ya tiene un código' },
        { status: 400 }
      );
    }

    const discount = await createWelcomeDiscountForEmail(email);

    try {
      await sendWelcomeDiscountEmail(email, discount.code);
    } catch (emailError) {
      // Si el email no sale, se descarta el código: dejarlo guardado haría que
      // el siguiente intento chocara con "este correo ya tiene un código" y el
      // cliente se quedaría sin cupón y sin forma de pedirlo otra vez.
      console.error('❌ Error enviando el cupón de bienvenida:', emailError);
      await deleteDiscount(discount.id).catch(rollbackError =>
        console.error('❌ No se pudo revertir el cupón huérfano:', rollbackError)
      );

      return NextResponse.json(
        { success: false, message: 'No hemos podido enviarte el email. Inténtalo de nuevo.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      code: discount.code,
      message: 'Código enviado. Revisa tu correo.'
    });
  } catch (error) {
    console.error('❌ Error en /api/public/discounts/generate:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
