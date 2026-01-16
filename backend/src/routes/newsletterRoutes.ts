import { Router, Request, Response } from 'express';
import { NewsletterService } from '../services/newsletterService';
import { RegistrationService } from '../services/registrationService';

const router = Router();

// POST /api/newsletter/subscribe - Suscribirse al newsletter
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const subscriptionData = req.body;
    
    // Usar el servicio unificado de registro
    // Esto creará el cliente si no existe y enviará el email con cupón
    const result = await RegistrationService.subscribeToNewsletterOnly({
      email: subscriptionData.email,
      first_name: subscriptionData.first_name,
      last_name: subscriptionData.last_name,
      interests: subscriptionData.interests,
      frequency: subscriptionData.frequency
    });
    
    if (result.status === 'already_exists') {
      return res.status(200).json({ 
        message: result.message,
        alreadyRegistered: true,
        customer: result.customer
      });
    }
    
    return res.status(201).json({
      message: result.message,
      customer: result.customer,
      discountCode: result.discountCode,
      alreadyRegistered: false
    });
  } catch (error) {
    console.error('Error al suscribirse al newsletter:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/newsletter/unsubscribe - Cancelar suscripción
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    await NewsletterService.unsubscribe(email);
    return res.json({ message: 'Suscripción cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/confirm/:token - Confirmar suscripción
router.get('/confirm/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const subscription = await NewsletterService.confirmSubscription(token);
    return res.json({
      message: 'Suscripción confirmada exitosamente',
      subscription
    });
  } catch (error) {
    console.error('Error al confirmar suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/newsletter/preferences - Actualizar preferencias
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const { email, ...preferences } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const subscription = await NewsletterService.updatePreferences(email, preferences);
    return res.json(subscription);
  } catch (error) {
    console.error('Error al actualizar preferencias:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/subscriptions - Obtener todas las suscripciones (admin)
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const { active_only } = req.query;
    
    let subscriptions;
    if (active_only === 'true') {
      subscriptions = await NewsletterService.getActiveSubscriptions();
    } else {
      subscriptions = await NewsletterService.getAllSubscriptions();
    }
    
    return res.json(subscriptions);
  } catch (error) {
    console.error('Error al obtener suscripciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/subscription/:email - Obtener suscripción por email
router.get('/subscription/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const subscription = await NewsletterService.getSubscriptionByEmail(email);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Suscripción no encontrada' });
    }
    
    return res.json(subscription);
  } catch (error) {
    console.error('Error al obtener suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/interest/:interest - Obtener suscripciones por interés
router.get('/interest/:interest', async (req: Request, res: Response) => {
  try {
    const { interest } = req.params;
    const subscriptions = await NewsletterService.getSubscriptionsByInterest(interest);
    return res.json(subscriptions);
  } catch (error) {
    console.error('Error al obtener suscripciones por interés:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/frequency/:frequency - Obtener suscripciones por frecuencia
router.get('/frequency/:frequency', async (req: Request, res: Response) => {
  try {
    const { frequency } = req.params;
    const subscriptions = await NewsletterService.getSubscriptionsByFrequency(frequency);
    return res.json(subscriptions);
  } catch (error) {
    console.error('Error al obtener suscripciones por frecuencia:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/newsletter/mark-sent - Marcar emails como enviados
router.post('/mark-sent', async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'emails debe ser un array' });
    }

    await NewsletterService.markEmailSent(emails);
    return res.json({ message: 'Emails marcados como enviados' });
  } catch (error) {
    console.error('Error al marcar emails como enviados:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/search/:query - Buscar suscripciones
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const subscriptions = await NewsletterService.searchSubscriptions(query);
    return res.json(subscriptions);
  } catch (error) {
    console.error('Error al buscar suscripciones:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/newsletter/:id - Eliminar suscripción (admin)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await NewsletterService.deleteSubscription(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/stats - Obtener estadísticas del newsletter
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await NewsletterService.getNewsletterStats();
    return res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas del newsletter:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/newsletter/batch/:frequency - Obtener suscripciones para envío por lotes
router.get('/batch/:frequency', async (req: Request, res: Response) => {
  try {
    const { frequency } = req.params;
    const { interests, limit } = req.query;
    
    const interestsArray = interests ? (interests as string).split(',') : undefined;
    const limitNumber = limit ? parseInt(limit as string) : 100;
    
    const subscriptions = await NewsletterService.getSubscriptionsForBatch(
      frequency, 
      interestsArray, 
      limitNumber
    );
    
    return res.json(subscriptions);
  } catch (error) {
    console.error('Error al obtener suscripciones para lote:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
