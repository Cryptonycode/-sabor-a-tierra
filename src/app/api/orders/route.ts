import { NextResponse } from 'next/server';
import { createOrderFromCheckout } from '@/lib/server/orderDomain';

export async function POST(request: Request) {
  try {
    console.log("📥 [API ORDERS] Recibiendo petición...");
    
    const body = await request.json();
    console.log("📦 [API ORDERS] Datos recibidos:", JSON.stringify(body).substring(0, 200) + '...');

    const order = await createOrderFromCheckout(body);

    console.log("✅ [API ORDERS] Éxito. Order ID:", order?.id);
    return NextResponse.json({ success: true, order });
    
  } catch (error: any) {
    // ESTA ES LA CLAVE. Imprimirá el error en letras gigantes en tu terminal.
    console.error("🚨 [API ORDERS] ERROR FATAL:", error.message || error);
    
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pedido' },
      { status: 400 }
    );
  }
}