export default function AvisoLegalPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Aviso Legal</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Datos del responsable</h2>
        <p className="mb-3">
          En cumplimiento de la normativa vigente, se informa de que la titularidad de este sitio web corresponde a Sabor a Tierra.
        </p>
        <ul className="space-y-2">
          <li>
            <strong>Nombre:</strong> Sabor a Tierra
          </li>
          <li>
            <strong>NIF:</strong> B00000000
          </li>
          <li>
            <strong>Dirección:</strong> Calle Principal 123, 28000 Madrid, España
          </li>
          <li>
            <strong>Email:</strong> info@saboratierra.com
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Condiciones de uso</h2>
        <p>
          El acceso y uso de este sitio web atribuye la condición de usuario e implica la aceptación de las presentes condiciones. El usuario se compromete a utilizar la web, sus contenidos y servicios de forma lícita, diligente y respetuosa con la normativa aplicable, la buena fe y el orden público.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Propiedad intelectual</h2>
        <p>
          Los contenidos de este sitio web, incluyendo textos, imágenes, logotipos, diseños, código fuente y demás elementos, están protegidos por derechos de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación sin autorización expresa del titular, salvo en los casos legalmente permitidos.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Exclusión de garantías</h2>
        <p>
          Sabor a Tierra procura que la información publicada sea correcta y esté actualizada, aunque no garantiza la inexistencia de errores ni la disponibilidad permanente del sitio web. El titular no será responsable de los daños derivados del uso de la web, de interrupciones del servicio o de contenidos enlazados de terceros ajenos a su control.
        </p>
      </section>
    </main>
  );
}
