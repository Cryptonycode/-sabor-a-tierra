import { supabaseAdmin } from '../config/supabase';
import { Farmer, CreateFarmerRequest, FarmerWithProducts } from '../types/database';

export class FarmerService {
  // Obtener todos los agricultores
  static async getAllFarmers(includeInactive = false, statusFilter?: string): Promise<Farmer[]> {
    const query = supabaseAdmin
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false });

    // Sin filtros de estado - todos los agricultores son visibles
    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener agricultores: ${error.message}`);
    }

    return data || [];
  }

  // Obtener agricultor por ID
  static async getFarmerById(id: string): Promise<Farmer | null> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener agricultor: ${error.message}`);
    }

    return data;
  }

  // Obtener agricultor con sus productos
  static async getFarmerWithProducts(id: string): Promise<FarmerWithProducts | null> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select(`
        *,
        products (*)
      `)
      .eq('id', id)
      .eq('products.status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener agricultor con productos: ${error.message}`);
    }

    return data;
  }

  // Obtener agricultor por email
  static async getFarmerByEmail(email: string): Promise<Farmer | null> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener agricultor por email: ${error.message}`);
    }

    return data;
  }

  // Crear nuevo agricultor
  static async createFarmer(farmerData: CreateFarmerRequest): Promise<Farmer> {
    const insertData = {
      ...farmerData,
      specialties: farmerData.specialties || [],
      certifications: farmerData.certifications || [],
      years_experience: farmerData.years_experience || 0,
      hectares: farmerData.hectares || 0,
      customers_served: 0,
      status: 'pending',
      verified: false
    };

    const { data, error } = await supabaseAdmin
      .from('farmers')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear agricultor: ${error.message}`);
    }

    return data;
  }

  // Actualizar agricultor
  static async updateFarmer(id: string, updateData: Partial<Farmer>): Promise<Farmer> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar agricultor: ${error.message}`);
    }

    return data;
  }

  // Eliminar agricultor
  static async deleteFarmer(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('farmers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar agricultor: ${error.message}`);
    }
  }

  // Aprobar agricultor
  static async approveFarmer(id: string, adminId: string): Promise<Farmer> {
    return this.updateFarmer(id, {
      status: 'approved',
      verified: true,
      approved_by: adminId,
      approved_at: new Date().toISOString()
    });
  }

  // Rechazar agricultor
  static async rejectFarmer(id: string): Promise<Farmer> {
    return this.updateFarmer(id, {
      status: 'rejected'
    });
  }

  // Suspender agricultor
  static async suspendFarmer(id: string): Promise<Farmer> {
    return this.updateFarmer(id, {
      status: 'suspended'
    });
  }

  // Obtener agricultores por especialidad
  static async getFarmersBySpecialty(specialty: string): Promise<Farmer[]> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .contains('specialties', [specialty])
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener agricultores por especialidad: ${error.message}`);
    }

    return data || [];
  }

  // Obtener agricultores por provincia
  static async getFarmersByProvince(province: string): Promise<Farmer[]> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('province', province)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener agricultores por provincia: ${error.message}`);
    }

    return data || [];
  }

  // Buscar agricultores
  static async searchFarmers(query: string): Promise<Farmer[]> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,business_name.ilike.%${query}%,city.ilike.%${query}%`)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar agricultores: ${error.message}`);
    }

    return data || [];
  }

  // Obtener agricultores pendientes de aprobación
  static async getPendingFarmers(): Promise<Farmer[]> {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error al obtener agricultores pendientes: ${error.message}`);
    }

    return data || [];
  }

  // Obtener estadísticas de agricultores
  static async getFarmerStats() {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('status, verified, province, created_at');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const stats = {
      total_farmers: data?.length || 0,
      approved_farmers: data?.filter(f => f.status === 'approved').length || 0,
      pending_farmers: data?.filter(f => f.status === 'pending').length || 0,
      verified_farmers: data?.filter(f => f.verified).length || 0,
      farmers_this_month: data?.filter(f => 
        new Date(f.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0,
      provinces: [...new Set(data?.map(f => f.province) || [])].length
    };

    return stats;
  }

  // Incrementar contador de clientes servidos
  static async incrementCustomersServed(farmerId: string): Promise<void> {
    const farmer = await this.getFarmerById(farmerId);
    if (farmer) {
      await this.updateFarmer(farmerId, {
        customers_served: farmer.customers_served + 1
      });
    }
  }

  // Obtener productos de un agricultor
  static async getFarmerProducts(farmerId: string) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener productos del agricultor: ${error.message}`);
    }

    return data || [];
  }
}
