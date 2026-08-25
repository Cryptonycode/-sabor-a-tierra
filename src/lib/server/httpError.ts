import { NextResponse } from 'next/server';

/** Error de dominio que los servicios lanzan para fijar el código HTTP de la respuesta. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const errorResponse = (error: unknown) => {
  if (error instanceof HttpError) {
    return NextResponse.json({ error: error.message, message: error.message }, { status: error.status });
  }

  return NextResponse.json(
    {
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    },
    { status: 500 }
  );
};
