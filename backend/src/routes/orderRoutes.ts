import { Router, Request, Response } from 'express';
import { OrderService } from '../services/orderService';

const router = Router();

// POST /api/orders - Crear nuevo pedido
router.post('/', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    
    // Validar datos requeridos
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ 
        error: 'Los items del pedido son requeridos' 
      });
    }

    if (!orderData.customer_info || !orderData.delivery_address) {
      return res.status(400).json({ 
        error: 'Información del cliente y dirección de entrega son requeridas' 
      });
    }

    const order = await OrderService.createOrder(orderData);
    
    // Enviar email de confirmación (simulado)
    console.log(`📧 Email de confirmación enviado a: ${orderData.customer_info.email}`);
    
    return res.status(201).json(order);
  } catch (error) {
    console.error('Error al crear pedido:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders/:id - Obtener pedido por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await OrderService.getOrderById(id);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    return res.json(order);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders - Obtener todos los pedidos (para admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, limit, offset } = req.query;
    
    const orders = await OrderService.getAllOrders({
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });
    
    return res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/orders/:id/status - Actualizar estado del pedido
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, updated_by } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }
    
    const order = await OrderService.updateOrderStatus(id, status, notes, updated_by);
    
    // Enviar notificación por email al cliente (simulado)
    console.log(`📧 Notificación de cambio de estado enviada para pedido ${id}: ${status}`);
    
    return res.json(order);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/orders/:id/cancel - Cancelar pedido
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, cancelled_by } = req.body;
    
    const order = await OrderService.cancelOrder(id, reason, cancelled_by);
    
    // Enviar notificación de cancelación (simulado)
    console.log(`📧 Notificación de cancelación enviada para pedido ${id}`);
    
    return res.json(order);
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/orders/:id/refund - Procesar reembolso
router.post('/:id/refund', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, reason, processed_by } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Cantidad de reembolso debe ser mayor a 0' });
    }
    
    const refund = await OrderService.processRefund(id, amount, reason, processed_by);
    
    // Procesar reembolso en pasarela de pago (simulado)
    console.log(`💰 Reembolso procesado para pedido ${id}: €${amount}`);
    
    return res.json(refund);
  } catch (error) {
    console.error('Error al procesar reembolso:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders/customer/:email - Obtener pedidos por email de cliente
router.get('/customer/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const orders = await OrderService.getOrdersByCustomerEmail(email);
    
    return res.json(orders);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/orders/track/:orderNumber - Rastrear pedido por número
router.get('/track/:orderNumber', async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;
    const order = await OrderService.getOrderByNumber(orderNumber);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Devolver solo información pública para tracking
    const trackingInfo = {
      order_number: order.order_number,
      order_status: order.status,
      estimated_delivery: order.estimated_delivery_date,
      tracking_number: order.tracking_number,
      created_at: order.created_at,
      timeline: order.timeline || []
    };
    
    return res.json(trackingInfo);
  } catch (error) {
    console.error('Error al rastrear pedido:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;