import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';

const router = Router();

// GET /api/products/featured - Obtener productos destacados
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, includeInactive } = req.query;

    let products;
    if (search) {
      products = await ProductService.searchProducts(search as string);
    } else if (category) {
      products = await ProductService.getProductsByCategory(category as string);
    } else {
      const includeAll = String(includeInactive).toLowerCase() === 'true';
      products = await ProductService.getAllProducts(includeAll);
    }

    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/products/:id - Obtener producto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
