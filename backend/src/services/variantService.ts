import { supabaseAdmin } from '../config/supabase';
import { ProductVariant } from '../types/database';

export class VariantService {
  // Obtener todas las variantes de un producto
  static async getVariantsByProductId(productId: string): Promise<ProductVariant[]> {
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

  // Obtener una variante por ID
  static async getVariantById(id: string): Promise<ProductVariant | null> {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(`Error al obtener variante: ${error.message}`);
    }

    return data;
  }

  // Crear una nueva variante
  static async createVariant(variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    // Eliminar propiedad inexistente en la tabla
    const { is_available: _omit, ...insertData } = (variantData as any) || {};

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

  // Actualizar una variante
  static async updateVariant(id: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .update(variantData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar variante: ${error.message}`);
    }

    return data;
  }

  // Eliminar una variante
  static async deleteVariant(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar variante: ${error.message}`);
    }
  }

  // Crear múltiples variantes de una vez
  static async createVariantsBatch(variants: Partial<ProductVariant>[]): Promise<ProductVariant[]> {
    
    // --- INICIO DE LA CORRECCIÓN ---
    // Mapeamos el array para asegurarnos de que ningún objeto contenga
    // propiedades que no existen en la tabla 'product_variants'.
    const cleanVariants = variants.map(variant => {
      const { is_available: _omit, ...rest } = (variant as any) || {};
      return rest;
    });
    // --- FIN DE LA CORRECCIÓN ---

    const { data, error } = await supabaseAdmin
      .from('product_variants')
      .insert(cleanVariants) // Usamos el array limpio en lugar del original
      .select();

    if (error) {
      console.error('Error de Supabase al insertar variantes en lote:', error);
      throw new Error(`Error al crear variantes: ${error.message}`);
    }

    return data || [];
  }

  // Eliminar todas las variantes de un producto
  static async deleteVariantsByProductId(productId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Error al eliminar variantes: ${error.message}`);
    }
  }
}

export default VariantService;