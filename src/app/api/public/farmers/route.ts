import { NextResponse } from 'next/server';
import { FarmerService } from '@/services/farmerService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase();
    const specialty = searchParams.get('specialty')?.trim().toLowerCase();

    let farmers = await FarmerService.getPublicFarmers();

    if (specialty) {
      farmers = farmers.filter((farmer) =>
        Array.isArray(farmer.specialties) &&
        farmer.specialties.some((item: string) => item.toLowerCase().includes(specialty))
      );
    }

    if (search) {
      farmers = farmers.filter((farmer) =>
        `${farmer.first_name} ${farmer.last_name} ${farmer.business_name || ''} ${farmer.city || ''}`.toLowerCase().includes(search)
      );
    }

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
