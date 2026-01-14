import { Router, Request, Response } from 'express';
import { CustomerService } from '../services/customerService';
import { sendWelcomeEmail, sendSecureAccessEmail } from '../services/emailService';
import { seedWelcomeDiscount } from '../scripts/seedWelcomeDiscount';

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
    const customer = await CustomerService.createCustomer(customerData);
    return res.status(201).json(customer);
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

// POST /api/customers/send-access-link - Enviar email de acceso seguro
router.post('/send-access-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'El email es requerido' 
      });
    }

    // Verificar si el cliente existe
    const customers = await CustomerService.searchCustomers(email);
    const existingCustomer = customers.find((c: any) => c.email.toLowerCase() === email.toLowerCase());

    // Generar token de acceso (aquí usarías JWT o similar en producción)
    const accessToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const accessLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify?token=${accessToken}`;

    // Enviar email
    const emailSent = await sendSecureAccessEmail(
      email,
      existingCustomer ? existingCustomer.first_name : '',
      accessLink
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Error al enviar el email'
      });
    }

    return res.json({
      success: true,
      message: 'Email de acceso enviado correctamente',
      isNewCustomer: !existingCustomer
    });

  } catch (error) {
    console.error('Error al enviar email de acceso:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/customers/register - Registrar nuevo cliente y enviar email de bienvenida
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, phone, sendWelcome = true } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'El email es requerido' 
      });
    }

    // Verificar si el cliente ya existe
    const customers = await CustomerService.searchCustomers(email);
    const existingCustomer = customers.find((c: any) => c.email.toLowerCase() === email.toLowerCase());

    let customer;

    if (existingCustomer) {
      console.log(`ℹ️ Cliente ${email} ya existe`);
      customer = existingCustomer;
    } else {
      // Crear nuevo cliente
      customer = await CustomerService.createCustomer({
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        phone: phone || ''
      });
      console.log(`✅ Nuevo cliente creado: ${email}`);
    }

    // Enviar email de bienvenida solo si es nuevo cliente y sendWelcome es true
    if (!existingCustomer && sendWelcome) {
      try {
        // Asegurar que existe el cupón BIENVENIDA10
        await seedWelcomeDiscount();

        // Enviar email de bienvenida
        await sendWelcomeEmail({
          firstName: customer.first_name || 'Cliente',
          email: customer.email,
          discountCode: 'BIENVENIDA10',
          discountPercentage: 10
        });

        console.log(`🎉 Email de bienvenida enviado a ${email}`);
      } catch (emailError) {
        console.error('⚠️ Error al enviar email de bienvenida (cliente creado correctamente):', emailError);
      }
    }

    return res.status(201).json({
      success: true,
      customer,
      isNewCustomer: !existingCustomer,
      welcomeEmailSent: !existingCustomer && sendWelcome
    });

  } catch (error) {
    console.error('Error al registrar cliente:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/customers/verify-welcome-discount - Verificar/crear cupón BIENVENIDA10
router.post('/verify-welcome-discount', async (req: Request, res: Response) => {
  try {
    const discount = await seedWelcomeDiscount();
    return res.json({
      success: true,
      discount
    });
  } catch (error) {
    console.error('Error al verificar cupón de bienvenida:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
