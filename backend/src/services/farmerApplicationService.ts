import { supabaseAdmin } from '../config/supabase';
import { FarmerApplication } from '../types/database';
import { FarmerService } from './farmerService';

export class FarmerApplicationService {
  // Crear nueva aplicación
  static async createApplication(applicationData: Omit<FarmerApplication, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<FarmerApplication> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .insert([{
        ...applicationData,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear aplicación: ${error.message}`);
    }

    return data;
  }

  // Aprobar solicitud y crear agricultor
  static async approveApplication(applicationId: string, adminId: string): Promise<{ farmerId: string; application: FarmerApplication }> {
    const { data: farmerId, error: approveError } = await supabaseAdmin
      .rpc('approve_farmer_application', {
        application_id: applicationId,
        admin_id: adminId
      });

    if (approveError) {
      throw new Error(`Error al aprobar solicitud: ${approveError.message}`);
    }

    // Obtener la solicitud actualizada
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      throw new Error(`Error al obtener solicitud: ${fetchError.message}`);
    }

    return { farmerId, application };
  }

  // Rechazar solicitud
  static async rejectApplication(applicationId: string, adminId: string, reason?: string): Promise<FarmerApplication> {
    const { data: success, error: rejectError } = await supabaseAdmin
      .rpc('reject_farmer_application', {
        application_id: applicationId,
        admin_id: adminId,
        reason: reason || null
      });

    if (rejectError || !success) {
      throw new Error(`Error al rechazar solicitud: ${rejectError?.message || 'Solicitud no encontrada'}`);
    }

    // Obtener la solicitud actualizada
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      throw new Error(`Error al obtener solicitud: ${fetchError.message}`);
    }

    return application;
  }

  // Obtener todas las aplicaciones
  static async getAllApplications(): Promise<FarmerApplication[]> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener aplicaciones: ${error.message}`);
    }

    return data || [];
  }

  // Obtener aplicación por ID
  static async getApplicationById(id: string): Promise<FarmerApplication | null> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener aplicación: ${error.message}`);
    }

    return data;
  }

  // Obtener aplicaciones por estado
  static async getApplicationsByStatus(status: FarmerApplication['status']): Promise<FarmerApplication[]> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener aplicaciones por estado: ${error.message}`);
    }

    return data || [];
  }

  // Obtener aplicaciones pendientes
  static async getPendingApplications(): Promise<FarmerApplication[]> {
    return this.getApplicationsByStatus('pending');
  }

  // Actualizar estado de aplicación
  static async updateApplicationStatus(
    id: string, 
    status: FarmerApplication['status'], 
    reviewedBy: string,
    adminNotes?: string
  ): Promise<FarmerApplication> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar estado de aplicación: ${error.message}`);
    }

    return data;
  }

  // Método legacy mantenido por compatibilidad
  static async approveApplicationLegacy(
    id: string, 
    reviewedBy: string, 
    adminNotes?: string
  ): Promise<{ application: FarmerApplication; farmer: any }> {
    // Obtener la aplicación
    const application = await this.getApplicationById(id);
    if (!application) {
      throw new Error('Aplicación no encontrada');
    }

    // Crear el agricultor
    const farmerData = {
      first_name: application.first_name,
      last_name: application.last_name,
      email: application.email,
      phone: application.phone,
      business_name: application.business_name,
      description: application.description,
      address: application.address,
      city: application.city,
      postal_code: application.postal_code,
      province: application.province,
      production_type: application.production_type,
      specialties: application.main_products.split(',').map(p => p.trim()),
      certifications: application.certifications ? application.certifications.split(',').map(c => c.trim()) : []
    };

    const farmer = await FarmerService.createFarmer(farmerData);

    // Actualizar la aplicación con el farmer_id
    const updatedApplication = await supabaseAdmin
      .from('farmer_applications')
      .update({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes,
        farmer_id: farmer.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updatedApplication.error) {
      throw new Error(`Error al actualizar aplicación: ${updatedApplication.error.message}`);
    }

    // Aprobar automáticamente el agricultor creado
    await FarmerService.approveFarmer(farmer.id, reviewedBy);

    return {
      application: updatedApplication.data,
      farmer
    };
  }

  // Método legacy mantenido por compatibilidad
  static async rejectApplicationLegacy(
    id: string, 
    reviewedBy: string, 
    adminNotes: string
  ): Promise<FarmerApplication> {
    return this.updateApplicationStatus(id, 'rejected', reviewedBy, adminNotes);
  }

  // Marcar como en revisión
  static async markAsReviewing(
    id: string, 
    reviewedBy: string
  ): Promise<FarmerApplication> {
    return this.updateApplicationStatus(id, 'reviewing', reviewedBy);
  }

  // Buscar aplicaciones
  static async searchApplications(query: string): Promise<FarmerApplication[]> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,business_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar aplicaciones: ${error.message}`);
    }

    return data || [];
  }

  // Obtener aplicaciones por email
  static async getApplicationsByEmail(email: string): Promise<FarmerApplication[]> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener aplicaciones por email: ${error.message}`);
    }

    return data || [];
  }

  // Verificar si ya existe una aplicación para un email
  static async checkExistingApplication(email: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('id')
      .eq('email', email)
      .in('status', ['pending', 'reviewing', 'approved']);

    if (error) {
      throw new Error(`Error al verificar aplicación existente: ${error.message}`);
    }

    return (data && data.length > 0);
  }

  // Eliminar aplicación
  static async deleteApplication(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('farmer_applications')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar aplicación: ${error.message}`);
    }
  }

  // Obtener estadísticas de aplicaciones
  static async getApplicationStats() {
    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .select('status, created_at');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const stats = {
      total_applications: data?.length || 0,
      pending_applications: data?.filter(a => a.status === 'pending').length || 0,
      reviewing_applications: data?.filter(a => a.status === 'reviewing').length || 0,
      approved_applications: data?.filter(a => a.status === 'approved').length || 0,
      rejected_applications: data?.filter(a => a.status === 'rejected').length || 0,
      applications_this_month: data?.filter(a => 
        new Date(a.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0
    };

    return stats;
  }
}
