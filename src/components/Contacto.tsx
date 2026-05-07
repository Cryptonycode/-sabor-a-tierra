'use client';

import React, { FormEvent, useState } from "react";

type EstadoFormulario = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

type ErroresFormulario = Partial<Record<keyof EstadoFormulario, string>>;

const initialState: EstadoFormulario = {
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contacto() {
  const [form, setForm] = useState<EstadoFormulario>(initialState);
  const [errors, setErrors] = useState<ErroresFormulario>({});
  const [feedback, setFeedback] = useState<string>("");

  const onChange =
    (field: keyof EstadoFormulario) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const validate = (): ErroresFormulario => {
    const nextErrors: ErroresFormulario = {};

    if (!form.nombre.trim()) nextErrors.nombre = "Nombre es requerido";
    if (!form.email.trim()) nextErrors.email = "Email es requerido";
    else if (!EMAIL_REGEX.test(form.email)) nextErrors.email = "Email inválido";
    if (!form.asunto.trim()) nextErrors.asunto = "Asunto es requerido";
    if (!form.mensaje.trim()) nextErrors.mensaje = "Mensaje es requerido";

    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback("");

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        setFeedback("No se pudo enviar");
        return;
      }

      setFeedback("Mensaje enviado");
      setForm(initialState);
    } catch {
      setFeedback("No se pudo enviar");
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="formulario de contacto">
      <div>
        <label htmlFor="nombre">Nombre</label>
        <input id="nombre" name="nombre" value={form.nombre} onChange={onChange("nombre")} />
        {errors.nombre && <p role="alert">{errors.nombre}</p>}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={form.email} onChange={onChange("email")} />
        {errors.email && <p role="alert">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="asunto">Asunto</label>
        <input id="asunto" name="asunto" value={form.asunto} onChange={onChange("asunto")} />
        {errors.asunto && <p role="alert">{errors.asunto}</p>}
      </div>

      <div>
        <label htmlFor="mensaje">Mensaje</label>
        <textarea id="mensaje" name="mensaje" value={form.mensaje} onChange={onChange("mensaje")} />
        {errors.mensaje && <p role="alert">{errors.mensaje}</p>}
      </div>

      <button type="submit">Enviar</button>

      {feedback && <p role="status">{feedback}</p>}
    </form>
  );
}