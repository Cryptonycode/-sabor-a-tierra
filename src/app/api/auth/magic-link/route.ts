import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';

const DEFAULT_REDIRECT_PATH = '/checkout';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Supabase responde en inglés y la UI es en español.
const translateAuthError = (message: string) => {
  const normalized = message.toLowerCase();

  if (normalized.includes('error sending')) {
    return 'No hemos podido enviar el email. Revisa la configuración de correo de Supabase.';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many')) {
    return 'Se han enviado demasiados enlaces. Espera unos minutos e inténtalo de nuevo.';
  }

  if (normalized.includes('invalid email')) {
    return 'El email no es válido.';
  }

  return message;
};

// Solo se acepta un destino del mismo origen que la petición, para que este
// endpoint no pueda usarse para enviar enlaces de acceso hacia otro dominio.
const resolveEmailRedirectTo = (request: Request, requestedRedirect: unknown) => {
  const origin = request.headers.get('origin') || new URL(request.url).origin;

  if (typeof requestedRedirect === 'string' && requestedRedirect.trim()) {
    try {
      const candidate = new URL(requestedRedirect, origin);
      if (candidate.origin === origin) {
        return candidate.toString();
      }
    } catch {
      // Destino ilegible: se usa el de por defecto.
    }
  }

  return new URL(DEFAULT_REDIRECT_PATH, origin).toString();
};

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

    const emailRedirectTo = resolveEmailRedirectTo(request, body?.redirectTo);

    const supabaseAuth = createSupabaseAuthClient();
    const { error } = await supabaseAuth.auth.signInWithOtp({
      email,
      options: { emailRedirectTo }
    });

    if (error) {
      console.error('❌ Error enviando enlace de acceso:', error.message);

      // Se propaga el estado de Supabase (por ejemplo 429 por límite de envíos)
      // para que la UI pueda mostrar un mensaje útil.
      const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 502;
      return NextResponse.json(
        { success: false, message: translateAuthError(error.message) },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enlace de acceso enviado'
    });
  } catch (error) {
    console.error('❌ Error en /api/auth/magic-link:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
