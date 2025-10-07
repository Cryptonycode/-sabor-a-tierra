-- ========================================
-- CREAR NUEVO ADMINISTRADOR
-- Email: saboratierra25@gmail.com
-- ========================================

-- Crear el nuevo administrador
INSERT INTO admins (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role,
    is_active
) VALUES (
    'saboratierra25@gmail.com',  -- Email específico solicitado
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password123"
    'Sabor',                     -- Cambiar por el nombre real
    'Tierra',                    -- Cambiar por el apellido real
    'superadmin',                -- Rol: 'superadmin', 'admin', o 'moderator'
    true
) ON CONFLICT (email) DO NOTHING;

-- Verificar que el admin se creó correctamente
SELECT 
    id, 
    email, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at
FROM admins 
WHERE email = 'saboratierra25@gmail.com';

