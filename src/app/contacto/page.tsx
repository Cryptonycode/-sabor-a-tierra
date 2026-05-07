"use client";

import { FormEvent, useState } from "react";

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const correoLimpio = correo.trim();
    const mensajeLimpio = mensaje.trim();

    if (!nombreLimpio || !correoLimpio || !mensajeLimpio) {
      setError("Por favor, completa todos los campos.");
      setEnviado(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoLimpio)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      setEnviado(false);
      return;
    }

    setError("");
    setEnviado(false);
    setEnviando(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreLimpio,
          correo: correoLimpio,
          mensaje: mensajeLimpio,
        }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error ?? "No se pudo enviar el mensaje. Inténtalo nuevamente.",
        );
      }

      setEnviado(true);
      setNombre("");
      setCorreo("");
      setMensaje("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error de red al enviar el mensaje. Inténtalo nuevamente.";
      setError(message);
      setEnviado(false);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-visible px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <section className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-md p-5 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-4">
          Contacto
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          ¿Tienes alguna consulta? Completa el siguiente formulario y te
          responderemos pronto.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
          <div>
            <label htmlFor="nombre" className="form-label">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="input-field"
              placeholder="Tu nombre"
              disabled={enviando}
            />
          </div>

          <div>
            <label htmlFor="correo" className="form-label">
              Correo electrónico
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="input-field"
              placeholder="tu@email.com"
              disabled={enviando}
            />
          </div>

          <div>
            <label htmlFor="mensaje" className="form-label">
              Mensaje
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              required
              rows={5}
              className="input-field min-h-[120px] resize-y"
              placeholder="Escribe tu mensaje aquí..."
              disabled={enviando}
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="btn-primary w-full sm:w-auto inline-flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {enviando ? "Enviando..." : "Enviar mensaje"}
          </button>

          {error && <p className="text-sm mt-3 text-red-600">{error}</p>}

          {enviado && !error && (
            <p className="text-sm mt-3 text-green-600">
              ¡Gracias! Tu mensaje ha sido enviado correctamente.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}