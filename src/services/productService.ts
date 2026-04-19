import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export interface ProductVariantInput {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  sku?: string | null;
  weight?: number | null;
  unit?: string | null;
  pieces?: number | null;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  farmer_id: string;
  category: string;
  unit: string;
  main_image_url?: string;
  is_available?: boolean;
  stock_quantity?: number;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  variants?: ProductVariantInput[];
}

const toNumber = (val: unknown, integer = false): number => {
  if (val === null || val === undefined) return 0;
  const n = Number(val);
  if (!Number.isFinite(n)) return 0;
  return integer ? Math.trunc(n) : n;
};

export class ProductService {
  static async getPublicProducts(filters?: {
    category?: string;
    search?: string;
    featured?: boolean;
  }) {
    let query = supabaseAdmin
      .from('products')
      .select('*')
      // Quitamos el .eq('status', 'published') porque no existe en tu base de datos
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.featured) {
      query = query.eq('featured', true).limit(6);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener productos públicos: ${error.message}`);
    }

    return data || [];
  }

  static async getPublicProductById(id: string) {
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      // Quitamos el .eq('status', 'published') de aquí también
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener producto público: ${productError.message}`);
    }

    if (!productData) {
      return null;
    }

    // Intentamos obtener las variantes, pero si falla NO rompemos la página
    const { data: variantsData, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: true });

    if (variantsError) {
      console.warn(`Aviso: No se pudieron cargar las variantes: ${variantsError.message}`);
    }

    return {
      ...productData,
      variants: variantsData || []
    };
  }

  static async getPublicCategories() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category')
      // Quitamos el .eq('status', 'published')
      .eq('is_available', true);

    if (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`);
    }

    const uniqueCategories = Array.from(
      new Set((data || []).map((item) => item.category).filter(Boolean))
    );

    return uniqueCategories;
  }

  static async getAllAdminProducts() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }

    return data || [];
  }

  static async createProduct(productData: ProductInput) {
    const insertData = {
      ...productData,
      tags: [],
      features: [],
      gallery_images: [],
      stock_quantity: productData.stock_quantity || 0,
      min_order_quantity: 1,
      requires_cold_shipping: false
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }

    return data;
  }

  static async updateProduct(id: string, productData: ProductInput) {
    const variants = Array.isArray(productData?.variants) ? productData.variants : [];
    const normalizedVariants = variants.map((v) => ({
      id: v.id || undefined,
      product_id: id,
      name: String(v.name || ''),
      description: v.description ? String(v.description) : null,
      price: toNumber(v.price),
      stock_quantity: toNumber(v.stock_quantity, true),
      sku: v.sku ? String(v.sku) : null,
      weight: v.weight !== undefined && v.weight !== null ? toNumber(v.weight) : null,
      unit: v.unit ? String(v.unit) : null,
      pieces: v.pieces !== undefined && v.pieces !== null ? toNumber(v.pieces, true) : null
    }));

    const { variants: _omit, ...productFields } = productData;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...productFields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }

    if (normalizedVariants.length > 0) {
      const { error: deleteError } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', id);

      if (deleteError) {
        throw new Error(`Error al reemplazar variantes: ${deleteError.message}`);
      }

      const { error: insertError } = await supabaseAdmin
        .from('product_variants')
        .insert(normalizedVariants);

      if (insertError) {
        throw new Error(`Error al insertar variantes: ${insertError.message}`);
      }
    }

    return data;
  }

  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }
}