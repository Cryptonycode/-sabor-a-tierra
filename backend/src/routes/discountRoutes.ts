import { Router, Request, Response } from 'express';
import DiscountService from '../services/discountService';
import { RegistrationService } from '../services/registrationService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// POST /api/discounts/generate-first-purchase
router.post('/generate-first-purchase', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requerido' });
    }

    // Usar el servicio unificado de registro
    // Esto manejará la creación del cliente, newsletter, cupón y envío de email
    const result = await RegistrationService.subscribeToNewsletterOnly({
      email
    });

    if (result.status === 'already_exists') {
      // El usuario ya existe, verificar si tiene un cupón BIENVENIDA10 activo sin usar
      const { data: existingCode } = await supabaseAdmin
        .from('discount_codes')
        .select('code')
        .eq('customer_email', email)
        .eq('is_active', true)
        .eq('times_used', 0)
        .ilike('code', 'BIENVENIDA10%')
        .maybeSingle();

      if (existingCode) {
        // Tiene un cupón activo sin usar
        return res.json({ 
          success: true, 
          discountCode: existingCode.code,
          message: 'Ya tienes un cupón de bienvenida activo'
        });
      } else {
        // Ya existe pero no tiene cupón disponible
        return res.json({ 
          success: false, 
          message: 'Este email ya está registrado y el cupón de bienvenida ya fue utilizado'
        });
      }
    }

    // Nuevo registro - cupón creado y email enviado
    return res.json({ 
      success: true, 
      discountCode: result.discountCode,
      message: result.message
    });
  } catch (error) {
    console.error('Error generando código de descuento:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/discounts/validate/:code
router.get('/validate/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const validation = await DiscountService.validateDiscountCode(code);
    return res.json(validation);
  } catch (error) {
    console.error('Error validando código:', error);
    return res.status(500).json({ isValid: false, percentage: null, error: 'Error interno del servidor' });
  }
});

export default router;


