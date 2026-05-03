# Especificación Técnica: Fix Mobile UI

## Descripción general
La corrección solicitada aborda dos problemas en la interfaz de usuario móvil. Primero, el texto del logo "Sabor a Tierra" se trunca en dispositivos móviles mostrándose solo como "sabor"; se ajustará el truncamiento mediante cambios en los tamaños de fuente según los breakpoints de Tailwind CSS. Segundo, el botón del menú hamburguesa no funciona correctamente; se implementará un estado para gestionar su apertura y cierre, mostrando así los enlaces de navegación.

## Casos de uso
1. **Actor:** Usuario móvil
   - **Escenario 1:** Visualiza el logo en la barra de navegación sin truncamiento.
     - **Flujo:** 
       - El usuario accede a la aplicación desde un dispositivo móvil.
       - El texto completo del logo "Sabor a Tierra" se muestra sin truncamiento.
   
2. **Actor:** Usuario móvil
   - **Escenario 2:** Interactúa con el menú hamburguesa.
     - **Flujo:** 
       - El usuario accede a la aplicación desde un dispositivo móvil.
       - El usuario hace clic en el botón de menú hamburguesa.
       - El menú despliega correctamente los enlaces de navegación.
       - Un segundo clic en el botón cierra el menú.

## Decisiones de arquitectura
- **Componentes a modificar:**
  - `src/app/components/Header.tsx`: Se realizará la actualización del estado para gestionar la apertura y cierre del menú hamburguesa y se ajustará el CSS de Tailwind para evitar el truncamiento del texto del logo.
  
- **Patrones a utilizar:**
  - Implementación de un estado local utilizando `useState` para manejar la lógica de apertura/cierre del menú hamburguesa.

- **Librerías y dependencias:**
  - Tailwind CSS para el manejo de los estilos.
  - Next.js con `use client` en `Header.tsx` para interactividad con el estado del menú.

- **Consideraciones de seguridad/estado:**
  - Asegurarse de que la manipulación del DOM sea segura y sólo suceda en el cliente.

## Criterios de Aceptación y Testing
1. **Archivo de test:** `src/app/components/__tests__/Header.test.tsx`

2. **Funciones a testear:**
   - Comportamiento del tamaño del texto del logo en diferentes breakpoints.
   - Lógica de apertura y cierre del menú hamburguesa.

3. **Escenarios clave:**
   - **Happy Path:**
     - Verificar que el tamaño del texto del logo se ajusta correctamente en dispositivos móviles.
     - Comprobar que el menú se abre y cierra al hacer clic en el botón hamburguesa.
   
   - **Edge Cases:**
     - Comportamiento del menú si se hace clic repetidamente en intervalos cortos.
     - Verificar el ajuste de texto del logo en diferentes resoluciones de pantalla móvil.
   
   - **Errores:**
     - Asegurar que no se lanzan errores de JavaScript al hacer clic en el botón de menú.
     - Verificar que el menú no se abre/cierra si el estado interno no cambia.

4. **Librerías de testing:**
   - Usar `@testing-library/react` y `@testing-library/jest-dom` para las pruebas unitarias correspondientes.