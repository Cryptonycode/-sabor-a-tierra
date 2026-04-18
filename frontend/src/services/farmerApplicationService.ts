import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

const mapApplicationToFarmerPayload = (application: any, adminId: string) => {
  const nowIso = new Date().toISOString();
  const specialtiesArray = application.main_products
    ? String(application.main_products)
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    : [];
  const certificationsArray = application.certifications
    ? String(application.certifications)
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    : [];

  return {
    first_name: application.first_name,
    last_name: application.last_name,
    email: application.email,
    phone: application.phone,
    business_name: application.business_name || null,
    description: application.description || null,
    short_description: application.short_description || application.description?.substring(0, 150) || null,
    story: application.description || null,
    address: application.address,
    city: application.city,
    postal_code: application.postal_code,
    province: application.province,
    specialties: specialtiesArray,
    certifications: certificationsArray,
    production_type: application.production_type || 'conventional',
    years_experience: application.farming_experience || 0,
    hectares: application.hectares || 0,
    customers_served: 0,
    profile_image_url: application.profile_image_path || null,
    status: 'approved',
    verified: true,
    approved_by: adminId,
    approved_at: nowIso
  };
};

export class FarmerApplicationService {
  static async createApplication(payload: Record<string, unknown>) {
    const { profile_image_url, ...rest } = payload as any;
    const insertData = {
      ...rest,
      profile_image_path: (payload as any).profile_image_path ?? profile_image_url ?? null,
      status: 'pending'
    };

    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .insert([insertData])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al crear aplicación: ${error.message}`);
    }

    return data;
  }

  static async checkExistingApplication(email: string) {
    const { count, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .in('status', ['pending', 'approved']);

    if (error) {
      throw new Error(`Error al verificar aplicación existente: ${error.message}`);
    }

    return Boolean(count && count > 0);
  }

  static async getAdminApplications(status?: string) {
    let query = supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error al obtener aplicaciones: ${error.message}`);
    }

    return data || [];
  }

  static async getApplicationById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error al obtener aplicación: ${error.message}`);
    }

    return data;
  }

  static async approveApplication(id: string, adminId: string) {
    const application = await this.getApplicationById(id);
    if (!application) {
      throw new Error('Aplicación no encontrada');
    }

    const { data: farmer, error: farmerError } = await supabaseAdmin
      .from('farmers')
      .insert([mapApplicationToFarmerPayload(application, adminId)])
      .select('id')
      .single();

    if (farmerError || !farmer) {
      throw new Error(`Error al crear agricultor: ${farmerError?.message || 'Error desconocido'}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from('farmer_applications')
      .update({
        status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw new Error(`Error al actualizar estado de aplicación: ${updateError.message}`);
    }

    return { success: true, farmerId: farmer.id };
  }

  static async rejectApplication(id: string, adminId: string, reason?: string) {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .update({
        status: 'rejected',
        rejection_reason: reason || null,
        approved_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al rechazar aplicación: ${error.message}`);
    }

    return data;
  }

  static async deleteApplication(id: string) {
    const { error } = await supabaseAdmin.from('farmer_applications').delete().eq('id', id);
    if (error) {
      throw new Error(`Error al eliminar aplicación: ${error.message}`);
    }
  }
}
