import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

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

export default router;
