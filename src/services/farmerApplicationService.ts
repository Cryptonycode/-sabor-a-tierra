import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { HttpError } from '@/lib/server/httpError';

/**
 * `farmer_applications` acepta 'conventional', pero la restricción CHECK de
 * `farmers` solo admite 'traditional' para ese mismo concepto.
 */
const FARMER_PRODUCTION_TYPES = ['traditional', 'organic', 'biodynamic', 'integrated', 'artisanal'];

const toFarmerProductionType = (value?: string | null) => {
  if (value === 'conventional' || !value) return 'traditional';
  return FARMER_PRODUCTION_TYPES.includes(value) ? value : 'traditional';
};

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
    production_type: toFarmerProductionType(application.production_type),
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

  /**
   * Aprueba (o reactiva) una solicitud. Si ya existe una ficha con ese email
   * —caso de una solicitud rechazada que se vuelve a aceptar— se reutiliza en
   * lugar de insertar una nueva, que además violaría el índice único de email.
   */
  static async approveApplication(id: string, adminId: string) {
    const application = await this.getApplicationById(id);
    if (!application) {
      throw new HttpError(404, 'Solicitud no encontrada');
    }

    const farmerPayload = mapApplicationToFarmerPayload(application, adminId);

    const { data: existingFarmer, error: lookupError } = await supabaseAdmin
      .from('farmers')
      .select('id')
      .eq('email', application.email)
      .maybeSingle();

    if (lookupError) {
      throw new Error(`Error al comprobar el agricultor existente: ${lookupError.message}`);
    }

    const { data: farmer, error: farmerError } = existingFarmer
      ? await supabaseAdmin
          .from('farmers')
          .update({ ...farmerPayload, updated_at: new Date().toISOString() })
          .eq('id', existingFarmer.id)
          .select('id')
          .single()
      : await supabaseAdmin.from('farmers').insert([farmerPayload]).select('id').single();

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
      .maybeSingle();

    if (error) {
      throw new Error(`Error al rechazar aplicación: ${error.message}`);
    }

    if (!data) {
      throw new HttpError(404, 'Solicitud no encontrada');
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
