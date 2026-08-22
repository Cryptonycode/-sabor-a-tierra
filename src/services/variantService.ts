import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export interface VariantInput {
  product_id?: string;
  name: string;
  price: number;
  weight?: number | string | null;
}

const toNumber = (val: unknown): number => {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

export class VariantService {
  static async getVariantsByProductId(productId: string) {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('price', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener variantes: ${error.message}`);
    }

    return data || [];
  }

  static async createVariant(variantData: VariantInput) {
    const { product_id, name, price, weight } = variantData;
    const insertData = {
      product_id,
      name,
      price,
      weight: toNumber(weight),
    };

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear variante: ${error.message}`);
    }

    return data;
  }

  static async updateVariant(id: string, variantData: VariantInput) {
    const { name, price, weight } = variantData;
    const updateData = {
      name,
      price,
      weight: toNumber(weight),
    };

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar variante: ${error.message}`);
    }

    return data;
  }

  static async deleteVariant(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar variante: ${error.message}`);
    }
  }
}
