import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export class FarmerService {
  static async getPublicFarmers() {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener agricultores: ${error.message}`);
    }

    return data || [];
  }

  static async getPublicFarmerById(id: string) {
    const { data: farmer, error: farmerError } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (farmerError) {
      if (farmerError.code === 'PGRST116') return null;
      throw new Error(`Error al obtener agricultor: ${farmerError.message}`);
    }

    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('farmer_id', id)
      .eq('status', 'published')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (productsError) {
      throw new Error(`Error al obtener productos del agricultor: ${productsError.message}`);
    }

    return {
      ...farmer,
      products: products || []
    };
  }

  static async getAdminFarmers(status?: string) {
    let query = supabaseAdmin.from('farmers').select('*').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error al obtener agricultores: ${error.message}`);
    }

    return data || [];
  }

  static async createFarmer(payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .insert([{ ...payload, status: (payload.status as string) || 'pending', verified: Boolean(payload.verified) }])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al crear agricultor: ${error.message}`);
    }

    return data;
  }

  static async updateFarmer(id: string, payload: Record<string, unknown>) {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al actualizar agricultor: ${error.message}`);
    }

    return data;
  }

  static async deleteFarmer(id: string) {
    const { error } = await supabaseAdmin.from('farmers').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar agricultor: ${error.message}`);
    }
  }
}
