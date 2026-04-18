import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { FarmerApplicationService } from '@/services/farmerApplicationService';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const application = await FarmerApplicationService.getApplicationById(params.id);
    if (!application) {
      return NextResponse.json({ error: 'Aplicación no encontrada' }, { status: 404 });
    }
    return NextResponse.json(application);
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    if (payload?.action === 'approve') {
      const result = await FarmerApplicationService.approveApplication(params.id, admin.id);
      return NextResponse.json(result);
    }

    if (payload?.action === 'reject') {
      const result = await FarmerApplicationService.rejectApplication(params.id, admin.id, payload?.admin_notes);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Acción inválida' }, { status: 400 });
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

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    await FarmerApplicationService.deleteApplication(params.id);
    return new NextResponse(null, { status: 204 });
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
