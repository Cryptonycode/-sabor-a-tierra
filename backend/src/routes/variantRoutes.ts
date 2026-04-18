import { Router, Request, Response } from 'express';
import { VariantService } from '../services/variantService';

const router = Router();

// GET /api/products/:productId/variants - Obtener todas las variantes de un producto
router.get('/products/:productId/variants', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const variants = await VariantService.getVariantsByProductId(productId);
    return res.json(variants);
  } catch (error) {
    console.error('Error al obtener variantes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/variants/:id - Obtener una variante por ID
router.get('/variants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variant = await VariantService.getVariantById(id);

    if (!variant) {
      return res.status(404).json({ error: 'Variante no encontrada' });
    }

    return res.json(variant);
  } catch (error) {
    console.error('Error al obtener variante:', error);
    return res.status(500).json({ message: 'Error al obtener las variantes del producto' });
  }
});

// POST /api/products/:productId/variants - Crear nueva variante
router.post('/products/:productId/variants', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const variantData = { ...req.body, product_id: productId };
    const variant = await VariantService.createVariant(variantData);
    return res.status(201).json(variant);
  } catch (error) {
    console.error('Error al crear variante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/variants/:id - Actualizar variante
router.put('/variants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const variantData = req.body;
    const variant = await VariantService.updateVariant(id, variantData);
    return res.json(variant);
  } catch (error) {
    console.error('Error al actualizar variante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// DELETE /api/variants/:id - Eliminar variante
router.delete('/variants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await VariantService.deleteVariant(id);
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar variante:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/products/:productId/variants/batch - Crear múltiples variantes
router.post('/products/:productId/variants/batch', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const variants = req.body.variants.map((v: any) => ({ ...v, product_id: productId }));
    const createdVariants = await VariantService.createVariantsBatch(variants);
    return res.status(201).json(createdVariants);
  } catch (error) {
    console.error('Error al crear variantes:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

