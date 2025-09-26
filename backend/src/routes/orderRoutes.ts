import { Router, Request, Response } from 'express';
import { OrderService } from '../services/orderService';

const router = Router();

// POST /api/orders - Crear nueva orden
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const order = await OrderService.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders - Obtener todas las órdenes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { customer_email } = req.query;

    let orders;
    if (customer_email) {
      orders = await OrderService.getOrdersByCustomerEmail(customer_email as string);
    } else {
      orders = await OrderService.getAllOrders();
    }

    res.json(orders);
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders/:id - Obtener orden por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Error al obtener orden:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PATCH /api/orders/:id/status - Actualizar estado de la orden
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    const order = await OrderService.updateOrderStatus(id, status);
    return res.json(order);
  } catch (error) {
    console.error('Error al actualizar estado de la orden:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/orders/:id - Eliminar orden
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await OrderService.deleteOrder(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar orden:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders/stats - Obtener estadísticas de órdenes
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await OrderService.getOrderStats();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
