import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export interface DiscountValidationResult {
  isValid: boolean;
  percentage: number | null;
  amount: number | null;
  minOrderAmount: number | null;
  code?: string;
  error?: string;
}

const randomCode = (length = 6) =>
  Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);

export const generateWelcomeCode = async (): Promise<string> => {
  for (let i = 0; i < 10; i += 1) {
    const code = `BIENVENIDA10-${randomCode(6)}`;
    const { data } = await supabaseAdmin.from('discount_codes').select('id').eq('code', code).maybeSingle();
    if (!data) {
      return code;
    }
  }

  return `BIENVENIDA10-${Date.now().toString().slice(-6)}`;
};

export const createWelcomeDiscountIfMissing = async (email: string): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existing } = await supabaseAdmin
    .from('discount_codes')
    .select('code')
    .eq('customer_email', normalizedEmail)
    .eq('is_active', true)
    .lt('times_used', 1)
    .ilike('code', 'BIENVENIDA10%')
    .maybeSingle();

  if (existing?.code) {
    return existing.code;
  }

  const code = await generateWelcomeCode();
  const { error } = await supabaseAdmin.from('discount_codes').insert([
    {
      code,
      customer_email: normalizedEmail,
      discount_percentage: 10,
      max_uses: 1,
      times_used: 0,
      is_active: true
    }
  ]);

  if (error) {
    throw new Error(`Error al crear cupón de bienvenida: ${error.message}`);
  }

  return code;
};

export const listDiscounts = async () => {
  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error al obtener descuentos: ${error.message}`);
  }

  return data || [];
};

export const getDiscountById = async (id: string) => {
  const { data, error } = await supabaseAdmin.from('discount_codes').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Error al obtener descuento: ${error.message}`);
  }
  return data;
};

export const createDiscount = async (payload: Record<string, unknown>) => {
  const { data, error } = await supabaseAdmin.from('discount_codes').insert([payload]).select('*').single();
  if (error) {
    throw new Error(`Error al crear descuento: ${error.message}`);
  }
  return data;
};

export const updateDiscount = async (id: string, payload: Record<string, unknown>) => {
  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error al actualizar descuento: ${error.message}`);
  }
  return data;
};

export const deleteDiscount = async (id: string) => {
  const { error } = await supabaseAdmin.from('discount_codes').delete().eq('id', id);
  if (error) {
    throw new Error(`Error al eliminar descuento: ${error.message}`);
  }
};

export const validateDiscountCode = async (args: {
  code: string;
  customerEmail?: string;
  subtotal?: number;
}): Promise<DiscountValidationResult> => {
  const code = args.code.trim();
  const { data, error } = await supabaseAdmin
    .from('discount_codes')
    .select('*')
    .eq('code', code)
    .maybeSingle();

  if (error) {
    return { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Error de validación' };
  }
  if (!data) {
    return { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Código no encontrado' };
  }
  if (!data.is_active) {
    return { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Código inactivo' };
  }
  if (typeof data.max_uses === 'number' && typeof data.times_used === 'number' && data.times_used >= data.max_uses) {
    return { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Código ya utilizado' };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { isValid: false, percentage: null, amount: null, minOrderAmount: null, error: 'Código expirado' };
  }
  if (args.customerEmail && data.customer_email && data.customer_email !== args.customerEmail) {
    return {
      isValid: false,
      percentage: null,
      amount: null,
      minOrderAmount: null,
      error: 'Este cupón está asociado a otro email'
    };
  }
  if (typeof args.subtotal === 'number' && data.min_order_amount && args.subtotal < data.min_order_amount) {
    return {
      isValid: false,
      percentage: null,
      amount: null,
      minOrderAmount: data.min_order_amount,
      error: `Pedido mínimo requerido: €${Number(data.min_order_amount).toFixed(2)}`
    };
  }

  return {
    isValid: true,
    code: data.code,
    percentage: data.discount_percentage ?? null,
    amount: data.discount_amount ?? null,
    minOrderAmount: data.min_order_amount ?? null
  };
};

export const markDiscountCodeAsUsed = async (code: string, orderId: string) => {
  const { data } = await supabaseAdmin
    .from('discount_codes')
    .select('times_used')
    .eq('code', code)
    .maybeSingle();

  const nextTimesUsed = typeof data?.times_used === 'number' ? data.times_used + 1 : 1;
  const { error } = await supabaseAdmin
    .from('discount_codes')
    .update({ times_used: nextTimesUsed, last_order_id: orderId })
    .eq('code', code);

  if (error) {
    throw new Error(`Error al marcar cupón como usado: ${error.message}`);
  }
};
