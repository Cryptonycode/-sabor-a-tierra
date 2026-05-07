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
    <main className="contact-shell">
      <section className="contact-card">
        <h1 className="contact-title">Contacto</h1>
        <p className="contact-description">
          ¿Tienes alguna consulta? Completa el siguiente formulario y te
          responderemos pronto.
        </p>

        <form onSubmit={handleSubmit} className="contact-form" noValidate>
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

          {error && <p className="form-feedback text-red-600">{error}</p>}

          {enviado && !error && (
            <p className="form-feedback text-green-600">
              ¡Gracias! Tu mensaje ha sido enviado correctamente.
            </p>
          )}
        </form>
      </section>
    </main>
  );
}