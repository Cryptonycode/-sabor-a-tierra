import { Router, Request, Response } from 'express';
import { FarmerService } from '../services/farmerService';

const router = Router();

// GET /api/farmers - Obtener todos los agricultores
router.get('/', async (req: Request, res: Response) => {
  try {
    const { include_inactive } = req.query;
    const farmers = await FarmerService.getAllFarmers(include_inactive === 'true');
    return res.json(farmers);
  } catch (error) {
    console.error('Error al obtener agricultores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/:id - Obtener agricultor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { include_products } = req.query;
    
    let farmer;
    if (include_products === 'true') {
      farmer = await FarmerService.getFarmerWithProducts(id);
    } else {
      farmer = await FarmerService.getFarmerById(id);
    }

    if (!farmer) {
      return res.status(404).json({ error: 'Agricultor no encontrado' });
    }

    return res.json(farmer);
  } catch (error) {
    console.error('Error al obtener agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmers - Crear nuevo agricultor
router.post('/', async (req: Request, res: Response) => {
  try {
    const farmerData = req.body;
    const farmer = await FarmerService.createFarmer(farmerData);
    return res.status(201).json(farmer);
  } catch (error) {
    console.error('Error al crear agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/farmers/:id - Actualizar agricultor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const farmer = await FarmerService.updateFarmer(id, updateData);
    return res.json(farmer);
  } catch (error) {
    console.error('Error al actualizar agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/farmers/:id - Eliminar agricultor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await FarmerService.deleteFarmer(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmers/:id/approve - Aprobar agricultor
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { admin_id } = req.body;
    
    if (!admin_id) {
      return res.status(400).json({ error: 'admin_id es requerido' });
    }

    const farmer = await FarmerService.approveFarmer(id, admin_id);
    return res.json(farmer);
  } catch (error) {
    console.error('Error al aprobar agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmers/:id/reject - Rechazar agricultor
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const farmer = await FarmerService.rejectFarmer(id);
    return res.json(farmer);
  } catch (error) {
    console.error('Error al rechazar agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/farmers/:id/suspend - Suspender agricultor
router.post('/:id/suspend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const farmer = await FarmerService.suspendFarmer(id);
    return res.json(farmer);
  } catch (error) {
    console.error('Error al suspender agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/specialty/:specialty - Obtener agricultores por especialidad
router.get('/specialty/:specialty', async (req: Request, res: Response) => {
  try {
    const { specialty } = req.params;
    const farmers = await FarmerService.getFarmersBySpecialty(specialty);
    return res.json(farmers);
  } catch (error) {
    console.error('Error al obtener agricultores por especialidad:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/province/:province - Obtener agricultores por provincia
router.get('/province/:province', async (req: Request, res: Response) => {
  try {
    const { province } = req.params;
    const farmers = await FarmerService.getFarmersByProvince(province);
    return res.json(farmers);
  } catch (error) {
    console.error('Error al obtener agricultores por provincia:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/search/:query - Buscar agricultores
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const farmers = await FarmerService.searchFarmers(query);
    return res.json(farmers);
  } catch (error) {
    console.error('Error al buscar agricultores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/pending/all - Obtener agricultores pendientes
router.get('/pending/all', async (req: Request, res: Response) => {
  try {
    const farmers = await FarmerService.getPendingFarmers();
    return res.json(farmers);
  } catch (error) {
    console.error('Error al obtener agricultores pendientes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/:id/products - Obtener productos de un agricultor
router.get('/:id/products', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const products = await FarmerService.getFarmerProducts(id);
    return res.json(products);
  } catch (error) {
    console.error('Error al obtener productos del agricultor:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/farmers/stats - Obtener estadísticas de agricultores
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await FarmerService.getFarmerStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de agricultores:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
