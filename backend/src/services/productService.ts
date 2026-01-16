import { supabaseAdmin } from '../config/supabase';
import { Product, CreateProductRequest, ProductWithFarmer, ProductWithVariants } from '../types/database';

export class ProductService {
  // Obtener todos los productos
  static async getAllProducts(includeInactive = false): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }

    return data || [];
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
    // Consultar la tabla products directamente y hacer JOIN manual con variants
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener producto: ${productError.message}`);
    }

    if (!productData) {
      return null;
    }

    // Obtener variantes del producto
    const { data: variantsData, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: true });

    if (variantsError) {
      console.error('Error al obtener variantes:', variantsError);
    }

    // Enriquecer con datos del agricultor si existe farmer_id
    const farmerId = (productData as any).farmer_id;
    let farmerInfo = null;

    if (farmerId) {
      const { data: farmerData, error: farmerError } = await supabaseAdmin
        .from('farmers')
        .select('id, first_name, last_name, profile_image_url, farm_name, farm_location, story')
        .eq('id', farmerId)
        .single();

      if (!farmerError && farmerData) {
        farmerInfo = {
          id: farmerData.id,
          first_name: farmerData.first_name,
          last_name: farmerData.last_name,
          name: `${farmerData.first_name} ${farmerData.last_name}`,
          image: farmerData.profile_image_url || null,
          location: farmerData.farm_location || 'España',
          story: farmerData.story || 'Agricultor dedicado a productos de calidad.',
          coordinates: ''
        };
      }
    }

    // Construir objeto final
    const enrichedProduct: any = {
      ...productData,
      variants: variantsData || [],
      farmer: farmerInfo || {
        name: 'Productor Sabor a Tierra',
        image: null,
        location: 'España',
        story: 'Productor local comprometido con la calidad.',
        coordinates: ''
      }
    };

    return enrichedProduct as ProductWithVariants;
  }

  // Crear nuevo producto
  static async createProduct(productData: CreateProductRequest): Promise<Product> {
    const insertData = {
      ...productData,
      tags: productData.tags || [],
      features: productData.features || [],
      gallery_images: productData.gallery_images || [],
      stock_quantity: productData.stock_quantity || 0,
      min_order_quantity: productData.min_order_quantity || 1,
      requires_cold_shipping: productData.requires_cold_shipping || false
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

  // Actualizar producto
  static async updateProduct(id: string, productData: any): Promise<Product> {
    // Normalizar variantes si llegan en el payload
    const variants: any[] = Array.isArray(productData?.variants) ? productData.variants : [];
    const toNumber = (val: any, integer = false) => {
      if (val === null || val === undefined) return 0;
      const n = Number(val);
      if (!Number.isFinite(n)) return 0;
      return integer ? Math.trunc(n) : n;
    };
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
      pieces: v.pieces !== undefined && v.pieces !== null ? toNumber(v.pieces, true) : null,
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

  // Obtener productos destacados (primeros 6 productos más recientes)
  static async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }

    return data || [];
  }

  // Publicar producto
  static async publishProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { updated_at: new Date().toISOString() });
  }

  // Archivar producto
  static async archiveProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { updated_at: new Date().toISOString() });
  }

  // Actualizar stock
  static async updateStock(id: string, quantity: number): Promise<Product> {
    return this.updateProduct(id, { 
      stock_quantity: quantity
    });
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

  // Obtener productos con bajo stock
  static async getLowStockProducts(threshold = 10): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .lte('stock_quantity', threshold)
      .order('stock_quantity', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener productos con bajo stock: ${error.message}`);
    }

    return data || [];
  }

  // Obtener estadísticas de productos
  static async getProductStats() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('category, stock_quantity');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const categoryCount = (data || []).reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total_products: data?.length || 0,
      out_of_stock: data?.filter(p => p.stock_quantity === 0).length || 0,
      low_stock: data?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length || 0,
      category_distribution: categoryCount
    };

    return stats;
  }
}
