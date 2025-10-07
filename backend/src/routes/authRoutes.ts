import express from 'express';
import { authService } from '../services/authService';
import { requireAuth, requireSuperAdmin } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * POST /api/auth/login
 * Login de administrador
 */
router.post('/login', async (req, res): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Intentar login
    const result = await authService.loginAdmin({ email, password });

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/verify
 * Verificar token y obtener información del admin
 */
router.post('/verify', requireAuth, async (req, res): Promise<any> => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Obtener información completa del admin
    const admin = await authService.getAdminById(req.admin.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    return res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Error en verify:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del administrador actual
 */
router.post('/change-password', requireAuth, async (req, res): Promise<any> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const result = await authService.changePassword(
      req.admin.id,
      oldPassword,
      newPassword
    );

    return res.json(result);
  } catch (error) {
    console.error('Error en change-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/create-admin
 * Crear nuevo administrador (solo superadmins)
 */
router.post('/create-admin', requireAuth, requireSuperAdmin, async (req, res): Promise<any> => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    // Validar datos de entrada
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    if (role && !['admin', 'moderator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const result = await authService.createAdmin(
      { email, password, first_name, last_name, role },
      req.admin.id
    );

    return res.json(result);
  } catch (error) {
    console.error('Error en create-admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/auth/admins
 * Listar todos los administradores (solo superadmins)
 */
router.get('/admins', requireAuth, requireSuperAdmin, async (req, res): Promise<any> => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const admins = await authService.getAllAdmins(req.admin.id);

    if (admins === null) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta información'
      });
    }

    return res.json({
      success: true,
      admins
    });
  } catch (error) {
    console.error('Error en get admins:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del administrador actual
 */
router.get('/me', requireAuth, async (req, res): Promise<any> => {
  try {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    const admin = await authService.getAdminById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado'
      });
    }

    return res.json({
      success: true,
      admin
    });
  } catch (error) {
    console.error('Error en get me:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;
