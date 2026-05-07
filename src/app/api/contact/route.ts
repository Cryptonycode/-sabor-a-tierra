import { NextRequest, NextResponse } from "next/server";

type ContactPayload = {
  nombre: string;
  correo: string;
  mensaje: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ContactPayload>;

    const nombre = body.nombre?.trim() ?? "";
    const correo = body.correo?.trim() ?? "";
    const mensaje = body.mensaje?.trim() ?? "";

    if (!nombre || !correo || !mensaje) {
      return NextResponse.json(
        {
          ok: false,
          error: "Por favor, completa todos los campos requeridos.",
        },
        { status: 400 },
      );
    }

    if (!emailRegex.test(correo)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Por favor, ingresa un correo electrónico válido.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Mensaje recibido correctamente.",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Solicitud inválida. Verifica el formato JSON enviado.",
      },
      { status: 400 },
    );
  }
}