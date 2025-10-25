import { Router, Request, Response } from 'express';
import DiscountService from '../services/discountService';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// POST /api/discounts/generate-first-purchase
router.post('/generate-first-purchase', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requerido' });
    }

    // (Opcional) Verificar si ya existe un código para este email activo
    const { data: existing } = await supabaseAdmin
      .from('discount_codes')
      .select('code')
      .eq('customer_email', email)
      .eq('is_active', true)
      .lt('times_used', 1)
      .maybeSingle();

    if (existing?.code) {
      return res.json({ success: true, discountCode: existing.code });
    }

    // (Opcional) Añadir al newsletter si no existe
    const { data: sub } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id, is_active')
      .eq('email', email)
      .maybeSingle();
    if (!sub) {
      await supabaseAdmin
        .from('newsletter_subscriptions')
        .insert([{ email, is_active: true, confirmed: false }]);
    }

    const code = await DiscountService.createDiscountCode(email, 10);
    return res.json({ success: true, discountCode: code });
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


