import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export interface VariantInput {
  product_id?: string;
  name: string;
  description?: string | null;
  price: number;
  sku?: string | null;
  weight?: number | null;
  unit?: string | null;
  pieces?: number | null;
}

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
    const insertData = {
      product_id: variantData.product_id,
      name: variantData.name,
      description: variantData.description ?? null,
      price: variantData.price,
      sku: variantData.sku ?? null,
      weight: variantData.weight ?? null,
      unit: variantData.unit ?? null,
      pieces: variantData.pieces ?? null,
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
    const updateData = {
      name: variantData.name,
      description: variantData.description ?? null,
      price: variantData.price,
      sku: variantData.sku ?? null,
      weight: variantData.weight ?? null,
      unit: variantData.unit ?? null,
      pieces: variantData.pieces ?? null,
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
