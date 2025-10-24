import { supabaseAdmin } from '../config/supabase';
import { FarmerApplication } from '../types/database';
import { FarmerService } from './farmerService';

export class FarmerApplicationService {
  // Crear nueva aplicación
  static async createApplication(applicationData: Omit<FarmerApplication, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<FarmerApplication> {
    // Normalizar nombre de columna de imagen: usar profile_image_path y eliminar profile_image_url si viene del frontend
    const { profile_image_url, ...rest } = applicationData as any;
    const insertData = {
      ...rest,
      // Si el frontend envía profile_image_path úsalo; si envía profile_image_url, mapearlo a *_path
      profile_image_path: (applicationData as any).profile_image_path ?? profile_image_url ?? null,
      status: 'pending'
    } as any;

    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear aplicación: ${error.message}`);
    }

    return data;
  }

  // Aprobar solicitud y crear agricultor
  static async approveApplication(applicationId: string, adminId: string): Promise<{ success: true; farmerId: string }> {
    // ==========================================================
    // INICIO DE LA DEPURACIÓN DETALLADA
    // ==========================================================
    console.log(`--- DEBUG: [${new Date().toISOString()}] Iniciando approveApplication ---`);
    console.log(`--- DEBUG: Application ID: ${applicationId}`);
    console.log(`--- DEBUG: Admin ID: ${adminId}`);
    // ==========================================================

    try {
      // 1) Obtener la solicitud completa
      console.log('--- DEBUG: [Paso 1/5] Obteniendo datos de la solicitud...');
      const { data: application, error: getError } = await supabaseAdmin
        .from('farmer_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (getError || !application) {
        console.error('--- DEBUG: [Paso 1/5] ERROR al obtener la solicitud:', getError);
        throw new Error(`Aplicación no encontrada o error al obtenerla: ${getError?.message || 'no data'}`);
      }
      console.log('--- DEBUG: [Paso 1/5] Datos de la solicitud OBTENIDOS:', JSON.stringify(application, null, 2));

      // 2) Mapear datos a objeto de farmers
      console.log('--- DEBUG: [Paso 2/5] Mapeando datos para la tabla farmers...');
      const nowIso = new Date().toISOString();
      const specialtiesArray = application.main_products
        ? String(application.main_products)
            .split(',')
            .map((p: string) => p.trim())
            .filter((p: string) => p.length > 0)
        : [];
      const certificationsArray = application.certifications
        ? String(application.certifications)
            .split(',')
            .map((c: string) => c.trim())
            .filter((c: string) => c.length > 0)
        : [];

      // Creamos el objeto con todos los campos necesarios para la tabla 'farmers'
      const newFarmer = {
        first_name: application.first_name,
        last_name: application.last_name,
        email: application.email,
        phone: application.phone,
        business_name: application.business_name || null, // Asegurar null si no existe
        description: application.description || null, // Asegurar null si no existe
        short_description: application.short_description || application.description?.substring(0, 150) || null, // Usar desc corta o truncar la larga
        story: application.description || null, // Usar descripción como historia por defecto
        address: application.address,
        city: application.city,
        postal_code: application.postal_code,
        province: application.province,
        coordinates: null, // Asegurar que los campos opcionales tienen un valor por defecto
        specialties: specialtiesArray,
        certifications: certificationsArray,
        production_type: application.production_type || 'conventional', // Valor por defecto si no se proporciona
        years_experience: application.farming_experience || 0,
        hectares: application.hectares || 0,
        customers_served: 0, // Valor inicial
        profile_image_url: null, // Asumimos que no hay imagen al crear desde la solicitud
        cover_image_url: null,
        website: application.website || null,
        social_media: application.social_media || null, // Asegurar null si no existe o es JSON vacío
        status: 'approved', // Estado clave
        verified: true, // Marcar como verificado al aprobar
        approved_by: adminId, // ID del admin que aprueba
        approved_at: nowIso, // Fecha de aprobación
        // No incluimos created_at/updated_at aquí si la tabla los gestiona automáticamente
      } as any; // Usamos 'as any' temporalmente, idealmente deberíamos tener un tipo estricto

      console.log('--- DEBUG: [Paso 2/5] Datos mapeados para INSERTAR en farmers:', JSON.stringify(newFarmer, null, 2));


      // 3) Insertar agricultor
      console.log('--- DEBUG: [Paso 3/5] Intentando insertar en la tabla farmers...');
      const { data: createdFarmer, error: insertError } = await supabaseAdmin
        .from('farmers')
        .insert([newFarmer]) // Importante: Supabase espera un array para insert
        .select('id') // Seleccionar solo el ID para confirmar
        .single(); // Esperamos un solo resultado

      if (insertError || !createdFarmer) {
        console.error('--- DEBUG: [Paso 3/5] ERROR al insertar en farmers:', JSON.stringify(insertError, null, 2));
        throw new Error(`Error al crear agricultor: ${insertError?.message || 'sin datos retornados'}`);
      }
      console.log('--- DEBUG: [Paso 3/5] Agricultor INSERTADO con éxito. ID:', createdFarmer.id);


      // 4) Borrar la solicitud original
      console.log('--- DEBUG: [Paso 4/5] Intentando borrar de farmer_applications...');
      const { error: deleteError } = await supabaseAdmin
        .from('farmer_applications')
        .delete()
        .eq('id', applicationId);

      if (deleteError) {
        // Loggear el error pero NO lanzar una excepción aquí, el agricultor ya se creó.
        // Podríamos implementar lógica de compensación si esto fuera crítico.
        console.error('--- DEBUG: [Paso 4/5] ERROR al borrar de farmer_applications (pero el agricultor fue creado):', JSON.stringify(deleteError, null, 2));
        // throw new Error(`Error al borrar la solicitud: ${deleteError.message}`); // Descomentar si el borrado es mandatorio
      } else {
          console.log('--- DEBUG: [Paso 4/5] Solicitud BORRADA con éxito de farmer_applications.');
      }


      // 5) Devolver éxito
      console.log(`--- DEBUG: [Paso 5/5] approveApplication completado con éxito para ID: ${applicationId}. Nuevo Farmer ID: ${createdFarmer.id} ---`);
      return { success: true, farmerId: createdFarmer.id };

    } catch (error) {
      console.error(`--- DEBUG: ERROR CATASTRÓFICO en approveApplication para ID: ${applicationId}:`, error);
      // Asegurarse de que el error se propague para que el frontend no reciba un falso positivo
      throw error; // Re-lanzar el error para que el controlador lo capture
    }
  }

  // Rechazar solicitud (Usando función RPC si existe, si no, actualiza estado)
  static async rejectApplication(applicationId: string, adminId: string, reason?: string): Promise<FarmerApplication> {
     // Intenta llamar a la función RPC si está definida en tu base de datos
     const { data: rpcData, error: rpcError } = await supabaseAdmin
       .rpc('reject_farmer_application', {
         application_id: applicationId,
         admin_id: adminId,
         reason: reason || null
       });
     
     if (!rpcError && rpcData) {
        console.log(`--- DEBUG: Solicitud ${applicationId} rechazada vía RPC.`);
        // Si la RPC devuelve la aplicación actualizada, úsala. Si no, obténla manualmente.
        if (typeof rpcData === 'object' && rpcData !== null && 'id' in rpcData) {
          return rpcData as FarmerApplication;
        } else {
          // RPC no devolvió el objeto, obtenerlo manualmente
          const updatedApp = await this.getApplicationById(applicationId);
          if (!updatedApp) throw new Error('No se pudo obtener la aplicación actualizada tras rechazo RPC.');
          return updatedApp;
        }
     } else {
        // Fallback: Si la RPC falla o no existe, actualiza el estado manualmente
        console.warn(`--- DEBUG: RPC reject_farmer_application falló o no existe (Error: ${rpcError?.message}). Rechazando manualmente... ---`);
        const { data: updatedApp, error: updateError } = await supabaseAdmin
          .from('farmer_applications')
          .update({ 
            status: 'rejected', 
            approved_by: adminId, // Usamos approved_by aunque sea rechazo, o crea reviewed_by si existe
            rejection_reason: reason, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', applicationId)
          .select()
          .single();

        if (updateError || !updatedApp) {
           throw new Error(`Error al rechazar solicitud manualmente: ${updateError?.message || 'Solicitud no encontrada'}`);
        }
        console.log(`--- DEBUG: Solicitud ${applicationId} rechazada manualmente.`);
        return updatedApp;
     }
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
        return null; // Not found, return null as expected
      }
      // Log other errors before throwing
      console.error(`Error fetching application by ID ${id}:`, error);
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

  // Actualizar estado de aplicación (Función genérica, ¿se usa?)
  static async updateApplicationStatus(
    id: string,
    status: FarmerApplication['status'],
    reviewedBy: string,
    adminNotes?: string
  ): Promise<FarmerApplication> {
     console.warn(`--- DEBUG: Llamada a updateApplicationStatus (genérica) para ID ${id} con estado ${status}. Considerar usar approve/reject. ---`);
    const updateData: Partial<FarmerApplication> & { updated_at: string; rejection_reason?: string | null } = {
        status,
        // Asumiendo que 'approved_by' se usa para reviewed_by también. Si tienes reviewed_by, úsalo.
        approved_by: reviewedBy, 
        // reviewed_at: new Date().toISOString(), // Si tienes esta columna
        updated_at: new Date().toISOString()
    };
    // Añadir notas solo si se proporcionan
    if (adminNotes !== undefined) {
        updateData.rejection_reason = adminNotes; // O usa admin_notes si esa es tu columna
    }

    const { data, error } = await supabaseAdmin
      .from('farmer_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating application status for ID ${id}:`, error);
      throw new Error(`Error al actualizar estado de aplicación: ${error.message}`);
    }

