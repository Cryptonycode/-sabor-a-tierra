import { NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET(request: Request, context: any) {
  try {
    // Compatibilidad segura para leer el ID en todas las versiones de Next.js
    const params = await context.params;
    const id = params.id;

    console.log("---- BUSCANDO PRODUCTO CON ID:", id, "----");

    const product = await ProductService.getPublicProductById(id);

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    // 🔥 ESTA LÍNEA ES LA CLAVE: Imprimirá el motivo exacto en tu terminal
    console.error("🔥 ERROR EN API DE PRODUCTO:", error);
    
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}