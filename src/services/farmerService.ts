import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import { HttpError } from '@/lib/server/httpError';

const FARMER_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const;
type FarmerStatusValue = (typeof FARMER_STATUSES)[number];

/** Campos gestionados por el sistema: nunca se aceptan tal cual desde el cliente. */
const PROTECTED_FIELDS = ['id', 'created_at', 'updated_at', 'approved_by', 'approved_at', 'verified'];

const isValidStatus = (value: unknown): value is FarmerStatusValue =>
  typeof value === 'string' && (FARMER_STATUSES as readonly string[]).includes(value);

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

  static async updateFarmer(id: string, payload: Record<string, unknown>, adminId?: string) {
    if (!id) {
      throw new HttpError(400, 'Identificador de agricultor no válido');
    }

    const sanitized = Object.fromEntries(
      Object.entries(payload || {}).filter(([key]) => !PROTECTED_FIELDS.includes(key))
    );

    if (Object.keys(sanitized).length === 0) {
      throw new HttpError(400, 'No se han recibido cambios que aplicar');
    }

    const nowIso = new Date().toISOString();
    const updates: Record<string, unknown> = { ...sanitized, updated_at: nowIso };

    if ('status' in sanitized) {
      if (!isValidStatus(sanitized.status)) {
        throw new HttpError(400, `Estado no válido. Valores permitidos: ${FARMER_STATUSES.join(', ')}`);
      }

      // Aceptar (o reactivar) deja constancia de quién y cuándo; rechazar retira la verificación.
      if (sanitized.status === 'approved') {
        updates.verified = true;
        updates.approved_at = nowIso;
        if (adminId) updates.approved_by = adminId;
      } else {
        updates.verified = false;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('farmers')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      throw new Error(`Error al actualizar agricultor: ${error.message}`);
    }

    if (!data) {
      throw new HttpError(404, 'Agricultor no encontrado');
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
