import { NextResponse } from 'next/server';
import { createSupabaseAuthClient } from '@/lib/server/supabaseAuthClient';

const DEFAULT_REDIRECT_PATH = '/checkout';
const DEFAULT_SITE_URL = 'https://saboratierra.es';
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

// El enlace debe apuntar a un origen incluido en la Allow List de Supabase. Detrás
// del proxy de producción la URL de la petición puede ser un host interno, y en ese
// caso Supabase descarta el destino y devuelve al usuario a la Home. Por eso manda
// el dominio público y solo se respeta el origen de la petición en desarrollo local.
const resolveSiteOrigin = (request: Request) => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    try {
      return new URL(configuredSiteUrl).origin;
    } catch {
      // Valor mal formado: se ignora y se sigue con la detección normal.
    }
  }

  try {
    const requestOrigin = request.headers.get('origin') || new URL(request.url).origin;
    const { hostname } = new URL(requestOrigin);

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return requestOrigin;
    }
  } catch {
    // Origen ilegible: se usa el dominio de producción.
  }

  return DEFAULT_SITE_URL;
};

// Solo se acepta un destino del mismo origen que el sitio, para que este endpoint
// no pueda usarse para enviar enlaces de acceso hacia otro dominio.
const resolveEmailRedirectTo = (request: Request, requestedRedirect: unknown) => {
  const siteOrigin = resolveSiteOrigin(request);

  if (typeof requestedRedirect === 'string' && requestedRedirect.trim()) {
    try {
      const candidate = new URL(requestedRedirect, siteOrigin);
      if (candidate.origin === siteOrigin) {
        return candidate.toString();
      }
    } catch {
      // Destino ilegible: se usa el de por defecto.
    }
  }

  return new URL(DEFAULT_REDIRECT_PATH, siteOrigin).toString();
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
