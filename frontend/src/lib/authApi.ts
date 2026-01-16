import { api } from './api';

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

class AuthAPI {
  private TOKEN_KEY = 'admin_token';
  private ADMIN_KEY = 'admin_user';

  /**
   * Login de administrador
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.token && response.admin) {
        // Guardar token y datos del admin en localStorage
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.ADMIN_KEY, JSON.stringify(response.admin));
        localStorage.setItem('isAuthenticated', 'true');
      }
      
      return response;
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ADMIN_KEY);
    localStorage.removeItem('isAuthenticated');
  }

  /**
   * Obtener token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener datos del admin almacenados
   */
  getAdmin(): AdminUser | null {
    const adminData = localStorage.getItem(this.ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const admin = this.getAdmin();
    return !!(token && admin);
  }

  /**
   * Verificar token con el servidor
   */
  async verifyToken(): Promise<{ valid: boolean; admin?: AdminUser }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { valid: false };
      }

      const response = await api.post<{ success: boolean; admin?: AdminUser }>('/auth/verify', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.success && response.admin) {
        // Actualizar datos del admin en localStorage
        localStorage.setItem(this.ADMIN_KEY, JSON.stringify(response.admin));
        localStorage.setItem('isAuthenticated', 'true');
        return { valid: true, admin: response.admin };
      }

      // Token inválido, limpiar localStorage
      this.logout();
      return { valid: false };
    } catch (error) {
      console.error('Error verificando token:', error);
      this.logout();
      return { valid: false };
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No autenticado' };
      }

      const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', {
        oldPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  /**
   * Crear nuevo administrador (solo superadmins)
   */
  async createAdmin(adminData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: 'admin' | 'moderator';
  }): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No autenticado' };
      }

      const response = await api.post<AuthResponse>('/auth/create-admin', adminData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response;
    } catch (error) {
      console.error('Error creando admin:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  /**
   * Obtener información del admin actual
   */
  async getMe(): Promise<{ success: boolean; admin?: AdminUser; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No autenticado' };
      }

      const response = await api.get<{ success: boolean; admin?: AdminUser }>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.success && response.admin) {
        localStorage.setItem(this.ADMIN_KEY, JSON.stringify(response.admin));
      }

      return response;
    } catch (error) {
      console.error('Error obteniendo datos del admin:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  /**
   * Obtener headers de autorización para otras APIs
   */
  getAuthHeaders(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authAPI = new AuthAPI();
