/**
 * Script para crear el código de descuento BIENVENIDA10
 * Este código es reutilizable (no es de un solo uso) y está disponible para todos los nuevos clientes
 */

import { supabaseAdmin } from '../config/supabase';

export async function seedWelcomeDiscount() {
  try {
    console.log('🔍 Verificando código BIENVENIDA10...');

    // Verificar si ya existe
    const { data: existing } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', 'BIENVENIDA10')
      .maybeSingle();

    if (existing) {
      console.log('✅ El código BIENVENIDA10 ya existe:', existing);
      
      // Asegurar que esté activo
      if (!existing.is_active) {
        await supabaseAdmin
          .from('discount_codes')
          .update({ is_active: true })
          .eq('code', 'BIENVENIDA10');
        console.log('✅ Código BIENVENIDA10 reactivado');
      }
      
      return existing;
    }

    // Crear el código si no existe
    console.log('📝 Creando código BIENVENIDA10...');
    
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .insert([
        {
          code: 'BIENVENIDA10',
          discount_percentage: 10,
          is_active: true,
          customer_email: null, // Código global, no asociado a un cliente específico
          expires_at: null,     // Sin fecha de expiración
          times_used: 0,
          last_order_id: null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear código BIENVENIDA10:', error);
      throw error;
    }

    console.log('✅ Código BIENVENIDA10 creado exitosamente:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en seedWelcomeDiscount:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedWelcomeDiscount()
    .then(() => {
      console.log('✅ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

