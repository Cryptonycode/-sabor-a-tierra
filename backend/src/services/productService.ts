import { supabaseAdmin } from '../config/supabase';
import { Product, CreateProductRequest, ProductWithFarmer } from '../types/database';

export class ProductService {
  // Obtener todos los productos
  static async getAllProducts(includeInactive = false): Promise<Product[]> {
    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('status', 'published').eq('is_available', true);
    }

    const { data, error } = await query;

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
      .eq('status', 'published')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos con agricultor: ${error.message}`);
    }

    return data || [];
  }

  // Obtener producto por ID
  static async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener producto: ${error.message}`);
    }

    return data;
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
      requires_cold_shipping: productData.requires_cold_shipping || false,
      is_available: true,
      status: 'published',
      featured: false
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
  static async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
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
      .eq('status', 'published')
      .eq('is_available', true)
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
      .eq('status', 'published')
      .eq('is_available', true)
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
      .eq('featured', true)
      .eq('status', 'published')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`);
    }

    return data || [];
  }

  // Publicar producto
  static async publishProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { status: 'published' });
  }

  // Archivar producto
  static async archiveProduct(id: string): Promise<Product> {
    return this.updateProduct(id, { status: 'archived' });
  }

  // Marcar como destacado
  static async toggleFeatured(id: string, featured: boolean): Promise<Product> {
    return this.updateProduct(id, { featured });
  }

  // Actualizar stock
  static async updateStock(id: string, quantity: number): Promise<Product> {
    return this.updateProduct(id, { 
      stock_quantity: quantity,
      is_available: quantity > 0 
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
      .eq('status', 'published')
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
      .select('status, category, is_available, featured, stock_quantity');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const categoryCount = (data || []).reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total_products: data?.length || 0,
      published_products: data?.filter(p => p.status === 'published').length || 0,
      draft_products: data?.filter(p => p.status === 'draft').length || 0,
      featured_products: data?.filter(p => p.featured).length || 0,
      available_products: data?.filter(p => p.is_available).length || 0,
      out_of_stock: data?.filter(p => p.stock_quantity === 0).length || 0,
      low_stock: data?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length || 0,
      category_distribution: categoryCount
    };

    return stats;
  }
}
