-- ========================================
-- CONFIGURACIÓN INICIAL DE ADMINISTRADOR
-- ========================================

-- 1. Crear el primer administrador (cambiar email y contraseña)
INSERT INTO admins (
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role,
    is_active
) VALUES (
    'admin@saboratierra.com',  -- CAMBIAR POR TU EMAIL
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password123"
    'Administrador',
    'Principal',
    'superadmin',
    true
) ON CONFLICT (email) DO NOTHING;

-- 2. Función para autenticar administradores
CREATE OR REPLACE FUNCTION authenticate_admin(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE(
    id UUID,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    role VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.email,
        a.first_name,
        a.last_name,
        a.role,
        a.is_active
    FROM admins a
    WHERE a.email = p_email 
    AND a.is_active = true
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins 
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Función para crear nuevos administradores
CREATE OR REPLACE FUNCTION create_admin(
    p_email VARCHAR,
    p_password VARCHAR,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_role VARCHAR DEFAULT 'admin',
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_admin_id UUID;
BEGIN
    INSERT INTO admins (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        created_by,
        is_active
    ) VALUES (
        p_email,
        crypt(p_password, gen_salt('bf')),
        p_first_name,
        p_last_name,
        p_role,
        p_created_by,
        true
    ) RETURNING id INTO new_admin_id;
    
    RETURN new_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Función para cambiar contraseña de admin
CREATE OR REPLACE FUNCTION change_admin_password(
    p_admin_id UUID,
    p_old_password VARCHAR,
    p_new_password VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    password_valid BOOLEAN;
BEGIN
    -- Verificar contraseña actual
    SELECT EXISTS (
        SELECT 1 FROM admins 
        WHERE id = p_admin_id 
        AND password_hash = crypt(p_old_password, password_hash)
    ) INTO password_valid;
    
    IF NOT password_valid THEN
        RETURN FALSE;
    END IF;
    
    -- Actualizar contraseña
    UPDATE admins 
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_admin_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar que el admin se creó correctamente
SELECT id, email, first_name, last_name, role, is_active 
FROM admins 
WHERE email = 'admin@saboratierra.com';
