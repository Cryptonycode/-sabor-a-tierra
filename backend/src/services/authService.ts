import { supabaseAdmin as supabase } from '../config/supabase';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'superadmin' | 'admin' | 'moderator';
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  admin?: AdminUser;
  token?: string;
  message?: string;
}

class AuthService {
  private JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  private JWT_EXPIRES_IN = '24h';

  /**
   * Autenticar administrador
   */
  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { email, password } = credentials;

      // Buscar admin en la base de datos
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, password_hash, first_name, last_name, role, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error || !admin) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Verificar contraseña
      const passwordValid = await bcrypt.compare(password, admin.password_hash);
      
      if (!passwordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Actualizar último login
      await supabase
        .from('admins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id);

      // Crear token JWT
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          email: admin.email, 
          role: admin.role 
        },
        this.JWT_SECRET as string,
        { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
      );

      // Preparar respuesta (sin password_hash)
      const adminUser: AdminUser = {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        is_active: admin.is_active
      };

      return {
        success: true,
        admin: adminUser,
        token,
        message: 'Login exitoso'
      };

    } catch (error) {
      console.error('Error en loginAdmin:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar token JWT
   */
  verifyToken(token: string): { valid: boolean; admin?: any; error?: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        valid: true,
        admin: decoded
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token inválido o expirado'
      };
    }
  }

  /**
   * Obtener información del admin por ID
   */
  async getAdminById(adminId: string): Promise<AdminUser | null> {
    try {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, first_name, last_name, role, is_active')
        .eq('id', adminId)
        .eq('is_active', true)
        .single();

      if (error || !admin) {
        return null;
      }

      return admin as AdminUser;
    } catch (error) {
      console.error('Error en getAdminById:', error);
      return null;
    }
  }

  /**
   * Crear nuevo administrador (solo superadmins)
   */
  async createAdmin(
    adminData: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role?: 'admin' | 'moderator';
    },
    createdBy: string
  ): Promise<AuthResponse> {
    try {
      // Verificar que quien crea es superadmin
      const creator = await this.getAdminById(createdBy);
      if (!creator || creator.role !== 'superadmin') {
        return {
          success: false,
          message: 'No tienes permisos para crear administradores'
        };
      }

      // Hash de la contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(adminData.password, saltRounds);

      // Crear admin
      const { data: newAdmin, error } = await supabase
        .from('admins')
        .insert({
          email: adminData.email,
          password_hash,
          first_name: adminData.first_name,
          last_name: adminData.last_name,
          role: adminData.role || 'admin',
          created_by: createdBy,
          is_active: true
        })
        .select('id, email, first_name, last_name, role, is_active')
        .single();

      if (error) {
        return {
          success: false,
          message: error.message.includes('duplicate') 
            ? 'Ya existe un administrador con ese email'
            : 'Error al crear administrador'
        };
      }

      return {
        success: true,
        admin: newAdmin as AdminUser,
        message: 'Administrador creado exitosamente'
      };

    } catch (error) {
      console.error('Error en createAdmin:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Cambiar contraseña de administrador
   */
  async changePassword(
    adminId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar contraseña actual
      const { data: admin, error } = await supabase
        .from('admins')
        .select('password_hash')
        .eq('id', adminId)
        .single();

      if (error || !admin) {
        return {
          success: false,
          message: 'Administrador no encontrado'
        };
      }

      const passwordValid = await bcrypt.compare(oldPassword, admin.password_hash);
      
      if (!passwordValid) {
        return {
          success: false,
          message: 'Contraseña actual incorrecta'
        };
      }

      // Hash nueva contraseña
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('admins')
        .update({ password_hash: newPasswordHash })
        .eq('id', adminId);

      if (updateError) {
        return {
          success: false,
          message: 'Error al actualizar contraseña'
        };
      }

      return {
        success: true,
        message: 'Contraseña actualizada exitosamente'
      };

    } catch (error) {
      console.error('Error en changePassword:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Listar todos los administradores (solo superadmins)
   */
  async getAllAdmins(requestingAdminId: string): Promise<AdminUser[] | null> {
    try {
      // Verificar permisos
      const requestingAdmin = await this.getAdminById(requestingAdminId);
      if (!requestingAdmin || requestingAdmin.role !== 'superadmin') {
        return null;
      }

      const { data: admins, error } = await supabase
        .from('admins')
        .select('id, email, first_name, last_name, role, is_active, created_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener admins:', error);
        return null;
      }

      return admins as AdminUser[];
    } catch (error) {
      console.error('Error en getAllAdmins:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
