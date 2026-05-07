import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Contacto from "@/components/Contacto";

describe("Contacto - Happy Path", () => {
  it("rellena todos los campos correctamente y envía el formulario mostrando mensaje de éxito", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    render(<Contacto />);

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const asuntoInput = screen.getByLabelText(/asunto/i);
    const mensajeInput = screen.getByLabelText(/mensaje/i);

    fireEvent.change(nombreInput, { target: { value: "Juan Pérez" } });
    fireEvent.change(emailInput, { target: { value: "juan.perez@email.com" } });
    fireEvent.change(asuntoInput, { target: { value: "Consulta general" } });
    fireEvent.change(mensajeInput, {
      target: { value: "Hola, este es un mensaje de prueba para contacto." },
    });

    const botonEnviar = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText(/mensaje enviado/i)).toBeInTheDocument();
    });
  });
});

describe("Contacto - Validaciones", () => {
  it("muestra mensajes de error al intentar enviar con campos vacíos", async () => {
    render(<Contacto />);

    const botonEnviar = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText(/nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/asunto es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/mensaje es requerido/i)).toBeInTheDocument();
    });
  });

  it("muestra error cuando el formato del correo electrónico es incorrecto", async () => {
    render(<Contacto />);

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const asuntoInput = screen.getByLabelText(/asunto/i);
    const mensajeInput = screen.getByLabelText(/mensaje/i);

    fireEvent.change(nombreInput, { target: { value: "Juan Pérez" } });
    fireEvent.change(emailInput, { target: { value: "correo-invalido" } });
    fireEvent.change(asuntoInput, { target: { value: "Consulta general" } });
    fireEvent.change(mensajeInput, {
      target: { value: "Hola, este es un mensaje de prueba para contacto." },
    });

    const botonEnviar = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });
});

describe("Contacto - Error de envío", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it("muestra feedback visual de error cuando falla el envío del formulario", async () => {
    render(<Contacto />);

    const nombreInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const asuntoInput = screen.getByLabelText(/asunto/i);
    const mensajeInput = screen.getByLabelText(/mensaje/i);

    fireEvent.change(nombreInput, { target: { value: "Juan Pérez" } });
    fireEvent.change(emailInput, { target: { value: "juan.perez@email.com" } });
    fireEvent.change(asuntoInput, { target: { value: "Consulta general" } });
    fireEvent.change(mensajeInput, {
      target: { value: "Hola, este es un mensaje de prueba para contacto." },
    });

    const botonEnviar = screen.getByRole("button", { name: /enviar/i });
    fireEvent.click(botonEnviar);

    await waitFor(() => {
      expect(screen.getByText(/no se pudo enviar/i)).toBeInTheDocument();
    });
  });
});