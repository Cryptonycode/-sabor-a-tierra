import { Router, Request, Response } from 'express';
import { FarmerApplicationService } from '../services/farmerApplicationService';

const router = Router();

// POST /api/farmer-applications - Crear nueva aplicación
router.post('/', async (req: Request, res: Response) => {
  try {
    const applicationData = req.body;
    
    // Verificar si ya existe una aplicación para este email
    const existingApplication = await FarmerApplicationService.checkExistingApplication(applicationData.email);
    if (existingApplication) {
      return res.status(400).json({ 
        error: 'Ya existe una aplicación activa para este email' 
      });
    }

    const application = await FarmerApplicationService.createApplication(applicationData);
    return res.status(201).json(application);
  } catch (error) {
    console.error('Error al crear aplicación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications - Obtener todas las aplicaciones
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    let applications;
    if (status) {
      applications = await FarmerApplicationService.getApplicationsByStatus(status as any);
    } else {
      applications = await FarmerApplicationService.getAllApplications();
    }
    
    return res.json(applications);
  } catch (error) {
    console.error('Error al obtener aplicaciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications/:id - Obtener aplicación por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const application = await FarmerApplicationService.getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: 'Aplicación no encontrada' });
    }

    return res.json(application);
  } catch (error) {
    console.error('Error al obtener aplicación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications/pending/all - Obtener aplicaciones pendientes
router.get('/pending/all', async (req: Request, res: Response) => {
  try {
    const applications = await FarmerApplicationService.getPendingApplications();
    return res.json(applications);
  } catch (error) {
    console.error('Error al obtener aplicaciones pendientes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmer-applications/:id/approve - Aprobar aplicación
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewed_by, admin_notes } = req.body;
    
    if (!reviewed_by) {
      return res.status(400).json({ error: 'reviewed_by es requerido' });
    }

    const result = await FarmerApplicationService.approveApplication(id, reviewed_by, admin_notes);
    return res.json(result);
  } catch (error) {
    console.error('Error al aprobar aplicación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmer-applications/:id/reject - Rechazar aplicación
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewed_by, admin_notes } = req.body;
    
    if (!reviewed_by) {
      return res.status(400).json({ error: 'reviewed_by es requerido' });
    }
    
    if (!admin_notes) {
      return res.status(400).json({ error: 'admin_notes es requerido para rechazar' });
    }

    const application = await FarmerApplicationService.rejectApplication(id, reviewed_by, admin_notes);
    return res.json(application);
  } catch (error) {
    console.error('Error al rechazar aplicación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmer-applications/:id/review - Marcar como en revisión
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewed_by } = req.body;
    
    if (!reviewed_by) {
      return res.status(400).json({ error: 'reviewed_by es requerido' });
    }

    const application = await FarmerApplicationService.markAsReviewing(id, reviewed_by);
    return res.json(application);
  } catch (error) {
    console.error('Error al marcar aplicación en revisión:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications/search/:query - Buscar aplicaciones
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const applications = await FarmerApplicationService.searchApplications(query);
    return res.json(applications);
  } catch (error) {
    console.error('Error al buscar aplicaciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications/email/:email - Obtener aplicaciones por email
router.get('/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const applications = await FarmerApplicationService.getApplicationsByEmail(email);
    return res.json(applications);
  } catch (error) {
    console.error('Error al obtener aplicaciones por email:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/farmer-applications/:id - Eliminar aplicación
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FarmerApplicationService.deleteApplication(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar aplicación:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmer-applications/stats - Obtener estadísticas de aplicaciones
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await FarmerApplicationService.getApplicationStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de aplicaciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
