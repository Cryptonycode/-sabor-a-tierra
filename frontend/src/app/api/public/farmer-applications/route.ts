import { NextResponse } from 'next/server';
import { FarmerApplicationService } from '@/services/farmerApplicationService';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload?.email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    const alreadyExists = await FarmerApplicationService.checkExistingApplication(payload.email);
    if (alreadyExists) {
      return NextResponse.json({ error: 'Ya existe una aplicación activa para este email' }, { status: 400 });
    }

    const application = await FarmerApplicationService.createApplication(payload);
    return NextResponse.json(application, { status: 201 });
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
