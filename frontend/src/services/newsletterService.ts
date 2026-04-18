import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export class NewsletterService {
  static async subscribe(payload: {
    email: string;
    first_name?: string;
    last_name?: string;
    interests?: string[];
    frequency?: string;
  }) {
    const email = payload.email.trim().toLowerCase();
    const { data: existing } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (existing?.is_active) {
      return {
        alreadyRegistered: true,
        message: 'Este email ya está suscrito al newsletter',
        subscription: existing
      };
    }

    if (existing && !existing.is_active) {
      const { data, error } = await supabaseAdmin
        .from('newsletter_subscriptions')
        .update({
          first_name: payload.first_name || existing.first_name,
          last_name: payload.last_name || existing.last_name,
          interests: payload.interests || existing.interests || [],
          frequency: payload.frequency || existing.frequency || 'weekly',
          is_active: true,
          confirmed: true,
          unsubscribed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error al reactivar suscripción: ${error.message}`);
      }

      return {
        alreadyRegistered: false,
        message: 'Suscripción reactivada correctamente',
        subscription: data
      };
    }

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .insert([
        {
          email,
          first_name: payload.first_name || null,
          last_name: payload.last_name || null,
          interests: payload.interests || [],
          frequency: payload.frequency || 'weekly',
          is_active: true,
          confirmed: true
        }
      ])
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error al crear suscripción: ${error.message}`);
    }

    return {
      alreadyRegistered: false,
      message: 'Suscripción creada exitosamente',
      subscription: data
    };
  }

  static async getAdminSubscriptions(activeOnly = false) {
    let query = supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Error al obtener suscripciones: ${error.message}`);
    }

    return data || [];
  }

  static async deleteSubscription(id: string) {
    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar suscripción: ${error.message}`);
    }
  }
}
