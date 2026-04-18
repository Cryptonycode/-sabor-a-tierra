import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { FarmerService } from '@/services/farmerService';

export async function GET(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const farmers = await FarmerService.getAdminFarmers(status);
    return NextResponse.json(farmers);
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

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const farmer = await FarmerService.createFarmer(payload);
    return NextResponse.json(farmer, { status: 201 });
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
