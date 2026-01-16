import { Router, Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { RegistrationService } from '../services/registrationService';

const router = Router();

// GET /api/customers - Obtener todos los clientes (solo admins)
router.get('/', async (req: Request, res: Response) => {
  try {
    const customers = await CustomerService.getAllCustomers();
    return res.json(customers);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/customers/:id - Obtener cliente por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.getCustomerById(id);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    return res.json(customer);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/customers - Crear nuevo cliente
router.post('/', async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    
    // Usar el servicio unificado de registro
    const result = await RegistrationService.registerCustomer(customerData);
    
    if (result.status === 'already_exists') {
      return res.status(409).json({ 
        error: 'Email ya registrado',
        message: result.message,
        customer: result.customer
      });
    }
    
    return res.status(201).json({
      customer: result.customer,
      discountCode: result.discountCode,
      message: result.message
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/customers/:id - Actualizar cliente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const customer = await CustomerService.updateCustomer(id, updateData);
    return res.json(customer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/customers/:id - Eliminar cliente
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CustomerService.deleteCustomer(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/customers/:id/verify-email - Verificar email del cliente
router.post('/:id/verify-email', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await CustomerService.verifyEmail(id);
    return res.json(customer);
  } catch (error) {
    console.error('Error al verificar email:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/customers/:id/orders - Obtener pedidos del cliente
router.get('/:id/orders', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orders = await CustomerService.getCustomerOrders(id);
    return res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/customers/search/:query - Buscar clientes
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const customers = await CustomerService.searchCustomers(query);
    return res.json(customers);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/customers/stats - Obtener estadísticas de clientes
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await CustomerService.getCustomerStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de clientes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
