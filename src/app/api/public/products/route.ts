import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // 1. Obtenemos las variables de entorno de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Faltan las variables de entorno de Supabase (.env.local)");
    }

    // 2. Inicializamos el cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Leemos los parámetros de la URL (por si en el futuro filtramos desde el servidor)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // 4. Hacemos la consulta directa a la tabla 'products'
    let query = supabase.from('products').select('*');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error("Error consultando a Supabase:", error.message);
      throw new Error(error.message);
    }

    // 5. Devolvemos los productos limpios al frontend
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