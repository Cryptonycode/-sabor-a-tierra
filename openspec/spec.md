# Especificación Técnica: Página de Contacto

## Descripción general
Se implementará una nueva página de contacto en el proyecto "Sabor a Tierra", utilizando Next.js con un formulario que permita a los usuarios enviar su nombre, correo electrónico y mensaje. La página seguirá el diseño global y la arquitectura del proyecto, asegurando la validación básica de los campos y un diseño responsivo según el UI kit existente.

## Casos de uso
- **Actor:** Usuario del sitio web
  - **Escenario:** El usuario accede a la página de contacto en `/contacto`.
    - **Flujo principal:**
      1. El usuario completa los campos de nombre, correo electrónico y mensaje.
      2. Valida los campos con reglas básicas (campos obligatorios, formato de email).
      3. Envía el formulario correctamente.
      4. Recibe feedback visual de confirmación o error.
  - **Flujo alternativo:** El usuario deja algún campo vacío o ingresa un formato de email incorrecto.
    - El sistema muestra mensajes de error al lado de los campos invalidos.

## Decisiones de arquitectura
- **Componentes a modificar:**
  - Crear un nuevo archivo para la página de contacto, `src/app/contacto/page.tsx`.
  - Posiblemente modificar estilos generales en `src/app/globals.css` si se requiere ajustar diseño global.

- **Patrones y dependencias:**
  - Usar React (Client Components) para el formulario por requerir interactividad.
  - Usar `TailwindCSS` para estilos y asegurarse de que los componentes sean responsivos.
  - Validación básica utilizando JavaScript nativo dentro del componente.
  - Asegurar que no se rompa el estado global a través de `<ClientLayoutWrapper>` en `src/components/layout/ClientLayoutWrapper.tsx`.

## Criterios de Aceptación y Testing
- **Archivo de test:** `src/tests/contacto.test.tsx`
  - **Funciones a testear:** Componente de Página de Contacto
  - **Escenarios clave:**
    1. **Happy Path:**
       - Rellenar todos los campos válidamente y enviar el formulario. Verificar visualización del mensaje de éxito.
    2. **Edge Cases:**
       - Probar envío con campos vacíos para asegurar que arrojen los mensajes de error apropiados.
       - Probar diferentes formatos de email incorrectos y comprobar que los mensajes de error sean mostrados.
    3. **Errores:**
       - Simular un fallo en el envío del formulario para asegurar el manejo de errores y que el usuario reciba el feedback visual apropiado.

- **Librerías de testing:** `jest`, `@testing-library/react`