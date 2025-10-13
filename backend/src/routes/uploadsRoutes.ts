import { Router, Request, Response } from 'express';
import multer from 'multer';
import StorageService from '../services/storageService';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB para evitar errores por tamaño al probar
});

// POST /api/uploads/product-image (solo admin)
router.post('/product-image', requireAuth, (req: Request, res: Response) => {
  upload.single('image')(req as any, res as any, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Archivo demasiado grande (máx 25MB)' });
      }
      return res.status(400).json({ success: false, message: 'Error procesando archivo' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Archivo requerido' });
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes((req.file as any).mimetype)) {
        return res.status(400).json({ success: false, message: 'Formato de imagen no soportado' });
      }

      const { path, publicUrl } = await StorageService.uploadImage({
        bucket: 'productos',
        fileBuffer: (req.file as any).buffer,
        originalName: (req.file as any).originalname,
        mimeType: (req.file as any).mimetype as any,
        folder: (req.body as any).folder || undefined,
        convertToWebp: true,
      });

      return res.json({ success: true, path, publicUrl });
    } catch (error) {
      console.error('Error subiendo imagen de producto:', error);
      const message = error instanceof Error ? error.message : 'Error interno del servidor';
      return res.status(500).json({ success: false, message });
    }
  });
});

// POST /api/uploads/farmer-application (público)
router.post('/farmer-application', (req: Request, res: Response) => {
  upload.single('image')(req as any, res as any, async (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Archivo demasiado grande (máx 25MB)' });
      }
      return res.status(400).json({ success: false, message: 'Error procesando archivo' });
    }
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Archivo requerido' });
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes((req.file as any).mimetype)) {
        return res.status(400).json({ success: false, message: 'Formato de imagen no soportado' });
      }

      const folder = (req.body as any).folder || 'pending';
      const { path } = await StorageService.uploadImage({
        bucket: 'uploads-pendientes',
        fileBuffer: (req.file as any).buffer,
        originalName: (req.file as any).originalname,
        mimeType: (req.file as any).mimetype as any,
        folder,
        convertToWebp: true,
      });

      return res.json({ success: true, path });
    } catch (error) {
      console.error('Error subiendo imagen de solicitud de agricultor:', error);
      const message = error instanceof Error ? error.message : 'Error interno del servidor';
      return res.status(500).json({ success: false, message });
    }
  });
});

export default router;


