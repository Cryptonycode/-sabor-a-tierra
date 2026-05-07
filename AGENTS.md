# 🤖 REGLAS MAESTRAS PARA AGENTES DE IA (Spec-Driven Development)

Este documento es la LEY del proyecto. Como Agente de IA, DEBES leer, comprender y acatar estas directrices antes de proponer, modificar o escribir una sola línea de código.

## 🏗️ 1. ARQUITECTURA ACTUAL (Líneas Rojas)
- **Frontend y Backend unificados:** El proyecto utiliza Next.js (App Router). Todo vive en la raíz del proyecto.
- **PROHIBIDO crear carpetas de backend separadas:** Recientemente eliminamos una arquitectura monorepo compleja. NO intentes recrear carpetas como `/backend`, `/api-server`, etc.
- **Base de Datos:** Usamos Supabase. La comunicación se hace directamente desde Next.js (usando Server Components o Server Actions) hacia Supabase. NO hay un servidor Node/Express intermedio.

# CONTEXTO DEL PROYECTO
- Proyecto: Sabor a Tierra
- Stack Tecnológico: Next.js 14, React, TailwindCSS, TypeScript.

# REGLAS DE ARQUITECTURA Y ENRUTAMIENTO
- Framework: Next.js 14 usando ESTRICTAMENTE App Router (`src/app/`). Prohibido usar o referenciar el paradigma antiguo `src/pages/`.
- Idioma de Rutas: Todas las rutas de Next.js (nombres de carpetas en `src/app/`) DEBEN estar en español y en minúsculas (ej. `contacto`, `productos`, `sobre-nosotros`), a menos que sea una ruta de API interna.
- Imports: Utilizar siempre alias de rutas absolutas (ej. `@/components/Header`) en lugar de rutas relativas (`../`).

# ESTRUCTURA DE COMPONENTES
- Los componentes base residen directamente en `src/components/` (estructura plana). NO inventar subdirectorios como `components/header/` o `components/footer/`.
- Los componentes de layout específicos (como wrappers) residen en `src/components/layout/`.

# GESTIÓN DE ESTADO Y LAYOUT PRINCIPAL (CRÍTICO)
- El archivo `src/app/layout.tsx` es un Server Component puro. NUNCA debe importar Providers de React Context ni componentes de UI como `<Header />` o `<Footer />` directamente.
- Todo el enrutamiento de estado global (Auth, Cart), navegación superior (Header), modales y Footer se maneja ESTRICTAMENTE a través del componente `<ClientLayoutWrapper>`. 
- El `layout.tsx` solo debe importar `ClientLayoutWrapper` desde `@/components/layout/ClientLayoutWrapper` y pasarle los `{children}` dentro del `<body>`. NUNCA sobrescribir el layout eliminando este wrapper.

# ESTILOS Y ASSETS
- Los estilos globales se importan en el layout principal usando la ruta relativa estricta de App Router (`import "./globals.css";` asumiendo que está en `src/app/`).
- Prohibido asumir la existencia de un directorio `src/styles/` a menos que se verifique explícitamente.

## 🛠️ 2. METODOLOGÍA: Spec-Driven Development (SDD)
- **No inventes requerimientos:** Debes basarte estrictamente en los documentos de especificaciones (Specs) proporcionados por el usuario.
- **Paso a paso:** Antes de codificar, analiza el Spec, haz preguntas aclaratorias si hay ambigüedades, y propón el plan arquitectónico. Solo escribe código cuando el usuario apruebe el plan.
- **Un problema a la vez:** Si estás asignado a crear una Feature "A", no modifiques código de la Feature "B" a menos que sea estrictamente necesario y hayas pedido permiso explícito.

## 💻 3. ESTÁNDARES DE CÓDIGO
- **Framework:** Next.js (App Router: `/app`).
- **Estilos:** Tailwind CSS. Mantén los estilos limpios y usa componentes reutilizables si es posible.
- **Tipado:** TypeScript estricto. Define interfaces/tipos precisos para los datos de Supabase (ej: `Product`, `Farmer`). No uses `any`.
- **Componentes:** Prefiere *Server Components* por defecto para fetching de datos. Usa `'use client'` SOLO cuando necesites interactividad (botones, hooks como `useState`, formularios).
- **Manejo de Errores:** Sé robusto. Todo fetch a Supabase o API local debe tener manejo de errores (`try/catch`) y proveer feedback visual al usuario en la UI si falla.

## 🗄️ 4. CONEXIÓN CON SUPABASE
- **Variables de Entorno:** Utiliza siempre `process.env.NEXT_PUBLIC_SUPABASE_URL` y `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`. Nunca "hardcodees" credenciales.
- **Seguridad (RLS):** Asume que Supabase tiene Row Level Security activado. Autentica las peticiones correctamente.
- **Cliente de Supabase:** Utiliza `@supabase/supabase-js` o `@supabase/ssr` (según se indique en los specs).

## 🌳 5. FLUJO DE TRABAJO (GitFlow)
- **`master`:** Producción. NUNCA toques esta rama directamente.
- **`develop`:** Entorno de integración.
- **Ramas de Feature:** Si vas a crear código, hazlo en ramas descriptivas derivadas de `develop` (ej: `feature/nombre-de-la-tarea` o `fix/descripcion-del-bug`).
- **Commits:** Usa Conventional Commits obligatoriamente (`feat:`, `fix:`, `chore:`, `refactor:`).

---
