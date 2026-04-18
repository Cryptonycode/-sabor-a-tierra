import { NextResponse } from 'next/server';
import { NewsletterService } from '@/services/newsletterService';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload?.email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const result = await NewsletterService.subscribe(payload);
    return NextResponse.json(result, { status: result.alreadyRegistered ? 200 : 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
