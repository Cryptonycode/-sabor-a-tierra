import { supabaseAdmin } from '../config/supabase';

export class DiscountService {
  // Genera un código aleatorio legible y asegura unicidad
  static async generateUniqueCode(): Promise<string> {
    const prefixPool = ['BIENVENIDO10', 'WELCOME10', 'HOLA10'];
    const rand = (len: number) => Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, len);

    for (let i = 0; i < 10; i++) {
      const prefix = prefixPool[i % prefixPool.length];
      const code = `${prefix}-${rand(6)}`;
      const { data } = await supabaseAdmin
        .from('discount_codes')
        .select('code')
        .eq('code', code)
        .maybeSingle();
      if (!data) return code;
    }
    // Fallback si hubo muchas colisiones
    return `WELCOME-${Date.now().toString().slice(-6)}`;
  }

  // Crea un código de descuento único de un solo uso
  static async createDiscountCode(email: string, percentage: number): Promise<string> {
    const code = await this.generateUniqueCode();

    const insertData = {
      code,
      customer_email: email,
      discount_percentage: percentage,
      max_uses: 1,
      times_used: 0,
      is_active: true,
    } as any;

    const { error } = await supabaseAdmin
      .from('discount_codes')
      .insert([insertData]);

    if (error) {
      throw new Error(`Error al crear código de descuento: ${error.message}`);
    }

    return code;
  }

  // Valida un código de descuento
  static async validateDiscountCode(code: string): Promise<{ isValid: boolean; percentage: number | null; error?: string }> {
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .select('code, discount_percentage, is_active, max_uses, times_used, expires_at')
      .eq('code', code)
      .maybeSingle();

    if (error) {
      return { isValid: false, percentage: null, error: 'Error de validación' };
    }
    if (!data) {
      return { isValid: false, percentage: null, error: 'Código no encontrado' };
    }
    if (!data.is_active) {
      return { isValid: false, percentage: null, error: 'Código inactivo' };
    }
    if (typeof data.max_uses === 'number' && typeof data.times_used === 'number' && data.times_used >= data.max_uses) {
      return { isValid: false, percentage: null, error: 'Código ya utilizado' };
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { isValid: false, percentage: null, error: 'Código expirado' };
    }

    return { isValid: true, percentage: data.discount_percentage };
  }

  // Marca un código como usado para un pedido
  static async markCodeAsUsed(code: string, orderId: string): Promise<void> {
    // Leer el contador actual
    const { data, error } = await supabaseAdmin
      .from('discount_codes')
      .select('times_used')
      .eq('code', code)
      .single();

    let newTimesUsed = 1;
    if (!error && data && typeof (data as any).times_used === 'number') {
      newTimesUsed = (data as any).times_used + 1;
    }

    const { error: updateError } = await supabaseAdmin
      .from('discount_codes')
      .update({ times_used: newTimesUsed, last_order_id: orderId })
      .eq('code', code);

    if (updateError) {
      throw new Error(`Error al marcar código como usado: ${updateError.message}`);
    }
  }
}

export default DiscountService;


