import { supabaseAdmin } from '../config/supabase';
import { Admin, AdminPublic, DashboardStats } from '../types/database';
import bcrypt from 'bcryptjs';
import { sanitizeAdmin, sanitizeAdmins } from '../utils/adminSanitizer';

const ADMIN_PUBLIC_SELECT = 'id, email, first_name, last_name, role, is_active, permissions, created_by, created_at, updated_at, last_login_at';

export class AdminService {
  // Obtener todos los administradores
  static async getAllAdmins(): Promise<AdminPublic[]> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select(ADMIN_PUBLIC_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener administradores: ${error.message}`);
    }

    return data || [];
  }

  // Obtener administrador por ID
  static async getAdminById(id: string): Promise<AdminPublic | null> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select(ADMIN_PUBLIC_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener administrador: ${error.message}`);
    }

    return data;
  }

  private static async getAdminWithPasswordById(id: string): Promise<Admin | null> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener administrador: ${error.message}`);
    }

    return data;
  }

  private static async getAdminWithPasswordByEmail(email: string): Promise<Admin | null> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al obtener administrador por email: ${error.message}`);
    }

    return data;
  }

  // Crear nuevo administrador
  static async createAdmin(adminData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: Admin['role'];
    permissions?: string[];
    created_by: string;
  }): Promise<AdminPublic> {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    const insertData = {
      email: adminData.email,
      password_hash: hashedPassword,
      first_name: adminData.first_name,
      last_name: adminData.last_name,
      role: adminData.role,
      permissions: adminData.permissions || [],
      created_by: adminData.created_by,
      is_active: true
    };

    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert([insertData])
      .select(ADMIN_PUBLIC_SELECT)
      .single();

    if (error) {
      throw new Error(`Error al crear administrador: ${error.message}`);
    }

    return data;
  }

  // Actualizar administrador
  static async updateAdmin(id: string, updateData: Partial<Admin>): Promise<AdminPublic> {
    // Si se está actualizando la contraseña, hashearla
    if (updateData.password_hash) {
      updateData.password_hash = await bcrypt.hash(updateData.password_hash, 10);
    }

    const { data, error } = await supabaseAdmin
      .from('admins')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(ADMIN_PUBLIC_SELECT)
      .single();

    if (error) {
      throw new Error(`Error al actualizar administrador: ${error.message}`);
    }

    return data;
  }

  // Eliminar administrador
  static async deleteAdmin(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar administrador: ${error.message}`);
    }
  }

  // Activar/Desactivar administrador
  static async toggleAdminStatus(id: string, isActive: boolean): Promise<AdminPublic> {
    return this.updateAdmin(id, { is_active: isActive });
  }

  // Actualizar último login
  static async updateLastLogin(id: string): Promise<void> {
    await supabaseAdmin
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  // Verificar contraseña
  static async verifyPassword(email: string, password: string): Promise<AdminPublic | null> {
    const admin = await this.getAdminWithPasswordByEmail(email);
    
    if (!admin || !admin.is_active) {
      return null;
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    return isValid ? sanitizeAdmin(admin) : null;
  }

  // Cambiar contraseña
  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const admin = await this.getAdminWithPasswordById(id);
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isCurrentValid) {
      throw new Error('Contraseña actual incorrecta');
    }

    await this.updateAdmin(id, { password_hash: newPassword });
  }

  // Buscar administradores
  static async searchAdmins(query: string): Promise<AdminPublic[]> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select(ADMIN_PUBLIC_SELECT)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al buscar administradores: ${error.message}`);
    }

    return sanitizeAdmins(data || []);
  }

  // Obtener administradores activos
  static async getActiveAdmins(): Promise<AdminPublic[]> {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select(ADMIN_PUBLIC_SELECT)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener administradores activos: ${error.message}`);
    }

    return data || [];
  }

  // Verificar permisos
  static async hasPermission(adminId: string, permission: string): Promise<boolean> {
    const admin = await this.getAdminById(adminId);
    if (!admin || !admin.is_active) {
      return false;
    }

    // Superadmin tiene todos los permisos
    if (admin.role === 'superadmin') {
      return true;
    }

    return admin.permissions.includes(permission);
  }


  // Obtener actividad reciente (para el dashboard)
  static async getRecentActivity(limit = 10) {
    // Obtener pedidos recientes
    const { data: recentOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, status, created_at, customer_email')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ordersError) {
      throw new Error(`Error al obtener pedidos recientes: ${ordersError.message}`);
    }

    // Obtener aplicaciones recientes
    const { data: recentApplications, error: applicationsError } = await supabaseAdmin
      .from('farmer_applications')
      .select('id, first_name, last_name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (applicationsError) {
      throw new Error(`Error al obtener aplicaciones recientes: ${applicationsError.message}`);
    }

    // Obtener nuevos clientes
    const { data: recentCustomers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('id, first_name, last_name, email, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (customersError) {
      throw new Error(`Error al obtener clientes recientes: ${customersError.message}`);
    }

    return {
      recent_orders: recentOrders || [],
      recent_applications: recentApplications || [],
      recent_customers: recentCustomers || []
    };
  }

  // Obtener métricas de ventas
  static async getSalesMetrics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('total_amount, created_at, status')
      .gte('created_at', startDate.toISOString())
      .eq('payment_status', 'paid');

    if (error) {
      throw new Error(`Error al obtener métricas de ventas: ${error.message}`);
    }

    const salesByDay = (data || []).reduce((acc: any, order) => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + parseFloat(order.total_amount);
      return acc;
    }, {});

    const totalRevenue = (data || []).reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const totalOrders = data?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      sales_by_day: salesByDay,
      period_days: days
    };
  }

  // Obtener estadísticas de productos
  static async getProductMetrics() {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('status, category, is_available, created_at');

    if (error) {
      throw new Error(`Error al obtener métricas de productos: ${error.message}`);
    }

    const categoryDistribution = (data || []).reduce((acc: any, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total_products: data?.length || 0,
      published_products: data?.filter(p => p.status === 'published').length || 0,
      available_products: data?.filter(p => p.is_available).length || 0,
      draft_products: data?.filter(p => p.status === 'draft').length || 0,
      category_distribution: categoryDistribution
    };
  }

  // Obtener estadísticas del dashboard con solicitudes pendientes
  static async getDashboardStats(): Promise<any> {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_admin_dashboard_stats');

      if (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
      }

      return {
        ...data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}
