# 🤖 REGLAS MAESTRAS PARA AGENTES DE IA (Spec-Driven Development)

Este documento es la LEY del proyecto. Como Agente de IA, DEBES leer, comprender y acatar estas directrices antes de proponer, modificar o escribir una sola línea de código.

## 🏗️ 1. ARQUITECTURA ACTUAL (Líneas Rojas)
- **Frontend y Backend unificados:** El proyecto utiliza Next.js (App Router). Todo vive en la raíz del proyecto.
- **PROHIBIDO crear carpetas de backend separadas:** Recientemente eliminamos una arquitectura monorepo compleja. NO intentes recrear carpetas como `/backend`, `/api-server`, etc.
- **Base de Datos:** Usamos Supabase. La comunicación se hace directamente desde Next.js (usando Server Components o Server Actions) hacia Supabase. NO hay un servidor Node/Express intermedio.

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
