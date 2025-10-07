import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

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

    const verification = authService.verifyToken(token);

    if (!verification.valid) {
      res.status(401).json({
        success: false,
        message: verification.error || 'Token inválido'
      });
      return;
    }

    // Verificar que el admin aún existe y está activo
    const admin = await authService.getAdminById(verification.admin.adminId);

    if (!admin) {
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
      const verification = authService.verifyToken(token);

      if (verification.valid) {
        const admin = await authService.getAdminById(verification.admin.adminId);
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
