export default function PoliticaCookiesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Política de Cookies</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">¿Qué son las cookies?</h2>
        <p>
          Las cookies son pequeños archivos que se almacenan en el dispositivo del usuario cuando visita un sitio web. Permiten recordar información sobre la navegación, mejorar el funcionamiento de la página y ofrecer una experiencia más personalizada y segura.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Tipos de cookies que utiliza esta web</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Cookies técnicas</h3>
            <p>
              Son necesarias para que la web funcione correctamente. Permiten, por ejemplo, mantener la sesión del usuario, recordar productos añadidos al carrito o aplicar medidas de seguridad durante la navegación.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Cookies analíticas</h3>
            <p>
              Ayudan a comprender cómo interactúan los usuarios con el sitio web mediante información agregada o estadística. Su finalidad es mejorar los contenidos, detectar errores y optimizar el rendimiento de la plataforma.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Cómo gestionar o desactivar las cookies en el navegador</h2>
        <p>
          El usuario puede permitir, bloquear o eliminar las cookies instaladas en su dispositivo desde la configuración de su navegador. Cada navegador ofrece opciones específicas para gestionar las cookies, normalmente disponibles en los apartados de privacidad, seguridad o configuración avanzada. La desactivación de determinadas cookies puede afectar al funcionamiento correcto de algunas funcionalidades de la web.
        </p>
      </section>
    </main>
  );
}
