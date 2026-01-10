import { supabaseAdmin } from '../config/supabase';
import { Product, CreateProductRequest, ProductWithFarmer, ProductWithVariants } from '../types/database';

export class ProductService {
  // Obtener todos los productos con información del agricultor
  static async getAllProducts(includeInactive = false): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        farmer:farmers(
          id,
          first_name,
          last_name,
          business_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }

    // Enriquecer con farmer_name para compatibilidad con el frontend
    const enriched = (data || []).map((product: any) => ({
      ...product,
      farmer_name: product.farmer 
        ? (product.farmer.business_name || `${product.farmer.first_name} ${product.farmer.last_name}`)
        : 'Agricultor no asignado'
    }));

    return enriched as Product[];
  }

  // Obtener productos con información del agricultor
  static async getProductsWithFarmer(): Promise<ProductWithFarmer[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        farmer:farmers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos con agricultor: ${error.message}`);
    }

    return data || [];
  }

  // Obtener producto por ID
  static async getProductById(id: string): Promise<ProductWithVariants | null> {
    // Consultar directamente la tabla products con JOIN explícito a farmers
    const { data, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        farmer:farmers(
          id,
          first_name,
          last_name,
          business_name,
          profile_image_url,
          address,
          city,
          province,
          description,
          story
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener producto: ${error.message}`);
    }

    // Obtener las variantes del producto
    const { data: variants } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id);

    // Enriquecer el producto con sus variantes
    const enriched: any = {
      ...data,
      variants: variants || [],
      // Reformatear datos del agricultor para el frontend
      farmer: data.farmer
        ? {
            id: data.farmer.id,
            name: data.farmer.business_name || `${data.farmer.first_name} ${data.farmer.last_name}`,
            first_name: data.farmer.first_name,
            last_name: data.farmer.last_name,
            image: data.farmer.profile_image_url,
            location: `${data.farmer.city}, ${data.farmer.province}`,
            coordinates: data.farmer.address,
            story: data.farmer.story || data.farmer.description || '',
          }
        : null,
    };

    return enriched as ProductWithVariants;
  }

  // Crear nuevo producto
  // El campo 'price' es OPCIONAL (solo informativo "Desde X€")
  // El precio real se define en las variantes
  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    // Extraer variantes del payload si existen
    const variants: any[] = Array.isArray((productData as any)?.variants) 
      ? (productData as any).variants 
      : [];
    
    // Validar que al menos haya una variante con precio
    if (variants.length === 0 || !variants.some(v => v.price && v.price > 0)) {
      throw new Error('Debe proporcionar al menos una variante con precio válido');
    }

    // SOLO LOS 7 CAMPOS QUE EXISTEN EN LA BD
    const insertData = {
      name: productData.name,
      description: productData.description || '',
      price: parseFloat(String(productData.price)) || 0,
      category: productData.category,
      main_image_url: productData.main_image_url || '',
      farmer_id: productData.farmer_id,
      unit: productData.unit || 'kg'
    }

    // Crear producto
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`);
    }

    // Crear variantes asociadas en transacción
    if (variants.length > 0) {
      const toNumber = (val: any, integer = false) => {
        if (val === null || val === undefined || val === '') return 0;
        const n = Number(val);
        if (!Number.isFinite(n) || isNaN(n)) return 0;
        return integer ? Math.trunc(n) : n;
      };

      // SOLO LOS 5 CAMPOS QUE EXISTEN EN product_variants
      const normalizedVariants = variants.map((v) => ({
        product_id: data.id,
        name: String(v.name || ''),
        price: parseFloat(v.price) || 0,
        weight: parseFloat(v.weight) || 0,
        unit: String(v.unit || 'kg')
      }));

      const { error: variantsError } = await supabaseAdmin
        .from('product_variants')
        .insert(normalizedVariants);

      if (variantsError) {
        // Si falla la creación de variantes, eliminar el producto creado (rollback manual)
        await supabaseAdmin.from('products').delete().eq('id', data.id);
        throw new Error(`Error al crear variantes: ${variantsError.message}`);
      }
    }

    return data;
  }

  // Actualizar producto
  static async updateProduct(id: string, productData: any): Promise<Product> {
    // Normalizar variantes si llegan en el payload
    const variants: any[] = Array.isArray(productData?.variants) ? productData.variants : [];
    const toNumber = (val: any, integer = false) => {
      if (val === null || val === undefined || val === '') return 0;
      const n = Number(val);
      if (!Number.isFinite(n) || isNaN(n)) return 0;
      return integer ? Math.trunc(n) : n;
    };
    // SOLO LOS 5 CAMPOS QUE EXISTEN EN product_variants
    const normalizedVariants = variants.map((v) => ({
      id: v.id || undefined,
      product_id: id,
      name: String(v.name || ''),
      price: parseFloat(v.price) || 0,
      weight: parseFloat(v.weight) || 0,
      unit: String(v.unit || 'kg')
    }));

    // Quitar variants del objeto de producto antes de actualizar la tabla products
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

    // Si hay variantes en el payload, reemplazar completamente
    if (normalizedVariants.length > 0) {
      // Eliminar existentes
      const { error: delError } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('product_id', id);
      if (delError) {
        throw new Error(`Error al borrar variantes existentes: ${delError.message}`);
      }

      // Insertar nuevas
      const { error: insError } = await supabaseAdmin
        .from('product_variants')
        .insert(normalizedVariants);
      if (insError) {
        throw new Error(`Error al insertar variantes: ${insError.message}`);
      }
    }

    return data;
  }

  // Eliminar producto
  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  // Obtener productos por categoría
  static async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos por categoría: ${error.message}`);
    }

    return data || [];
  }

  // Buscar productos
  static async searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar productos: ${error.message}`);
    }

    return data || [];
  }

  // Obtener productos destacados
  static async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }

    return data || [];
  }


  // Obtener productos por agricultor usando función SQL
  static async getProductsByFarmer(farmerId: string): Promise<any> {
    const { data, error } = await supabaseAdmin.rpc('get_farmer_products', {
      farmer_id: farmerId
    });

    if (error) {
      throw new Error(`Error al obtener productos del agricultor: ${error.message}`);
    }

    return data || [];
  }

  // Obtener productos básicos por agricultor (backup method)
  static async getProductsByFarmerBasic(farmerId: string): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos del agricultor: ${error.message}`);
    }

    return data || [];
  }

  // Obtener estadísticas de productos
  static async getProductStats() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const categoryCount = (data || []).reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total_products: data?.length || 0,
      category_distribution: categoryCount
    };

    return stats;
  }
}
