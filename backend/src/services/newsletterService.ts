import { supabaseAdmin } from '../config/supabase';
import { NewsletterSubscription, NewsletterSubscriptionRequest } from '../types/database';
import { randomBytes } from 'crypto';

export class NewsletterService {
  // Crear suscripción al newsletter
  static async subscribe(subscriptionData: NewsletterSubscriptionRequest): Promise<NewsletterSubscription> {
    // Verificar si ya existe una suscripción activa
    const existing = await this.getSubscriptionByEmail(subscriptionData.email);
    
    if (existing && existing.is_active) {
      throw new Error('Ya existe una suscripción activa para este email');
    }

    // Si existe pero está inactiva, reactivarla
    if (existing && !existing.is_active) {
      return this.reactivateSubscription(existing.id, subscriptionData);
    }

    // Crear nueva suscripción
    const confirmationToken = randomBytes(32).toString('hex');
    
    const insertData = {
      email: subscriptionData.email,
      first_name: subscriptionData.first_name,
      last_name: subscriptionData.last_name,
      interests: subscriptionData.interests || [],
      frequency: subscriptionData.frequency || 'weekly',
      is_active: true,
      confirmed: false,
      confirmation_token: confirmationToken
    };

    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear suscripción: ${error.message}`);
    }

    return data;
  }

  // Obtener suscripción por email
  static async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener suscripción: ${error.message}`);
    }

    return data;
  }

  // Obtener todas las suscripciones
  static async getAllSubscriptions(): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener suscripciones: ${error.message}`);
    }

    return data || [];
  }

  // Obtener suscripciones activas
  static async getActiveSubscriptions(): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('is_active', true)
      .eq('confirmed', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener suscripciones activas: ${error.message}`);
    }

    return data || [];
  }

  // Confirmar suscripción
  static async confirmSubscription(token: string): Promise<NewsletterSubscription> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmation_token: null,
        updated_at: new Date().toISOString()
      })
      .eq('confirmation_token', token)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al confirmar suscripción: ${error.message}`);
    }

    return data;
  }

  // Cancelar suscripción
  static async unsubscribe(email: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      throw new Error(`Error al cancelar suscripción: ${error.message}`);
    }
  }

  // Reactivar suscripción
  static async reactivateSubscription(
    id: string, 
    updateData: NewsletterSubscriptionRequest
  ): Promise<NewsletterSubscription> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        first_name: updateData.first_name,
        last_name: updateData.last_name,
        interests: updateData.interests || [],
        frequency: updateData.frequency || 'weekly',
        is_active: true,
        unsubscribed_at: null,
        subscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al reactivar suscripción: ${error.message}`);
    }

    return data;
  }

  // Actualizar preferencias
  static async updatePreferences(
    email: string, 
    preferences: {
      interests?: string[];
      frequency?: string;
      first_name?: string;
      last_name?: string;
    }
  ): Promise<NewsletterSubscription> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar preferencias: ${error.message}`);
    }

    return data;
  }

  // Obtener suscripciones por interés
  static async getSubscriptionsByInterest(interest: string): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .contains('interests', [interest])
      .eq('is_active', true)
      .eq('confirmed', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener suscripciones por interés: ${error.message}`);
    }

    return data || [];
  }

  // Obtener suscripciones por frecuencia
  static async getSubscriptionsByFrequency(frequency: string): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('frequency', frequency)
      .eq('is_active', true)
      .eq('confirmed', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener suscripciones por frecuencia: ${error.message}`);
    }

    return data || [];
  }

  // Marcar email como enviado
  static async markEmailSent(emails: string[]): Promise<void> {
    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        last_email_sent_at: new Date().toISOString()
      })
      .in('email', emails);

    if (error) {
      throw new Error(`Error al marcar emails como enviados: ${error.message}`);
    }
  }

  // Buscar suscripciones
  static async searchSubscriptions(query: string): Promise<NewsletterSubscription[]> {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar suscripciones: ${error.message}`);
    }

    return data || [];
  }

  // Eliminar suscripción
  static async deleteSubscription(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar suscripción: ${error.message}`);
    }
  }

  // Obtener estadísticas del newsletter
  static async getNewsletterStats() {
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('is_active, confirmed, frequency, interests, created_at');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const allInterests = data?.flatMap(s => s.interests) || [];
    const interestCounts = allInterests.reduce((acc: any, interest) => {
      acc[interest] = (acc[interest] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      total_subscriptions: data?.length || 0,
      active_subscriptions: data?.filter(s => s.is_active).length || 0,
      confirmed_subscriptions: data?.filter(s => s.confirmed).length || 0,
      pending_confirmation: data?.filter(s => s.is_active && !s.confirmed).length || 0,
      frequency_distribution: {
        daily: data?.filter(s => s.frequency === 'daily' && s.is_active).length || 0,
        weekly: data?.filter(s => s.frequency === 'weekly' && s.is_active).length || 0,
        monthly: data?.filter(s => s.frequency === 'monthly' && s.is_active).length || 0
      },
      popular_interests: Object.entries(interestCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([interest, count]) => ({ interest, count })),
      subscriptions_this_month: data?.filter(s => 
        new Date(s.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0
    };

    return stats;
  }

  // Obtener suscripciones para envío por lotes
  static async getSubscriptionsForBatch(
    frequency: string, 
    interests?: string[],
    limit = 100
  ): Promise<NewsletterSubscription[]> {
    let query = supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('frequency', frequency)
      .eq('is_active', true)
      .eq('confirmed', true)
      .limit(limit);

    if (interests && interests.length > 0) {
      // Obtener suscripciones que tengan al menos uno de los intereses
      query = query.overlaps('interests', interests);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener suscripciones para lote: ${error.message}`);
    }

    return data || [];
  }
}
