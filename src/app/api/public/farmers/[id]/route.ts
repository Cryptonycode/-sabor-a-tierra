import { NextResponse } from 'next/server';
import { FarmerService } from '@/services/farmerService';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const farmer = await FarmerService.getPublicFarmerById(params.id);
    if (!farmer) {
      return NextResponse.json({ error: 'Agricultor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(farmer);
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
