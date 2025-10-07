import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { requireAuth, requireAdmin, requireSuperAdmin } from '../middleware/authMiddleware';

const router = Router();

// GET /api/admin/dashboard - Obtener estadísticas del dashboard
router.get('/dashboard', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await AdminService.getDashboardStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/activity - Obtener actividad reciente
router.get('/activity', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { limit } = req.query;
    const limitNumber = limit ? parseInt(limit as string) : 10;
    
    const activity = await AdminService.getRecentActivity(limitNumber);
    return res.json(activity);
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/sales-metrics - Obtener métricas de ventas
router.get('/sales-metrics', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const daysNumber = days ? parseInt(days as string) : 30;
    
    const metrics = await AdminService.getSalesMetrics(daysNumber);
    return res.json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas de ventas:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/product-metrics - Obtener métricas de productos
router.get('/product-metrics', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const metrics = await AdminService.getProductMetrics();
    return res.json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas de productos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/admins - Obtener todos los administradores
router.get('/admins', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;
    
    let admins;
    if (active_only === 'true') {
      admins = await AdminService.getActiveAdmins();
    } else {
      admins = await AdminService.getAllAdmins();
    }
    
    return res.json(admins);
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/admins/:id - Obtener administrador por ID
router.get('/admins/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = await AdminService.getAdminById(id);

    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }

    return res.json(admin);
  } catch (error) {
    console.error('Error al obtener administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/admin/admins - Crear nuevo administrador
router.post('/admins', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const adminData = req.body;
    const admin = await AdminService.createAdmin(adminData);
    return res.status(201).json(admin);
  } catch (error) {
    console.error('Error al crear administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/admin/admins/:id - Actualizar administrador
router.put('/admins/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const admin = await AdminService.updateAdmin(id, updateData);
    return res.json(admin);
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/admin/admins/:id - Eliminar administrador
router.delete('/admins/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AdminService.deleteAdmin(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/admin/admins/:id/toggle-status - Activar/Desactivar administrador
router.post('/admins/:id/toggle-status', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active debe ser un booleano' });
    }

    const admin = await AdminService.toggleAdminStatus(id, is_active);
    return res.json(admin);
  } catch (error) {
    console.error('Error al cambiar estado del administrador:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/admin/change-password - Cambiar contraseña
router.post('/change-password', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { admin_id, current_password, new_password } = req.body;
    
    if (!admin_id || !current_password || !new_password) {
      return res.status(400).json({ 
        error: 'admin_id, current_password y new_password son requeridos' 
      });
    }

    await AdminService.changePassword(admin_id, current_password, new_password);
    return res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/admin/verify-password - Verificar contraseña
router.post('/verify-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son requeridos' });
    }

    const admin = await AdminService.verifyPassword(email, password);
    
    if (!admin) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await AdminService.updateLastLogin(admin.id);
    
    return res.json(admin);
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/search/:query - Buscar administradores
router.get('/search/:query', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const admins = await AdminService.searchAdmins(query);
    return res.json(admins);
  } catch (error) {
    console.error('Error al buscar administradores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/admin/permissions/:id/:permission - Verificar permisos
router.get('/permissions/:id/:permission', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id, permission } = req.params;
    const hasPermission = await AdminService.hasPermission(id, permission);
    return res.json({ has_permission: hasPermission });
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
