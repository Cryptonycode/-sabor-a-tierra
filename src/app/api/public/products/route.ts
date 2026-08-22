import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET(request: Request) {
  try {
    // 1. Leemos los parámetros de la URL (por si en el futuro filtramos desde el servidor)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 2. Las variantes son obligatorias para el listado: la tarjeta añade al
    //    carrito la variante más barata, nunca el producto base.
    //    Se usa la clave de servicio porque las políticas RLS de
    //    product_variants no permiten leer con la clave anónima, y el join
    //    devolvería arrays vacíos sin dar ningún error.
    let query = supabaseAdmin
      .from('products')
      .select('*, variants:product_variants(*)')
      .eq('is_available', true);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error consultando a Supabase:", error.message);
      throw new Error(error.message);
    }

    // 3. Devolvemos los productos limpios al frontend
    return NextResponse.json(products || []);
    
  } catch (error) {
    console.error("Error en la ruta /api/public/products:", error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}