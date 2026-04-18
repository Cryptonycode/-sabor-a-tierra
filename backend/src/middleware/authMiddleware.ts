import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

// Extender el tipo Request para incluir admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware para verificar autenticación de administrador
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token de autorización requerido'
      });
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user?.email) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    const user = userData.user;
    const userEmail = user.email;
    if (!userEmail) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;

    if (metaRole && ['superadmin', 'admin', 'moderator'].includes(metaRole)) {
      req.admin = {
        id: user.id,
        email: userEmail,
        role: metaRole
      };
      next();
      return;
    }

    // Fallback temporal para admins legacy en tabla personalizada.
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admins')
      .select('id, email, role, is_active')
      .eq('email', userEmail)
      .eq('is_active', true)
      .single();

    if (adminError || !admin) {
      res.status(401).json({
        success: false,
        message: 'Administrador no encontrado o inactivo'
      });
      return;
    }

    // Agregar información del admin al request
    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    next();
  };
};

/**
 * Middleware solo para superadmins
 */
export const requireSuperAdmin = requireRole(['superadmin']);

/**
 * Middleware para admins y superadmins
 */
export const requireAdmin = requireRole(['admin', 'superadmin']);

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: userData } = await supabaseAdmin.auth.getUser(token);

      if (userData.user?.email) {
        const user = userData.user;
        const userEmail = user.email;
        if (!userEmail) {
          next();
          return;
        }
        const metaRole = user.app_metadata?.role || user.user_metadata?.role;
        if (metaRole && ['superadmin', 'admin', 'moderator'].includes(metaRole)) {
          req.admin = {
            id: user.id,
            email: userEmail,
            role: metaRole
          };
          next();
          return;
        }

        const { data: admin } = await supabaseAdmin
          .from('admins')
          .select('id, email, role, is_active')
          .eq('email', userEmail)
          .eq('is_active', true)
          .single();

        if (admin) {
          req.admin = {
            id: admin.id,
            email: admin.email,
            role: admin.role
          };
        }
      }
    }

    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};
