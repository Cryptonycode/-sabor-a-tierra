import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';

// Importar configuración de Supabase
import './config/supabase';

// Importar rutas
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import customerRoutes from './routes/customerRoutes';
import farmerRoutes from './routes/farmerRoutes';
import farmerApplicationRoutes from './routes/farmerApplicationRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import uploadsRoutes from './routes/uploadsRoutes';

// Configuración de variables de entorno
dotenv.config();

// Configuración de Express
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Configuración de Passport para OAuth (solo si hay credenciales)
const hasGoogleOAuth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasFacebookOAuth = Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

if (hasGoogleOAuth) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        // TODO: Implementar lógica de autenticación con Google usando Supabase Auth
        return done(null, profile);
      }
    )
  );
  console.log('🔐 Google OAuth habilitado');
} else {
  console.warn('⚠️  Google OAuth no configurado. Defina GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET para habilitarlo.');
}

if (hasFacebookOAuth) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID as string,
        clientSecret: process.env.FACEBOOK_APP_SECRET as string,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/auth/facebook/callback',
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        // TODO: Implementar lógica de autenticación con Facebook usando Supabase Auth
        return done(null, profile);
      }
    )
  );
  console.log('🔐 Facebook OAuth habilitado');
} else {
  console.warn('⚠️  Facebook OAuth no configurado. Defina FACEBOOK_APP_ID y FACEBOOK_APP_SECRET para habilitarlo.');
}

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products', require('./routes/variantRoutes').default); // Rutas de variantes
app.use('/api', require('./routes/variantRoutes').default); // Rutas de variantes por ID
app.use('/api/uploads', uploadsRoutes); // Rutas de subida de imágenes
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/farmer-applications', farmerApplicationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Sabor a Tierra con Supabase',
    version: '2.0.0',
    database: 'Supabase'
  });
});

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

// Inicialización del servidor
const server = app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`🗄️  Base de datos: Supabase`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app; 