    return data;
  }

  // --- MÉTODOS LEGACY ---
  // Estos métodos parecen redundantes o incorrectos según el flujo deseado.
  // Los comento para evitar confusión, pero los dejo por si hay dependencias ocultas.
  /*
  // Método legacy mantenido por compatibilidad
  static async approveApplicationLegacy(
    id: string,
    reviewedBy: string,
    adminNotes?: string
  ): Promise<{ application: FarmerApplication; farmer: any }> {
    console.warn(`--- DEBUG: Llamada a MÉTODO LEGACY approveApplicationLegacy para ID ${id}. Revisar si es necesario. ---`);
    // ... (código original) ...
  }

  // Método legacy mantenido por compatibilidad
  static async rejectApplicationLegacy(
    id: string,
    reviewedBy: string,
    adminNotes: string
  ): Promise<FarmerApplication> {
     console.warn(`--- DEBUG: Llamada a MÉTODO LEGACY rejectApplicationLegacy para ID ${id}. Revisar si es necesario. ---`);
    return this.updateApplicationStatus(id, 'rejected', reviewedBy, adminNotes);
  }
  */

  // Marcar como en revisión (¿Se usa este estado?)
  static async markAsReviewing(
    id: string,
    reviewedBy: string
  ): Promise<FarmerApplication> {
    console.warn(`--- DEBUG: Llamada a markAsReviewing para ID ${id}. Estado 'reviewing' no estándar. ---`);
    // Asumiendo que 'reviewing' es un estado válido en tu tabla
    // return this.updateApplicationStatus(id, 'reviewing', reviewedBy);
    // Si 'reviewing' no es un estado, esta función podría ser un error.
    // Devolver la aplicación actual sin cambios o lanzar error:
    const app = await this.getApplicationById(id);
    if (!app) throw new Error('Aplicación no encontrada para marcar como reviewing.');
    return app; 
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

  // Verificar si ya existe una aplicación activa para un email
  static async checkExistingApplication(email: string): Promise<boolean> {
    const { data, error, count } = await supabaseAdmin
      .from('farmer_applications')
      .select('id', { count: 'exact', head: true }) // Más eficiente: solo cuenta
      .eq('email', email)
      .in('status', ['pending', 'approved']); // ¿Incluir 'reviewing' si existe?

    if (error) {
      console.error(`Error checking existing application for email ${email}:`, error);
      throw new Error(`Error al verificar aplicación existente: ${error.message}`);
    }

    return (count !== null && count > 0);
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
    // Es más eficiente hacer el conteo en la base de datos si es posible
    const { count: total, error: totalError } = await supabaseAdmin
        .from('farmer_applications')
        .select('*', { count: 'exact', head: true });

    const { count: pending, error: pendingError } = await supabaseAdmin
        .from('farmer_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
    // Repetir para otros estados... (approved, rejected)
    
    // Y para el filtro de fecha (esto sí requiere traer los datos o una función RPC)
     const oneMonthAgo = new Date();
     oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
     const { count: monthly, error: monthlyError } = await supabaseAdmin
        .from('farmer_applications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo.toISOString());

    if (totalError || pendingError || monthlyError /* || otros errores */) {
      console.error('Error fetching application stats:', totalError, pendingError, monthlyError);
      throw new Error(`Error al obtener estadísticas: Uno o más conteos fallaron.`);
    }

    // Simplificado - añade los otros conteos si los necesitas
    const stats = {
      total_applications: total || 0,
      pending_applications: pending || 0,
      // reviewing_applications: ...,
      // approved_applications: ...,
      // rejected_applications: ...,
      applications_this_month: monthly || 0
    };

    return stats;
  }

}