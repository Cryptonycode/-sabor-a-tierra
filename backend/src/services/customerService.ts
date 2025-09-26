import { supabaseAdmin } from '../config/supabase';
import { Customer, CreateCustomerRequest } from '../types/database';
import bcrypt from 'bcryptjs';

export class CustomerService {
  // Obtener todos los clientes (solo para admins)
  static async getAllCustomers(): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener clientes: ${error.message}`);
    }

    return data || [];
  }

  // Obtener cliente por ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener cliente: ${error.message}`);
    }

    return data;
  }

  // Obtener cliente por email
  static async getCustomerByEmail(email: string): Promise<Customer | null> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No encontrado
      }
      throw new Error(`Error al obtener cliente por email: ${error.message}`);
    }

    return data;
  }

  // Crear nuevo cliente
  static async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    const insertData: any = {
      email: customerData.email,
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      phone: customerData.phone,
      marketing_emails: customerData.marketing_emails ?? true,
      newsletter_subscribed: false,
      email_verified: false
    };

    // Hashear contraseña si se proporciona
    if (customerData.password) {
      insertData.password_hash = await bcrypt.hash(customerData.password, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('customers')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear cliente: ${error.message}`);
    }

    return data;
  }

  // Actualizar cliente
  static async updateCustomer(id: string, updateData: Partial<Customer>): Promise<Customer> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar cliente: ${error.message}`);
    }

    return data;
  }

  // Eliminar cliente
  static async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar cliente: ${error.message}`);
    }
  }

  // Verificar email
  static async verifyEmail(id: string): Promise<Customer> {
    return this.updateCustomer(id, { 
      email_verified: true 
    });
  }

  // Actualizar última conexión
  static async updateLastLogin(id: string): Promise<void> {
    await supabaseAdmin
      .from('customers')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  // Buscar clientes
  static async searchCustomers(query: string): Promise<Customer[]> {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar clientes: ${error.message}`);
    }

    return data || [];
  }

  // Obtener estadísticas de clientes
  static async getCustomerStats() {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('created_at, newsletter_subscribed, email_verified');

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const stats = {
      total_customers: data?.length || 0,
      verified_customers: data?.filter(c => c.email_verified).length || 0,
      newsletter_subscribers: data?.filter(c => c.newsletter_subscribed).length || 0,
      customers_this_month: data?.filter(c => 
        new Date(c.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      ).length || 0
    };

    return stats;
  }

  // Obtener pedidos de un cliente
  static async getCustomerOrders(customerId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(*),
          farmer:farmers(*)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener pedidos del cliente: ${error.message}`);
    }

    return data || [];
  }
}
