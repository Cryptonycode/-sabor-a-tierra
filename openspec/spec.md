# Especificación Técnica: Fix Scroll Bug en Página de Producto

## Descripción general
Se debe solucionar un bug en la página de producto de una aplicación Next.js que carga la vista por la mitad al acceder. La solución consiste en implementar un nuevo componente `ScrollToTop` que forzará el scroll al inicio de la página usando `window.scrollTo(0, 0)` sin cambiar la página de producto a un Client Component, manteniendo así la optimización SEO proporcionada por los Server Components.

## Casos de uso
- **Escenario principal:** 
  - Actor: Usuario que navega a una página de producto específica.
  - Flujo: 
    1. El usuario accede a la URL de un producto.
    2. La página se carga asegurando que la vista está posicionada al inicio.
- **Escenario de error:** 
  - Actor: Usuario que recarga la página o accede a través de un enlace.
  - Flujo: 
    1. El usuario accede o recarga la página.
    2. El componente `ScrollToTop` garantiza el posicionamiento correcto de la vista al inicio.

## Decisiones de arquitectura
- **Nuevo componente:** `src/components/ScrollToTop.tsx`
  - Componente funcional que usa `'use client'` y un `useEffect` para ejecutar `window.scrollTo(0, 0)` al montar.
- **Página de producto:** `src/app/product/[productId]/page.tsx`
  - Inyección del componente `ScrollToTop` antes del contenido principal de la página.
- **Consideraciones de seguridad/estado:** 
  - No es necesario almacenar estado ni interactuar con Supabase.
  - El uso de `window` se fragmenta en un componente separado para garantizar que la modificación del DOM se maneje desde un Client Component.

## Criterios de Aceptación y Testing
- No se planifican tests unitarios para el comportamiento de `window.scrollTo` debido a las restricciones del proyecto que prohíben los test directos para el scroll de ventanas.
- Testing deberá enfocarse en asegurar que la inyección del componente no genera errores en la aplicación y que no afecta el comportamiento del Server Component con los datos cargados desde Supabase.
  - **Archivo de pruebas:** `src/tests/ProductPage.test.tsx`
  - **Funciones a testear:**
    - Inyección del componente `ScrollToTop`
    - Verificación de que la página renderiza correctamente sin contenido desplazado.
  - **Escenarios clave:**
    - Happy path: Verificar la renderización de la página de producto sin errores.
    - Verificar que el `ScrollToTop` se monta sin errores y no interfiere con la carga de datos.